import type {
  PublicCertificate,
  PublicHeroSlide,
  PublicProduct,
  PublicProductCategoryRecord,
  PublicResource,
  PublicSiteSettings
} from "./public.types.js";

export const publicSiteSettings: PublicSiteSettings = {
  company: "MIPRO Healthcare Corporation",
  tagline: "Precision in Healthcare",
  description: "Medical devices and consumables supplied through structured procurement, import, warehousing and institutional distribution in Bangladesh.",
  addressLines: ["Flat B2, House 26, Road 06, Sector 09", "Uttara, Dhaka 1230, Bangladesh"],
  phone: "+880 1805 050780",
  phoneHref: "+8801805050780",
  email: "ledtrackers@gmail.com",
  website: "www.miprobd.com",
  officeHours: "Saturday to Thursday, 9:00 AM to 6:00 PM",
  mapCenter: [23.8748, 90.4007],
  whatsappHref: "8801805050780"
};

export const publicHeroSlides: PublicHeroSlide[] = [
  {
    id: "hero-healthcare-supply",
    eyebrow: "Precision in Healthcare",
    title: "Dependable medical supply for institutional care",
    body: "MIPRO connects verified product requirements, overseas procurement and organized distribution for healthcare providers in Bangladesh.",
    image: "/medical-products.png",
    imageAlt: "MIPRO medical consumables and hemodialysis product collection",
    primaryLabel: "Explore products",
    primaryHref: "/products",
    secondaryLabel: "Contact our team",
    secondaryHref: "/contact",
    published: true,
    sortOrder: 1
  },
  {
    id: "hero-hemodialysis",
    eyebrow: "Hemodialysis Supply",
    title: "Product clarity before every institutional quotation",
    body: "Review dialyzers, blood tubing and vascular-access products with model-specific documentation and a direct sales inquiry path.",
    image: "/products/dialyzer.jpg",
    imageAlt: "Hollow fiber hemodialyzers supplied through MIPRO",
    primaryLabel: "View hemodialysis",
    primaryHref: "/products?category=Hemodialysis",
    secondaryLabel: "Request information",
    secondaryHref: "/contact",
    published: true,
    sortOrder: 2
  },
  {
    id: "hero-distribution",
    eyebrow: "Procurement to Distribution",
    title: "One connected supply path from source to customer",
    body: "Commercial review, import coordination, batch-aware warehouse handling and institutional delivery stay aligned around the requested product.",
    image: "/mipro-warehouse.png",
    imageAlt: "Medical supply cartons in the MIPRO warehouse",
    primaryLabel: "How MIPRO works",
    primaryHref: "/about",
    secondaryLabel: "Business inquiry",
    secondaryHref: "/contact",
    published: true,
    sortOrder: 3
  }
];

export const publicProductCategories: PublicProductCategoryRecord[] = [
  {
    id: "cat-hemodialysis",
    name: "Hemodialysis",
    description: "Dialyzers, blood tubing sets and vascular-access consumables for dialysis care.",
    image: "/products/dialyzer.jpg",
    published: true,
    sortOrder: 1
  },
  {
    id: "cat-puncture-access",
    name: "Puncture & Access",
    description: "Single-use access products including fistula, IV and flashback needle formats.",
    image: "/products/av-fistula-needle.jpg",
    published: true,
    sortOrder: 2
  },
  {
    id: "cat-catheter-airway",
    name: "Catheter & Airway",
    description: "Catheter and airway products supplied for professional healthcare settings.",
    image: "/products/tracheostomy-tube.png",
    published: true,
    sortOrder: 3
  },
  {
    id: "cat-protective-products",
    name: "Protective Products",
    description: "Single-use protective clothing and respiratory protection products.",
    image: "/products/protective-clothing.jpg",
    published: true,
    sortOrder: 4
  }
];

