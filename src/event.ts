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
  dtstampß: any;
  url: string;
  geo?: { lat: any; lon: any };
  class: string;
  method: "PUBLISH";
  organizer: any;
  categories?: string[];
  productId?: string;
}

export interface TIcsEventWrite {
  uid: string;
  location: string;
  title: string;
  description: string;
  start: number[];
  startInputType: "local";
  end: number[];
  endInputType: "local";
  url: string;
  method: "PUBLISH";
  organizer: { name: string; email: string };
  categories?: string[];
  productId?: string;
}
