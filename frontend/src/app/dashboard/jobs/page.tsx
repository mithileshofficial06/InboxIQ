"use client";

import { FeatureUnavailable } from "@/components/FeatureUnavailable";

/**
 * Careers / job applications page — disabled.
 *
 * `jobs.routes.ts` reads and updates the `job_applications` table, but nothing
 * ever creates rows in it — extracting company, role and status from emails
 * requires an LLM pass that does not exist yet. The previous implementation is
 * preserved in git history.
 */
export default function JobsPage() {
  return (
    <FeatureUnavailable
      title="Careers"
      what="Application tracking would extract company, role and status from your job-related emails and follow each one through to an outcome."
    />
  );
}
