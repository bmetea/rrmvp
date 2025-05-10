export interface AccordionSection {
  label: string;
  content: string;
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

// Example of how the data would be structured in the database
export const examplePrize: Prize = {
  id: 1,
  documentId: "1",
  slug: "breast-augmentation",
  title: "Breast Augmentation",
  subtitle: "£10,000 Cash Prize for Procedure & Aftercare",
  ticketsTotal: 100,
  ticketsSold: 90,
  accordionSections: [
    {
      label: "Details",
      content: `<p class="mb-2"><span class="font-semibold">Important:</span> This competition is subject to specific eligibility, clinic requirements, and participant responsibilities. Please read our full Terms and Conditions, including <span class="font-semibold">Clause 6</span>, before entering.</p><ul class="list-disc pl-5 mb-2"><li>Win a £10,000 cash prize to fund a breast augmentation procedure.</li><li>This amount is intended to cover the surgery, aftercare, travel, accommodation, and any related expenses.</li><li>You have full freedom to choose your own licensed clinic in the UK or abroad.</li><li>The cash prize is paid directly to you — giving you control over how and where it's spent.</li></ul>`,
    },
    {
      label: "FAQ",
      content: `<div class="mb-4"><h3 class="font-semibold mb-1">How does it work?</h3><ul class="list-disc pl-5 mb-2"><li>If you win, you'll receive a £10,000 cash prize.</li><li>This cash can be used for your procedure, aftercare, travel, accommodation, or however you choose.</li><li>You are responsible for booking your consultation and treatment with a licensed provider.</li></ul>...</div>`,
    },
    {
      label: "Disclaimer & Liability Waiver",
      content: `<p class="mb-2">By entering this competition, you acknowledge and agree to the following:</p><ul class="list-disc pl-5 mb-2"><li>We are not medical professionals and do not offer medical advice, treatment, or recommendations.</li>...</ul>`,
    },
  ],
  live: true,
  createdAt: "2024-04-01T12:00:00",
  updatedAt: "2024-04-01T12:00:00",
  publishedAt: "2024-04-01T12:00:00",
  media: [
    {
      id: 1,
      documentId: "1",
      name: "breast-augmentation",
      alternativeText: null,
      caption: null,
      width: 800,
      height: 600,
      formats: {
        thumbnail: {
          name: "thumbnail",
          hash: "thumbnail_breast-augmentation_04012024120000",
          ext: ".png",
          mime: "image/png",
          path: null,
          width: 200,
          height: 150,
          size: 10000,
          sizeInBytes: 10000,
          url: "/uploads/breast-augmentation_thumbnail.png",
        },
        small: {
          name: "small",
          hash: "small_breast-augmentation_04012024120000",
          ext: ".png",
          mime: "image/png",
          path: null,
          width: 400,
          height: 300,
          size: 20000,
          sizeInBytes: 20000,
          url: "/uploads/breast-augmentation_small.png",
        },
        medium: {
          name: "medium",
          hash: "medium_breast-augmentation_04012024120000",
          ext: ".png",
          mime: "image/png",
          path: null,
          width: 600,
          height: 450,
          size: 30000,
          sizeInBytes: 30000,
          url: "/uploads/breast-augmentation_medium.png",
        },
      },
      hash: "breast-augmentation_04012024120000",
      ext: ".png",
      mime: "image/png",
      size: 30000,
      url: "/uploads/breast-augmentation.png",
      previewUrl: null,
      provider: "local",
      provider_metadata: null,
      createdAt: "2024-04-01T12:00:00",
      updatedAt: "2024-04-01T12:00:00",
      publishedAt: "2024-04-01T12:00:00",
    },
  ],
};
