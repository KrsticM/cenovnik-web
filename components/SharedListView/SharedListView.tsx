"use client";

import { useEffect, useRef } from "react";
import { useShoppingListData, useSharedChecks, type ShoppingList } from "@/hooks";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Alert } from "@/components/ui/alert";
import { SharedHeader } from "../StatePage/SharedHeader";
import { SharedListCard } from "./SharedListCard";
import { SharedListError, SharedListNotFound } from "./SharedListMessages";
import { SharedListSkeleton } from "./SharedListSkeleton";

interface SharedListViewProps {
  token: string;
  // Server-rendered list; null when the server couldn't load it (the client then retries).
  initial: ShoppingList | null;
}

const NO_ITEMS: ShoppingList["items"] = [];

const listPadding = "mx-auto max-w-[760px] px-[clamp(16px,4vw,24px)] pb-16 pt-[clamp(20px,4vw,40px)]";

// Public list (/lista/[token]): live updates from the owner and shared "bought" ticks.
// Offline keeps the last version on screen; a full error page only appears when nothing loaded.
export function SharedListView({ token, initial }: SharedListViewProps) {
  const { list, loading, notFound, refresh, setItemChecked } = useShoppingListData(token, initial);
  const online = useOnlineStatus();
  const { checkedItems, toggleItem } = useSharedChecks(token, list?.items ?? NO_ITEMS, online, setItemChecked);

  // Catch up on changes missed while offline.
  const wasOnline = useRef(online);
  useEffect(() => {
    if (online && !wasOnline.current && list) void refresh(true);
    wasOnline.current = online;
  }, [online, list, refresh]);

  // Refresh indicator only while there is (or will be) a list to refresh.
  const hasNothingToRefresh = notFound || (!list && !loading);
  const headerStatus = hasNothingToRefresh ? "none" : online ? "live" : "paused";

  let content;
  if (notFound) {
    content = <SharedListNotFound />;
  } else if (list) {
    content = (
      <div className={listPadding}>
        {!online && (
          <Alert
            role="status"
            className="mb-3.5 flex animate-[fadeIn_200ms_ease_both] items-start gap-2.5 rounded-[12px] border-bar-idle bg-sand px-3.5 py-3 text-sm leading-[1.45] text-ink"
          >
            <span aria-hidden="true" className="mt-1.5 block h-2 w-2 shrink-0 rounded-full border-[1.5px] border-ink-faint" />
            Internet konekcija je izgubljena - prikazana je poslednja verzija liste. Osvežiće se kad se konekcija vrati.
          </Alert>
        )}
        <SharedListCard name={list.name} items={list.items} checkedItems={checkedItems} onToggle={toggleItem} />
      </div>
    );
  } else if (loading) {
    content = (
      <div className={listPadding}>
        <SharedListSkeleton />
      </div>
    );
  } else {
    content = <SharedListError onRetry={() => void refresh()} />;
  }

  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <SharedHeader status={headerStatus} />
      <main>{content}</main>
    </div>
  );
}
