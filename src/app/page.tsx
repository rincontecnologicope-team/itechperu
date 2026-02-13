import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileWhatsAppBar } from "@/components/layout/mobile-whatsapp-bar";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PaymentMethodsSection } from "@/components/sections/payment-methods-section";
import { ProductGridSection } from "@/components/sections/product-grid-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { TrustSection } from "@/components/sections/trust-section";
import { UrgencySection } from "@/components/sections/urgency-section";
import { getCatalogProducts, getFeaturedProducts } from "@/lib/catalog";
import { getLandingContent } from "@/lib/landing-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, featuredProducts, landingContent] = await Promise.all([
    getCatalogProducts(),
    getFeaturedProducts(8),
    getLandingContent(),
  ]);

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection productCount={products.length} content={landingContent} />
      <ProductGridSection products={featuredProducts} content={landingContent} />
      <TrustSection content={landingContent} />
      <UrgencySection products={products} content={landingContent} />
      <TestimonialsSection />
      <PaymentMethodsSection />
      <FaqSection />
      <Footer />
      <MobileWhatsAppBar />
      <div className="h-20 md:hidden" aria-hidden />
    </main>
  );
}
