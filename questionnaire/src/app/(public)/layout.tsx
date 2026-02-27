import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Hala Krasovská — Sportovní hala Plzeň-Bolevec",
    template: "%s | Hala Krasovská",
  },
};

const services = [
  { href: "/badminton", label: "Badminton" },
  { href: "/florbal", label: "Florbal" },
  { href: "/sauna", label: "Sauna" },
  { href: "/teambuilding", label: "Teambuilding" },
  { href: "/pronajem-haly", label: "Pronájem haly" },
  { href: "/bistro-krasovska", label: "Bistro" },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-foreground">
            Hala Krasovská
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {services.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="text-muted transition-colors hover:text-foreground"
              >
                {s.label}
              </Link>
            ))}
            <Link
              href="/eshop"
              className="text-muted transition-colors hover:text-foreground"
            >
              E-shop
            </Link>
            <Link
              href="/blog"
              className="text-muted transition-colors hover:text-foreground"
            >
              Blog
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <h3 className="mb-3 font-bold text-foreground">Hala Krasovská</h3>
            <p className="text-sm leading-relaxed text-muted">
              Sportovní hala v Plzni-Bolevci — badminton, florbal, sauna,
              víceúčelová plocha a bistro s vlastní kuchyní.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-bold text-foreground">Služby</h3>
            <ul className="space-y-1.5 text-sm">
              {services.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-muted hover:text-foreground"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-bold text-foreground">Kontakt</h3>
            <address className="space-y-1.5 text-sm not-italic text-muted">
              <p>Krašovská 32, 323 00 Plzeň-Bolevec</p>
              <p>
                <a
                  href="mailto:recepce@halakrasovska.cz"
                  className="hover:text-foreground"
                >
                  recepce@halakrasovska.cz
                </a>
              </p>
              <p>
                <a
                  href="https://www.facebook.com/halakrasovska"
                  className="hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </p>
            </address>
          </div>
        </div>
        <div className="border-t border-border px-4 py-4 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Hala Krasovská. Všechna práva
          vyhrazena.
        </div>
      </footer>
    </div>
  );
}
