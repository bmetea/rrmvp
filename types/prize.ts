export interface AccordionSection {
  label: string;
  content: string;
  important: string | null;
}

interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

interface Media {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail: MediaFormat;
    small: MediaFormat;
    medium: MediaFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Prize {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  subtitle: string;
  ticketsTotal: number;
  ticketsSold: number;
  accordionSections: AccordionSection[] | null;
  live: boolean | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  media: Media[];
}

export interface PrizeResponse {
  data: Prize[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}