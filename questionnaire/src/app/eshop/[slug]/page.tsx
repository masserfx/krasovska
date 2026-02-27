import { Metadata } from "next";
import { sql } from "@vercel/postgres";
import { ensureTable } from "@/lib/db";
import ProductPageClient from "./ProductPageClient";

const BASE_URL = "https://hala-krasovska.vercel.app";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    await ensureTable();
    const { rows } = await sql`SELECT * FROM products WHERE slug = ${slug}`;
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Produkt nenalezen" };
  }

  return {
    title: product.name,
    description:
      product.description ||
      `${product.name} — ${product.price_czk} Kč. Osobní odběr zdarma v Hale Krasovská, Plzeň-Bolevec.`,
    openGraph: {
      title: `${product.name} — ${product.price_czk} Kč`,
      description:
        product.description ||
        `Kupte ${product.name} v e-shopu Haly Krasovská. Osobní odběr zdarma.`,
      url: `${BASE_URL}/eshop/${slug}`,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
    },
    alternates: {
      canonical: `/eshop/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              description: product.description || undefined,
              image: product.image_url || undefined,
              url: `${BASE_URL}/eshop/${slug}`,
              offers: {
                "@type": "Offer",
                price: product.price_czk,
                priceCurrency: "CZK",
                availability:
                  product.stock_quantity > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                seller: {
                  "@type": "Organization",
                  name: "Hala Krasovská",
                },
              },
            }),
          }}
        />
      )}
      <ProductPageClient />
    </>
  );
}