export const publicProducts: PublicProduct[] = [
  {
    slug: "hollow-fiber-hemodialyzer-high-low-flux",
    legacySlug: "hollow-fiber-hemodialyzerhigh-flux",
    name: "Hollow Fiber Hemodialyzer",
    category: "Hemodialysis",
    shortDescription: "Single-use hemodialysis filter offered in high-flux and low-flux configurations.",
    description:
      "A hollow-fiber dialyzer for blood purification during hemodialysis. Product selection and treatment parameters must be determined by qualified clinical professionals using the approved manufacturer documentation.",
    brand: "Distributed by MIPRO",
    manufacturer: "Jiangxi Hongda Medical Equipment Group",
    intendedApplication: "Hemodialysis treatment in hospitals and dialysis centers.",
    images: ["/products/dialyzer.jpg"],
    imageAlt: "Hollow fiber hemodialyzer with color-coded end caps",
    features: ["High-flux and low-flux options", "Hollow-fiber membrane format", "Single-use sterile presentation"],
    variants: ["High-flux configuration", "Low-flux configuration", "Model selection subject to availability"],
    specifications: [
      { label: "Product family", value: "Hollow fiber hemodialyzer" },
      { label: "Use", value: "Single use" },
      { label: "Supply format", value: "Sterile packaged unit" }
    ],
    certificateIds: ["jiangxi-hongda-ec"],
    featured: true,
    published: true
  },
  {
    slug: "blood-tubing-set-for-hemodialysis",
    legacySlug: "blood-tubing-set-for-hemodialysis",
    name: "Blood Tubing Set for Hemodialysis",
    category: "Hemodialysis",
    shortDescription: "Color-coded blood circuit tubing and connectors for compatible dialysis systems.",
    description:
      "A disposable blood tubing circuit intended to support extracorporeal blood flow between the patient and a compatible hemodialysis system. Final compatibility must be checked against the machine and product documentation.",
    brand: "Distributed by MIPRO",
    intendedApplication: "Extracorporeal blood circulation during hemodialysis.",
    images: ["/products/blood-tubing-set.png"],
    imageAlt: "Coiled blood tubing set with red and blue color-coded connectors",
    features: ["Color-coded arterial and venous lines", "Integrated connectors and chambers", "Single-use presentation"],
    variants: ["Standard dialysis blood-line configuration", "Machine-compatible variants on request"],
    specifications: [
      { label: "Product family", value: "Hemodialysis blood circuit" },
      { label: "Use", value: "Single use" },
      { label: "Configuration", value: "Confirm against dialysis machine" }
    ],
    certificateIds: ["jiangxi-hongda-ec"],
    featured: true,
    published: true
  },
  {
    slug: "disposable-a-v-fistula-needle",
    legacySlug: "disposable-a-v-fistula-needle",
    name: "Disposable A.V. Fistula Needle",
    category: "Hemodialysis",
    shortDescription: "Color-coded fistula needle sets for vascular access during hemodialysis.",
    description:
      "A single-use fistula needle assembly used for vascular access in hemodialysis. Gauge, length and configuration should be selected by trained clinical personnel according to the approved product instructions.",
    brand: "Distributed by MIPRO",
    intendedApplication: "Vascular access for hemodialysis procedures.",
    images: ["/products/av-fistula-needle.jpg"],
    imageAlt: "Pair of A.V. fistula needle sets with color-coded wings and tubing",
    features: ["Color-coded components", "Flexible tubing assembly", "Single-use sterile presentation"],
    variants: ["Multiple gauge options", "Configuration subject to clinical requirement"],
    specifications: [
      { label: "Product family", value: "A.V. fistula needle" },
      { label: "Use", value: "Single use" },
      { label: "Variant selection", value: "Confirm gauge and length before order" }
    ],
    certificateIds: ["jiangxi-hongda-ec"],
    featured: true,
    published: true
  },
  {
    slug: "iv-catheter-pen-type",
    legacySlug: "iv-catheter-pen-type",
    name: "IV Catheter, Pen Type",
    category: "Puncture & Access",
    shortDescription: "Color-coded pen-type peripheral IV catheter in multiple clinical sizes.",
    description:
      "A peripheral intravenous catheter in pen-type presentation. Product size and intended use must be confirmed by the responsible clinical team before procurement.",
    brand: "Distributed by MIPRO",
    intendedApplication: "Peripheral intravenous access in professional healthcare settings.",
    images: ["/products/iv-catheter.jpg"],
    imageAlt: "Four color-coded pen-type IV catheter units on a blue background",
    features: ["Pen-type presentation", "Color-coded size identification", "Single-use sterile supply"],
    variants: ["Multiple color-coded sizes", "Packaging configuration on request"],
    specifications: [
      { label: "Product family", value: "Peripheral IV catheter" },
      { label: "Format", value: "Pen type" },
      { label: "Use", value: "Single use" }
    ],
    certificateIds: ["jiangxi-hongda-ec"],
    featured: true,
    published: true
  },
  {
    slug: "flashback-needle",
    legacySlug: "flash-back-needle",
    name: "Flashback Needle",
    category: "Puncture & Access",
    shortDescription: "Single-use needle format with a transparent flashback observation chamber.",
    description:
      "A disposable puncture needle product with flashback observation. Exact dimensions, packaging and approved use are available with the relevant technical documentation.",
    brand: "Distributed by MIPRO",
    intendedApplication: "Professional puncture and access procedures as specified by the manufacturer.",
    images: ["/products/flashback-needle.jpg"],
    imageAlt: "Flashback needle units with protective caps and transparent chamber",
    features: ["Transparent flashback chamber", "Protective cap", "Single-use presentation"],
    variants: ["Size options available on request"],
    specifications: [
      { label: "Product family", value: "Flashback needle" },
      { label: "Use", value: "Single use" },
      { label: "Sizing", value: "Confirm before order" }
    ],
    certificateIds: [],
    featured: false,
    published: true
  },
  {
    slug: "single-use-tracheostomy-intubation",
    legacySlug: "single-use-tracheostomy-intubation",
    name: "Single-use Tracheostomy Tube",
    category: "Catheter & Airway",
    shortDescription: "Cuffed tracheostomy tube assembly supplied for professional airway management.",
    description:
      "A single-use tracheostomy tube assembly. Selection, insertion and use require trained healthcare professionals and the approved instructions supplied with the product.",
    brand: "Distributed by MIPRO",
    intendedApplication: "Airway management in an appropriate clinical setting.",
    images: ["/products/tracheostomy-tube.png"],
    imageAlt: "Single-use cuffed tracheostomy tube assembly on a blue background",
    features: ["Cuffed tube assembly", "Inflation line and pilot balloon", "Single-use supply"],
    variants: ["Multiple tube sizes available on request"],
    specifications: [
      { label: "Product family", value: "Tracheostomy tube" },
      { label: "Use", value: "Single use" },
      { label: "Configuration", value: "Cuffed assembly shown" }
    ],
    certificateIds: [],
    featured: false,
    published: true
  },
  {
    slug: "disposable-medical-protective-clothing",
    legacySlug: "disposable-medical-protective-clothing",
    name: "Disposable Medical Protective Clothing",
    category: "Protective Products",
    shortDescription: "Individually packaged single-use protective garment for approved healthcare applications.",
    description:
      "A disposable protective garment supplied in individual packaging. Protection level, intended environment and use limitations must be verified from the approved manufacturer documentation.",
    brand: "Distributed by MIPRO",
    intendedApplication: "Healthcare protection where the documented product specification is suitable.",
    images: ["/products/protective-clothing.jpg"],
    imageAlt: "Front and back packaging for disposable medical protective clothing",
    features: ["Individually packaged", "Single-use garment", "Size and specification options"],
    variants: ["Sizes subject to availability", "Packaging details on request"],
    specifications: [
      { label: "Product family", value: "Protective clothing" },
      { label: "Use", value: "Single use" },
      { label: "Selection", value: "Confirm protection specification" }
    ],
    certificateIds: [],
    featured: false,
    published: true
  },
  {
    slug: "disposable-medical-protective-mask-n95",
    legacySlug: "disposable-medical-protective-mask-n95",
    name: "Disposable Protective Mask",
    category: "Protective Products",
    shortDescription: "Cup-style disposable protective mask with head straps and exhalation valve configuration shown.",
    description:
      "A disposable protective mask product. Model certification, filtration classification, fit requirements and approved use must be confirmed from the exact product documentation before procurement.",
    brand: "Distributed by MIPRO",
    intendedApplication: "Respiratory protection where the confirmed model specification is appropriate.",
    images: ["/products/n95-mask.jpg"],
    imageAlt: "Cup-style disposable protective mask with yellow straps",
    features: ["Cup-style format", "Head-strap design", "Disposable presentation"],
    variants: ["Model and packaging details available on request"],
    specifications: [
      { label: "Product family", value: "Disposable protective mask" },
      { label: "Use", value: "Single use" },
      { label: "Classification", value: "Confirm exact supplied model" }
    ],
    certificateIds: [],
    featured: false,
    published: true
  }
];

