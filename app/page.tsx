import Link from "next/link";

export const metadata = {
  title: "eCenovnik — Lista za kupovinu",
  description: "Otvorite listu za kupovinu podeljenu iz eCenovnik aplikacije.",
};

export default function Home() {
  return (
    <main className="home-shell">
      <div className="brand-mark" aria-hidden="true">e</div>
      <p className="eyebrow">eCenovnik</p>
      <h1>Lista za kupovinu, uvek pri ruci.</h1>
      <p className="home-copy">
        Otvorite link koji vam je podeljen iz eCenovnik mobilne aplikacije da
        biste pregledali proizvode i količine.
      </p>
      <Link className="primary-link" href="https://ecenovnik.app">
        Saznajte više o eCenovniku
      </Link>
    </main>
  );
}
