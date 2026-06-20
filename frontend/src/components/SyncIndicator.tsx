"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader } from "lucide-react";
import { analytics } from "@/lib/api";

export function SyncIndicator() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkSyncStatus = async () => {
      try {
        const data = await analytics.syncStatus();
        setStatus(data);
        setLoading(false);

        // Show only if actively syncing
        if (data.status === "syncing") {
          setIsVisible(true);
        } else if (data.status === "completed" && isVisible) {
          // Auto-hide after 3 seconds when completed
          setTimeout(() => setIsVisible(false), 3000);
        }
      } catch (error) {
        console.error("Failed to get sync status:", error);
        setLoading(false);
      }
    };

    // Initial check
    checkSyncStatus();

    // Poll every 2 seconds if syncing
    const interval = setInterval(checkSyncStatus, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible || loading || !status) return null;

  const { stats } = status;
  const isComplete = stats.unprocessedEmails === 0;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : status.status === "failed" ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <Loader className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {isComplete ? "Sync Complete" : "Syncing Emails"}
          </h3>
        </div>

        {/* Progress */}
        {!isComplete && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">
                {stats.processedEmails} of {stats.totalEmails}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {stats.processingPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.processingPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          {isComplete ? (
            <>
              All {stats.totalEmails} emails processed ✓
            </>
          ) : status.status === "failed" ? (
            <>Sync failed. Please try again.</>
          ) : (
            <>
              Processing {stats.unprocessedEmails} remaining emails...
            </>
          )}
        </p>

        {/* Categories */}
        {isComplete && status.categories && (
          <div className="text-xs text-slate-600 dark:text-slate-400 grid grid-cols-2 gap-1">
            {Object.entries(status.categories)
              .slice(0, 4)
              .map(([category, count]) => (
                <div key={category}>
                  {category}: <span className="font-medium">{String(count)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