export const publicCertificates: PublicCertificate[] = [
  {
    id: "jiangxi-hongda-ukca-gloves",
    title: "UKCA Type Examination Certificate UKCA 753355",
    type: "UKCA type examination",
    documentOwner: "Jiangxi Hongda Medical Equipment Group Ltd.",
    manufacturer: "Jiangxi Hongda Medical Equipment Group Ltd.",
    scope: "Nitrile Green gloves for personal protection",
    summary:
      "BSI-issued manufacturer certificate for the named glove model. The archived scan is page 1 of 4; request the complete controlled set before regulatory reliance.",
    relatedProducts: ["Nitrile Green protective gloves"],
    relatedProductSlugs: [],
    status: "Current",
    issuedOn: "10 November 2021",
    validUntil: "10 November 2026",
    statusNote: "Current on the visible document date; confirm status with BSI before procurement.",
    file: {
      url: "/certificates/jiangxi-hongda-ukca-nitrile-gloves-certificate.jpg",
      mediaType: "image/jpeg",
      alt: "BSI UKCA Type Examination Certificate UKCA 753355 issued to Jiangxi Hongda Medical Equipment Group",
      downloadName: "jiangxi-hongda-ukca-753355-page-1.jpg",
      sourceUrl: "https://www.miprobd.com/certificates/"
    }
  },
  {
    id: "jiangxi-hongda-ec",
    title: "EC Certificate G1 044803 0031 Rev. 03",
    type: "EC quality assurance certificate",
    documentOwner: "Jiangxi Hongda Medical Equipment Group Ltd.",
    manufacturer: "Jiangxi Hongda Medical Equipment Group Ltd.",
    scope: "Listed single-use medical-device categories under MDD 93/42/EEC",
    summary:
      "TUV SUD manufacturer certificate covering listed product categories, including blood tubing, A.V. fistula needles, IV cannulae and hollow-fiber hemodialyzers. It is retained only as an historical record because its printed validity ended in 2024.",
    relatedProducts: ["Hollow-fiber hemodialyzer", "Blood tubing set", "A.V. fistula needle set", "IV cannula"],
    relatedProductSlugs: publicProducts.filter((product) => product.certificateIds.includes("jiangxi-hongda-ec")).map((product) => product.slug),
    status: "Expired",
    issuedOn: "16 March 2021",
    validUntil: "26 March 2024",
    statusNote: "Expired on the visible document date; not evidence of current conformity.",
    file: {
      url: "/certificates/jiangxi-hongda-ec-certificate-g1-044803-0031.jpg",
      mediaType: "image/jpeg",
      alt: "TUV SUD EC Certificate G1 044803 0031 Rev. 03 issued to Jiangxi Hongda Medical Equipment Group",
      downloadName: "jiangxi-hongda-ec-g1-044803-0031-rev-03.jpg",
      sourceUrl: "https://www.miprobd.com/certificates/"
    }
  },
  {
    id: "jiangxi-hongda-russia-registration",
    title: "Russian Medical Device Registration Certificate",
    type: "Market registration record",
    documentOwner: "Jiangxi Hongda Medical Equipment Group Ltd.",
    manufacturer: "Jiangxi Hongda Medical Equipment Group Ltd.",
    scope: "Disposable sterile syringes with needles, as stated in the Russian-language scan",
    summary:
      "Historical Russian-language registration scan dated 2007. No current validity should be inferred without confirmation from the issuing authority and the manufacturer.",
    relatedProducts: ["Disposable sterile syringes with needles"],
    relatedProductSlugs: [],
    status: "Historical reference",
    issuedOn: "25 October 2007",
    statusNote: "Current validity is not verified from the archived scan.",
    file: {
      url: "/certificates/jiangxi-hongda-russia-registration-certificate.jpg",
      mediaType: "image/jpeg",
      alt: "Russian medical device registration certificate issued for Jiangxi Hongda disposable sterile syringes",
      downloadName: "jiangxi-hongda-russia-registration-certificate.jpg",
      sourceUrl: "https://www.miprobd.com/certificates/"
    }
  },
  {
    id: "jiangxi-hongda-who-pqs-syringe",
    title: "WHO PQS Product Record E008/123",
    type: "Product prequalification record",
    documentOwner: "Jiangxi Hongda Medical Equipment Group Ltd.",
    manufacturer: "Jiangxi Hongda Medical Equipment Group Ltd.",
    scope: "0.5 ml auto-disable syringe for fixed-dose immunization",
    summary:
      "Archived PQS product sheet showing pre-qualified status from 12 October 2018 and a printed validity end of May 2023.",
    relatedProducts: ["0.5 ml auto-disable syringe"],
    relatedProductSlugs: [],
    status: "Expired",
    issuedOn: "12 October 2018",
    validUntil: "May 2023",
    statusNote: "Expired on the visible document date; verify any replacement record before use.",
    file: {
      url: "/certificates/jiangxi-hongda-who-pqs-auto-disable-syringe.jpg",
      mediaType: "image/jpeg",
      alt: "WHO PQS product record E008/123 for Jiangxi Hongda 0.5 milliliter auto-disable syringe",
      downloadName: "jiangxi-hongda-who-pqs-e008-123.jpg",
      sourceUrl: "https://www.miprobd.com/certificates/"
    }
  }
];

