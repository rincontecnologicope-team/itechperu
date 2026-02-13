export interface WhatsAppClickEventInput {
  source: string;
  href: string;
  productId?: string;
  productName?: string;
  price?: number;
  pagePath?: string;
}

export interface WhatsAppSourceMetric {
  source: string;
  count: number;
}

export interface WhatsAppProductMetric {
  productName: string;
  count: number;
}

export interface WhatsAppMetrics {
  totalClicks: number;
  last7DaysClicks: number;
  last24HoursClicks: number;
  bySource: WhatsAppSourceMetric[];
  topProducts: WhatsAppProductMetric[];
}
