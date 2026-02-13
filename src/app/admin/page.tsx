import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/catalog";
import { isFirebaseCatalogConfigured } from "@/lib/catalog-firebase";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  if (!isAdminAuthenticated()) {
    redirect("/admin/login");
  }

  const catalogConnected = isFirebaseCatalogConfigured();
  let products: Product[] = [];

  if (catalogConnected) {
    try {
      products = await getAdminProducts();
    } catch (error) {
      console.error("No se pudieron cargar productos para admin:", error);
    }
  }

  return <AdminDashboard initialProducts={products} catalogConnected={catalogConnected} />;
}
