import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xl font-bold text-white">
            K
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold leading-tight text-foreground">
              Hala Krašovská
            </div>
            <div className="text-xs text-muted">Plzeň-Bolevec</div>
          </div>
        </Link>
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface hover:text-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <MobileMenu />
      </nav>
    </header>
  );
}
