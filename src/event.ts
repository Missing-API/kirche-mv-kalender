export interface TIcsEvent {
  type: "VEVENT";
  params?: any;
  uid: string;
  location: string;
  summary: string;
  description: string;
  start: any;
  startInputType: "local";
  datetype?: string;
  end: any;
  dtstamp: any;
  url: string;
  geo?: { lat: any; lon: any };
  class: string;
  method: "PUBLISH";
  organizer: any;
  categories?: string[];
  productId?: string;
  // Enriched fields from detail page
  detailedDescription?: string;
  imageUrl?: string;
  attachmentUrl?: string;
}

export interface TIcsEventWrite {
  uid: string;
  location: string;
  title: string;
  description: string;
  start: number[];
  startInputType: "local" | "utc";
  end: number[];
  endInputType: "local" | "utc";
  url: string;
  method: "PUBLISH";
  organizer: { name: string; email: string };
  categories?: string[];
  productId?: string;
}
