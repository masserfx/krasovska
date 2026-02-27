import { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-shop — Sportovní potřeby pro badminton",
  description:
    "E-shop Haly Krasovská — rakety, košíčky, oblečení, obuv a doplňky pro badminton. Osobní odběr zdarma v Plzni-Bolevci.",
  openGraph: {
    title: "E-shop Hala Krasovská — Sportovní potřeby",
    description:
      "Rakety, košíčky, oblečení a doplňky pro badminton. Osobní odběr zdarma v Plzni-Bolevci.",
    url: "https://hala-krasovska.vercel.app/eshop",
  },
  alternates: {
    canonical: "/eshop",
  },
};

export default function EshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
