import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          iTech Peru
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-slate-950">
          Producto no encontrado
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          El enlace puede haber cambiado. Vuelve al catalogo para ver los productos
          disponibles.
        </p>
        <Link
          href="/#catalogo"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white"
        >
          Ver catalogo
        </Link>
      </div>
    </main>
  );
}
