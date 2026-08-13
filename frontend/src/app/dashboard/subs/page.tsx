"use client";

import { FeatureUnavailable } from "@/components/FeatureUnavailable";

/**
 * Subscriptions page — disabled.
 *
 * `subs.routes.ts` reads the `subscriptions` table, but neither the sync worker
 * nor the AI service ever inserts into it, so this page could only ever render
 * an empty list. The previous implementation (category filters, dead-subscription
 * detection, cards) is preserved in git history and can be restored once the
 * sender-domain aggregation exists to populate the table.
 */
export default function SubsPage() {
  return (
    <FeatureUnavailable
      title="Subscriptions"
      what="Subscription tracking would group recurring senders by domain and flag ones that have gone quiet."
    />
  );
}
