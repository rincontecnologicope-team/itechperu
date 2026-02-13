import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/catalog";
import { isFirebaseCatalogConfigured } from "@/lib/catalog-firebase";
import { DEFAULT_LANDING_CONTENT, getAdminLandingContent } from "@/lib/landing-content";
import type { LandingContent } from "@/types/landing-content";
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
  let landingContent: LandingContent = { ...DEFAULT_LANDING_CONTENT };

  if (catalogConnected) {
    try {
      [products, landingContent] = await Promise.all([
        getAdminProducts(),
        getAdminLandingContent(),
      ]);
    } catch (error) {
      console.error("No se pudieron cargar datos para admin:", error);
    }
  }

  return (
    <AdminDashboard
      initialProducts={products}
      initialLandingContent={landingContent}
      catalogConnected={catalogConnected}
    />
  );
}
