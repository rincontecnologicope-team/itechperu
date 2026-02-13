import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { siteConfig } from "@/config/site";
import { formatPen } from "@/lib/format";
import { getProductBySlug } from "@/lib/catalog";
import { calculateSimulatedStock } from "@/lib/stock";
import { createWhatsAppProductLink } from "@/lib/whatsapp";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Producto no encontrado",
    };
  }

  const title = `${product.name} - ${formatPen(product.price)}`;
  const description = `${product.summary} Equipo importado de USA, estado ${product.conditionLabel}, entrega segura y atencion inmediata por WhatsApp.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/producto/${product.slug}`,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const stock = calculateSimulatedStock(product.id, product.baseStock);
  const whatsappLink = createWhatsAppProductLink(product.name, product.price);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pt-10">
        <Link
          href="/#catalogo"
          className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600"
        >
          Volver al catalogo
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_35px_rgba(15,23,42,0.08)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {product.category}
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-slate-950">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.summary}</p>

            <div className="mt-6">
              <p className="text-4xl font-bold tracking-tight text-slate-950">
                {formatPen(product.price)}
              </p>
              {product.previousPrice ? (
                <p className="mt-2 text-base text-slate-400 line-through">
                  Antes {formatPen(product.previousPrice)}
                </p>
              ) : null}
              <p
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  stock <= 2 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                Stock de hoy: {stock} unidades
              </p>
            </div>

            <ul className="mt-6 grid gap-2">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="text-sm text-slate-700">
                  - {highlight}
                </li>
              ))}
            </ul>

            <div className="mt-7 grid gap-3">
              <WhatsAppLink
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                tracking={{
                  source: "product_detail_whatsapp",
                  productId: product.id,
                  productName: product.name,
                  price: product.price,
                }}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--color-whatsapp)] px-6 text-sm font-bold text-white transition hover:bg-[var(--color-whatsapp-dark)]"
              >
                Consultar por WhatsApp
              </WhatsAppLink>
              <Link
                href="/#confianza"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Ver politicas y garantias
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

