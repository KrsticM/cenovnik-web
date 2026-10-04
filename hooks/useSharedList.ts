import { useCallback, useEffect, useRef } from "react";
import type { SharedList, SharedListItem } from "@/lib/services/sharedList";
import { useOnlineStatus } from "./useOnlineStatus";
import { useSharedChecks, type CheckedItems } from "./useSharedChecks";
import { useSharedListData } from "./useSharedListData";

export type SharedListView =
  | { state: "not-found" }
  | { state: "loading" }
  | { state: "error" }
  | { state: "ready"; list: SharedList };

export type RefreshStatus = "live" | "paused" | "none";

interface UseSharedListReturn {
  view: SharedListView;
  online: boolean;
  refreshStatus: RefreshStatus;
  checkedItems: CheckedItems;
  toggleItem: (productId: string) => void;
  unsaved: boolean;
  retry: () => void;
}

const NO_ITEMS: SharedListItem[] = [];

export function useSharedList(token: string, initial: SharedList | null): UseSharedListReturn {
  const { list, loading, notFound, refresh, setItemChecked } = useSharedListData(token, initial);
  const online = useOnlineStatus();
  const onLinkLost = useCallback(() => void refresh(true), [refresh]);
  const { checkedItems, toggleItem, unsaved } = useSharedChecks({
    token,
    items: list?.items ?? NO_ITEMS,
    online,
    onSaved: setItemChecked,
    onLinkLost,
  });

  const wasOnline = useRef(online);
  useEffect(() => {
    if (online && !wasOnline.current && list) void refresh(true);
    wasOnline.current = online;
  }, [online, list, refresh]);

  let view: SharedListView;
  if (notFound) view = { state: "not-found" };
  else if (list) view = { state: "ready", list };
  else if (loading) view = { state: "loading" };
  else view = { state: "error" };

  const hasSomethingToRefresh = view.state === "ready" || view.state === "loading";
  const refreshStatus: RefreshStatus = !hasSomethingToRefresh ? "none" : online ? "live" : "paused";

  return { view, online, refreshStatus, checkedItems, toggleItem, unsaved, retry: () => void refresh() };
}
