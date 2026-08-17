import styles from "./PriceLedger.module.css";

export function PriceLedger() {
  const items = [
    {
      name: "Mleko 1L",
      stores: "Maxi 109 · Lidl 89",
      savings: "-18%",
    },
    {
      name: "Ulje 1L",
      stores: "IDEA 249 · Roda 219",
      savings: "-12%",
    },
    {
      name: "Jaja 10kom",
      stores: "DIS 189 · Maxi 159",
      savings: "-16%",
    },
  ];

  return (
    <div className={styles.ledger}>
      <p className={styles.eyebrow}>UPOREDI CENE</p>
      <h2 className={styles.title}>Ista korpa. Različita cena.</h2>
      <p className={styles.caption}>Primer poređenja cena</p>

      <ul className={styles.items}>
        {items.map((item, idx) => (
          <li key={idx} className={styles.item}>
            <div className={styles.info}>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.stores}>{item.stores}</p>
            </div>
            <div className={styles.badge}>{item.savings}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
