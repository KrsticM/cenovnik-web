"use client";

import { useSharedList } from "@/hooks";
import type { SharedList } from "@/lib/services/sharedList";
import { LiveStatus } from "../StatePage/LiveStatus";
import { SimpleHeader } from "../StatePage/SimpleHeader";
import { SharedListCard } from "./SharedListCard";
import { SharedListError, SharedListNotFound } from "./SharedListMessages";
import { OfflineNotice, UnsavedNotice } from "./SharedListNotices";
import { SharedListSkeleton } from "./SharedListSkeleton";

interface SharedListViewProps {
  token: string;
  initial: SharedList | null;
}

const listPadding = "container-narrow pb-16 pt-[clamp(20px,4vw,40px)]";

export function SharedListView({ token, initial }: SharedListViewProps) {
  const { view, online, refreshStatus, checkedItems, toggleItem, unsaved, retry } = useSharedList(token, initial);

  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <SimpleHeader width="narrow">
        <LiveStatus status={refreshStatus} />
      </SimpleHeader>
      <main>
        {view.state === "not-found" && <SharedListNotFound />}
        {view.state === "error" && <SharedListError onRetry={retry} />}
        {view.state === "loading" && (
          <div className={listPadding}>
            <SharedListSkeleton />
          </div>
        )}
        {view.state === "ready" && (
          <div className={listPadding}>
            {!online && <OfflineNotice />}
            {online && unsaved && <UnsavedNotice />}
            <SharedListCard
              name={view.list.name}
              items={view.list.items}
              checkedItems={checkedItems}
              onToggle={toggleItem}
            />
          </div>
        )}
      </main>
    </div>
  );
}