export const publicResources: PublicResource[] = [
  {
    slug: "high-flux-and-low-flux-dialyzers",
    kind: "Product guide",
    title: "High-flux and low-flux dialyzers: procurement questions to ask",
    summary: "A concise checklist for matching a requested dialyzer model with clinical and machine requirements.",
    body: [
      "Flux category is only one part of product selection. Buyers should confirm the prescribed model, membrane characteristics, surface area, sterilization method and dialysis-machine compatibility.",
      "MIPRO can provide model-specific documentation during quotation review so the requesting institution can verify the exact item before order confirmation."
    ],
    image: "/products/dialyzer.jpg"
  },
  {
    slug: "blood-tubing-set-review",
    kind: "Clinical resource",
    title: "Reviewing a hemodialysis blood tubing set",
    summary: "Key compatibility and documentation checks before an institutional purchase.",
    body: [
      "Blood tubing configurations differ across dialysis systems. Confirm the machine model, arterial and venous line configuration, chamber arrangement, connectors and packaging specification.",
      "The final purchase description should identify the approved configuration rather than relying on a generic product name alone."
    ],
    image: "/products/blood-tubing-set.png"
  },
  {
    slug: "av-fistula-needle-selection",
    kind: "Product guide",
    title: "A.V. fistula needle ordering checklist",
    summary: "A practical pre-quotation checklist for gauge, length, tubing and packaging requirements.",
    body: [
      "Institutional requests should state the required gauge, needle length, tubing configuration, back-eye requirement where relevant, and expected unit packaging.",
      "Clinical selection and use remain the responsibility of appropriately trained healthcare professionals."
    ],
    image: "/products/av-fistula-needle.jpg"
  },
  {
    slug: "institutional-document-checklist",
    kind: "Company update",
    title: "A clearer documentation path for institutional inquiries",
    summary: "How MIPRO connects product inquiry, technical review and commercial quotation without an online cart.",
    body: [
      "A website inquiry records the institution, product interest and requested documentation. The sales team then confirms model, manufacturer documentation and commercial requirements before preparing a quotation.",
      "This review-first approach is better suited to medical procurement than a public checkout flow."
    ],
    image: "/medical-products.png"
  }
];
