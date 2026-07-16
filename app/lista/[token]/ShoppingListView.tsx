"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Item = { productId: string; productName: string; primaryBarcode: string; quantity: number };
type ShoppingList = { id: string; name: string; items: Item[] };
type RealtimeConfig = { url: string; anonKey: string };

export default function ShoppingListView({ token }: { token: string }) {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<{ name: string; barcode: string } | null>(null);
  const [realtimeConfig, setRealtimeConfig] = useState<RealtimeConfig | null>(null);

  const load = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    try {
      const response = await fetch(`/api/lista/${encodeURIComponent(token)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lista trenutno nije dostupna.");
      setList(data);
      setRealtimeConfig(data.realtime);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Lista trenutno nije dostupna.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!preview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [preview]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!list?.id || !realtimeConfig) return;

    const supabase = createClient(realtimeConfig.url, realtimeConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const channel = supabase
      .channel(`shared-list:${list.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_list_items", filter: `shopping_list_id=eq.${list.id}` },
        () => void load(true),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "shopping_lists", filter: `id=eq.${list.id}` },
        () => void load(true),
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [list?.id, realtimeConfig, load]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`ecenovnik-list:${token}`);
      if (saved) setCheckedItems(new Set(JSON.parse(saved) as string[]));
    } catch {
      setCheckedItems(new Set());
    }
  }, [token]);

  const toggleItem = (productId: string) => {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      window.localStorage.setItem(`ecenovnik-list:${token}`, JSON.stringify([...next]));
      return next;
    });
  };

  if (loading && !list) {
    return <main className="state-shell"><div><div className="loader" /><h1>Otvaramo listu…</h1><p>Učitavamo proizvode i količine.</p></div></main>;
  }

  if (error && !list) {
    return <main className="state-shell"><div><p className="eyebrow">eCenovnik</p><h1>Lista nije dostupna</h1><p>{error}</p><button className="retry-button" onClick={() => void load()}>Pokušaj ponovo</button></div></main>;
  }

  if (!list) return null;

  return (
    <main className="list-shell">
      <header className="list-header">
        <div className="mini-brand"><span className="brand-mark"><img className="brand-image" src="/icon.png" alt="" /></span><span>eCenovnik</span></div>
        <div className="live-note"><span className="live-dot" /><span>Automatski se osvežava</span></div>
      </header>
      <section className="list-card" aria-labelledby="list-title">
        <div className="list-title">
          <p className="eyebrow">Podeljena lista</p>
          <h1 id="list-title">{list.name}</h1>
          <p className="list-meta">{list.items.length === 1 ? "1 proizvod" : `${list.items.length} proizvoda`}</p>
        </div>
        {list.items.length ? (
          <ul className="items">
            {list.items.map((item) => (
              <li className={`item${checkedItems.has(item.productId) ? " item-checked" : ""}`} key={item.productId}>
                <button
                  className="item-check"
                  type="button"
                  aria-label={checkedItems.has(item.productId) ? `Vrati ${item.productName} na listu` : `Označi ${item.productName} kao kupljeno`}
                  aria-pressed={checkedItems.has(item.productId)}
                  onClick={() => toggleItem(item.productId)}
                >
                  <span aria-hidden="true">✓</span>
                </button>
                {item.primaryBarcode && (
                  <button
                    className="product-image-button"
                    type="button"
                    aria-label={`Prikaži veću sliku za ${item.productName}`}
                    onClick={() => setPreview({ name: item.productName, barcode: item.primaryBarcode })}
                  >
                    <img
                      className="product-image"
                      src={`https://img.cenovnik.krsticm.dev/images/products/${encodeURIComponent(item.primaryBarcode)}/thumb.jpg`}
                      alt=""
                      loading="lazy"
                      onError={(event) => { event.currentTarget.parentElement!.style.display = "none"; }}
                    />
                  </button>
                )}
                <div className="item-info">
                  <p className="item-name">{item.productName}</p>
                  {item.primaryBarcode && <p className="item-barcode">Barkod {item.primaryBarcode}</p>}
                </div>
                <span className="quantity" aria-label={`Količina ${item.quantity}`}>× {item.quantity}</span>
              </li>
            ))}
          </ul>
        ) : <div className="empty">Ova lista je trenutno prazna.</div>}
      </section>
      {preview && (
        <div className="image-dialog-backdrop" role="presentation" onMouseDown={() => setPreview(null)}>
          <section className="image-dialog" role="dialog" aria-modal="true" aria-labelledby="image-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="image-dialog-header">
              <h2 id="image-dialog-title">{preview.name}</h2>
              <button className="image-dialog-close" type="button" aria-label="Zatvori sliku" onClick={() => setPreview(null)}>×</button>
            </div>
            <div className="image-dialog-content">
              <img
                className="product-image-full"
                src={`https://img.cenovnik.krsticm.dev/images/products/${encodeURIComponent(preview.barcode)}/full.jpg`}
                alt={preview.name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = `https://img.cenovnik.krsticm.dev/images/products/${encodeURIComponent(preview.barcode)}/thumb.jpg`;
                }}
              />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
