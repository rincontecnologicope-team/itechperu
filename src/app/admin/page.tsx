import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/catalog";
import { isFirebaseCatalogConfigured } from "@/lib/catalog-firebase";
import {
  DEFAULT_HOME_SECTIONS_CONTENT,
  getAdminHomeSectionsContent,
} from "@/lib/home-sections-content";
import { DEFAULT_LANDING_CONTENT, getAdminLandingContent } from "@/lib/landing-content";
import { getWhatsAppMetrics } from "@/lib/whatsapp-analytics";
import type { HomeSectionsContent } from "@/types/home-sections";
import type { LandingContent } from "@/types/landing-content";
import type { Product } from "@/types/product";
import type { WhatsAppMetrics } from "@/types/whatsapp-analytics";

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
  let homeSectionsContent: HomeSectionsContent = { ...DEFAULT_HOME_SECTIONS_CONTENT };
  let whatsappMetrics: WhatsAppMetrics = {
    totalClicks: 0,
    last24HoursClicks: 0,
    last7DaysClicks: 0,
    bySource: [],
    topProducts: [],
  };

  if (catalogConnected) {
    try {
      [products, landingContent, homeSectionsContent, whatsappMetrics] = await Promise.all([
        getAdminProducts(),
        getAdminLandingContent(),
        getAdminHomeSectionsContent(),
        getWhatsAppMetrics(),
      ]);
    } catch (error) {
      console.error("No se pudieron cargar datos para admin:", error);
    }
  }

  return (
    <AdminDashboard
      initialProducts={products}
      initialLandingContent={landingContent}
      initialHomeSectionsContent={homeSectionsContent}
      initialWhatsAppMetrics={whatsappMetrics}
      catalogConnected={catalogConnected}
    />
  );
}
