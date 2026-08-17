"""
similarity_search is the query that decides which emails a RAG answer can see.
The scoping conditions in it are the last line of defense against one user's
question retrieving another user's mail, so they are asserted directly against
the generated SQL and parameter list.
"""

import pytest

from app.db.pgvector import PgVectorStore

EMBEDDING = [0.1] * 1024

ROW = (
    "chunk-uuid",
    "email-uuid",
    "the chunk text",
    0,
    "Subject line",
    "Sender Name",
    "sender@example.com",
    "2026-01-01T00:00:00+00:00",
    "Bills & Invoices",
    "neutral",
    0.87,
)


class FakeCursor:
    def __init__(self, rows):
        self._rows = rows
        self.executed = []
        self.rowcount = 1

    async def execute(self, query, params=None):
        self.executed.append((query, params))

    async def fetchall(self):
        return self._rows

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc_info):
        return False


class FakeConn:
    def __init__(self, rows=()):
        self._cursor = FakeCursor(list(rows))

    def cursor(self):
        return self._cursor


def make_store(rows=()):
    """A store wired to a fake connection — connect() is never called."""
    store = PgVectorStore()
    store.conn = FakeConn(rows)
    return store


def last_call(store):
    return store.conn._cursor.executed[-1]


# --- user scoping ---


async def test_search_always_scopes_on_both_user_id_columns():
    store = make_store([ROW])

    await store.similarity_search(EMBEDDING, "user-123")

    query, params = last_call(store)
    # Both sides of the join are scoped, so a mis-linked chunk cannot surface
    # another user's email metadata.
    assert "emb.user_id = %s" in query
    assert "e.user_id = %s" in query
    assert params[0] == "user-123"
    assert params[1] == "user-123"


async def test_search_without_filters_uses_only_the_base_conditions():
    store = make_store([ROW])

    await store.similarity_search(EMBEDDING, "user-123")

    query, params = last_call(store)
    assert "e.category = %s" not in query
    assert "e.date >= %s" not in query
    assert "e.date <= %s" not in query
    # user_id, user_id, embedding, embedding, top_k
    assert len(params) == 5


# --- optional filters ---


async def test_category_filter_adds_a_condition_and_param():
    store = make_store([ROW])

    await store.similarity_search(EMBEDDING, "user-123", category="Bills & Invoices")

    query, params = last_call(store)
    assert "e.category = %s" in query
    assert params[2] == "Bills & Invoices"


async def test_date_range_filters_add_conditions_in_order():
    store = make_store([ROW])

    await store.similarity_search(
        EMBEDDING, "user-123", date_from="2026-01-01", date_to="2026-02-01"
    )

    query, params = last_call(store)
    assert "e.date >= %s" in query
    assert "e.date <= %s" in query
    assert params[2] == "2026-01-01"
    assert params[3] == "2026-02-01"


async def test_all_filters_combine_with_params_in_the_expected_order():
    store = make_store([ROW])

    await store.similarity_search(
        EMBEDDING,
        "user-123",
        top_k=5,
        category="Newsletters",
        date_from="2026-01-01",
        date_to="2026-02-01",
    )

    _query, params = last_call(store)
    assert params[:4] == ["user-123", "user-123", "Newsletters", "2026-01-01"]
    assert params[4] == "2026-02-01"
    # Trailing params: the embedding twice (SELECT distance, ORDER BY), then the limit.
    assert params[-1] == 5
    assert params[-2] == params[-3] == str(EMBEDDING)


async def test_top_k_is_passed_as_the_limit():
    store = make_store([ROW])

    await store.similarity_search(EMBEDDING, "user-123", top_k=7)

    _query, params = last_call(store)
    assert params[-1] == 7


async def test_query_is_parameterized_not_interpolated():
    store = make_store([ROW])

    await store.similarity_search(EMBEDDING, "user-123", category="'; DROP TABLE emails;--")

    query, params = last_call(store)
    assert "DROP TABLE" not in query
    assert "'; DROP TABLE emails;--" in params


# --- result mapping ---


async def test_rows_map_to_the_canonical_result_keys():
    store = make_store([ROW])

    results = await store.similarity_search(EMBEDDING, "user-123")

    assert len(results) == 1
    assert results[0] == {
        "chunk_id": "chunk-uuid",
        "email_id": "email-uuid",
        "chunk_text": "the chunk text",
        "chunk_index": 0,
        "subject": "Subject line",
        "sender_name": "Sender Name",
        "sender_email": "sender@example.com",
        "received_at": "2026-01-01T00:00:00+00:00",
        "category": "Bills & Invoices",
        "sentiment": "neutral",
        "similarity": pytest.approx(0.87),
    }


async def test_null_received_at_maps_to_none():
    row = list(ROW)
    row[7] = None
    store = make_store([tuple(row)])

    results = await store.similarity_search(EMBEDDING, "user-123")

    assert results[0]["received_at"] is None


async def test_no_matches_returns_an_empty_list():
    store = make_store([])

    assert await store.similarity_search(EMBEDDING, "user-123") == []


# --- writes are user-scoped too ---


async def test_update_classification_is_scoped_by_user():
    store = make_store()

    updated = await store.update_email_classification(
        email_id="email-uuid",
        user_id="user-123",
        category="Promotions",
        sentiment="positive",
        sentiment_score=0.4,
    )

    query, params = last_call(store)
    assert "WHERE id = %s AND user_id = %s" in query
    assert params[-2:] == ("email-uuid", "user-123")
    assert updated is True


async def test_update_classification_reports_false_when_no_row_matched():
    store = make_store()
    store.conn._cursor.rowcount = 0

    updated = await store.update_email_classification(
        email_id="email-uuid",
        user_id="someone-else",
        category="Promotions",
        sentiment="positive",
        sentiment_score=0.4,
    )

    assert updated is False


async def test_mark_processed_is_scoped_by_user():
    store = make_store()

    await store.mark_email_processed("email-uuid", "user-123")

    query, params = last_call(store)
    assert "WHERE id = %s AND user_id = %s" in query
    assert params == ("email-uuid", "user-123")


async def test_mark_processed_reports_false_when_no_row_matched():
    store = make_store()
    store.conn._cursor.rowcount = 0

    assert await store.mark_email_processed("email-uuid", "someone-else") is False
