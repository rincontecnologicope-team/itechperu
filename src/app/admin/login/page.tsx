import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  if (isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          iTech Peru
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-slate-950">
          Acceso administrador
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Panel privado para actualizar productos, fotos y descripciones sin tocar codigo.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
