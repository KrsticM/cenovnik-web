"use client";

import { useCallback, useEffect, useState } from "react";

type Item = { productId: string; productName: string; primaryBarcode: string; quantity: number };
type ShoppingList = { id: string; name: string; items: Item[] };

export default function ShoppingListView({ token }: { token: string }) {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    try {
      const response = await fetch(`/api/lista/${encodeURIComponent(token)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lista trenutno nije dostupna.");
      setList(data);
      setError("");
      setUpdatedAt(new Date());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Lista trenutno nije dostupna.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(true), 15_000);
    return () => window.clearInterval(interval);
  }, [load]);

  if (loading && !list) {
    return <main className="state-shell"><div><div className="loader" /><h1>Otvaramo listu…</h1><p>Učitavamo proizvode i količine.</p></div></main>;
  }

  if (error && !list) {
    return <main className="state-shell"><div><p className="eyebrow">eCenovnik</p><h1>Lista nije dostupna</h1><p>{error}</p><button className="refresh-button" onClick={() => void load()}>Pokušaj ponovo</button></div></main>;
  }

  if (!list) return null;

  return (
    <main className="list-shell">
      <header className="list-header">
        <div className="mini-brand"><div className="brand-mark" aria-hidden="true">e</div><span>eCenovnik</span></div>
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
              <li className="item" key={item.productId}>
                <span className="item-check" aria-hidden="true" />
                <div className="item-info">
                  <p className="item-name">{item.productName}</p>
                  {item.primaryBarcode && <p className="item-barcode">Barkod {item.primaryBarcode}</p>}
                </div>
                <span className="quantity" aria-label={`Količina ${item.quantity}`}>× {item.quantity}</span>
              </li>
            ))}
          </ul>
        ) : <div className="empty">Ova lista je trenutno prazna.</div>}
        <footer className="list-footer">
          <span>{error ? "Osvežavanje nije uspelo" : updatedAt ? `Osveženo u ${updatedAt.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
          <button className="refresh-button" onClick={() => void load()}>Osveži</button>
        </footer>
      </section>
    </main>
  );
}
