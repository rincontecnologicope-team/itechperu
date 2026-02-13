export type HomeSectionKey = "testimonials" | "payments" | "faq";

export interface HomeSectionTestimonial {
  id: string;
  name: string;
  text: string;
  avatar: string;
  rating: number;
}

export interface HomeSectionFaq {
  id: string;
  question: string;
  answer: string;
}

export interface HomeSectionsContent {
  sectionOrder: HomeSectionKey[];
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  testimonials: HomeSectionTestimonial[];
  paymentsTitle: string;
  paymentsSubtitle: string;
  bankTitle: string;
  banks: string[];
  mobileTitle: string;
  mobileMethods: string[];
  cashOnDeliveryText: string;
  provinceShippingText: string;
  faqTitle: string;
  faqSubtitle: string;
  faqs: HomeSectionFaq[];
}
