import { PAGE_DEFS } from "./page-content";
import { DISPLAY_FONTS, SANS_FONTS, SERIF_FONTS, THEMES } from "./themes";

/**
 * The CMS schema. Every editable collection and page is described here and the
 * admin panel renders its lists and forms from this config — add a field here
 * and it instantly shows up in the admin.
 */

export type FieldType =
  | "text"
  | "slug"
  | "textarea"
  | "markdown"
  | "number"
  | "boolean"
  | "select"
  | "color"
  | "date"
  | "image"
  | "gallery"
  | "list"
  | "tags"
  | "url"
  | "email"
  | "sections"
  | "lineItems"
  | "readonly"
  | "code"
  | "weekdays"
  | "password";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  help?: string;
  placeholder?: string;
  required?: boolean;
  half?: boolean;
  from?: string; // for slug fields: source field
}

export interface FieldGroup {
  title: string;
  description?: string;
  fields: Field[];
}

export interface CollectionAction {
  key: string;
  label: string;
  help?: string;
}

export interface CollectionConfig {
  key: string;
  group?: "content" | "clients" | "pages";
  /** public link for the item, e.g. "/gallery/{slug}" — shown with a copy button */
  publicPath?: string;
  actions?: CollectionAction[];
  readOnly?: boolean;
  adminOnly?: boolean;
  label: string;
  singular: string;
  icon: string;
  description: string;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  sortable?: boolean;
  publishable?: boolean;
  viewPath?: string; // e.g. "/work/{slug}"
  defaults: Record<string, any>;
  groups: FieldGroup[];
}

export interface SingletonConfig {
  key: "settings" | "hero" | "home" | "about" | "theme" | "integrations" | "booking" | "emails" | "pages";
  group?: "pages" | "system";
  adminOnly?: boolean;
  label: string;
  icon: string;
  description: string;
  viewPath?: string;
  groups: FieldGroup[];
}

export const PROJECT_CATEGORIES = ["Wedding", "Commercial", "Portrait", "Fashion", "Events", "Film", "Product", "Travel"];
export const SERVICE_ICONS = ["heart", "box", "clapperboard", "user", "sparkles", "mic", "camera", "film", "aperture", "plane", "building", "baby"];

const published: Field = { name: "published", label: "Published", type: "boolean", help: "Unpublished items are hidden from the website.", half: true };

export const collections: CollectionConfig[] = [
  {
    key: "projects",
    label: "Portfolio",
    singular: "Project",
    icon: "images",
    description: "Photography and film projects shown on the Work pages.",
    titleField: "title",
    subtitleField: "category",
    imageField: "cover",
    sortable: true,
    publishable: true,
    viewPath: "/work/{slug}",
    defaults: { kind: "photo", category: "Wedding", featured: false, published: true, gallery: [], year: String(new Date().getFullYear()) },
    groups: [
      {
        title: "Basics",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "slug", label: "URL slug", type: "slug", from: "title", required: true },
          { name: "category", label: "Category", type: "select", options: PROJECT_CATEGORIES, half: true },
          { name: "kind", label: "Type", type: "select", options: ["photo", "video"], half: true },
          { name: "client", label: "Client", type: "text", half: true },
          { name: "year", label: "Year", type: "text", half: true },
          { name: "location", label: "Location", type: "text" },
          { name: "excerpt", label: "Short description", type: "textarea" },
          { name: "description", label: "Full story", type: "markdown" },
        ],
      },
      {
        title: "Media",
        fields: [
          { name: "cover", label: "Cover image", type: "image", required: true },
          { name: "gallery", label: "Gallery", type: "gallery" },
          { name: "videoUrl", label: "Video URL", type: "url", help: "YouTube, Vimeo or a direct .mp4 link." },
        ],
      },
      {
        title: "Visibility",
        fields: [{ name: "featured", label: "Featured on homepage", type: "boolean", half: true }, published],
      },
    ],
  },
  {
    key: "services",
    label: "Services",
    singular: "Service",
    icon: "briefcase",
    description: "What the studio offers.",
    titleField: "title",
    subtitleField: "startingPrice",
    imageField: "image",
    sortable: true,
    publishable: true,
    viewPath: "/services",
    defaults: { icon: "camera", features: [], published: true },
    groups: [
      {
        title: "Service",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "slug", label: "Slug", type: "slug", from: "title" },
          { name: "icon", label: "Icon", type: "select", options: SERVICE_ICONS, half: true },
          { name: "startingPrice", label: "Starting price", type: "text", half: true, placeholder: "₹25,000" },
          { name: "summary", label: "Summary", type: "textarea" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "image", label: "Image", type: "image" },
          { name: "features", label: "Features", type: "list" },
          published,
        ],
      },
    ],
  },
  {
    key: "packages",
    label: "Pricing",
    singular: "Package",
    icon: "tag",
    description: "Pricing packages.",
    titleField: "name",
    subtitleField: "price",
    sortable: true,
    publishable: true,
    viewPath: "/pricing",
    defaults: { features: [], highlighted: false, ctaLabel: "Book now", published: true },
    groups: [
      {
        title: "Package",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "price", label: "Price (display)", type: "text", half: true, placeholder: "₹25,000" },
          { name: "amount", label: "Price (number, for deposits)", type: "number", half: true },
          { name: "unit", label: "Unit", type: "text", half: true, placeholder: "per session" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "features", label: "Included", type: "list" },
          { name: "ctaLabel", label: "Button label", type: "text", half: true },
          { name: "highlighted", label: "Highlight as most popular", type: "boolean", half: true },
          published,
        ],
      },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    icon: "quote",
    description: "Client reviews.",
    titleField: "name",
    subtitleField: "role",
    imageField: "avatar",
    sortable: true,
    publishable: true,
    defaults: { rating: 5, published: true },
    groups: [
      {
        title: "Testimonial",
        fields: [
          { name: "name", label: "Name", type: "text", required: true, half: true },
          { name: "role", label: "Role / context", type: "text", half: true },
          { name: "quote", label: "Quote", type: "textarea", required: true },
          { name: "avatar", label: "Photo", type: "image" },
          { name: "rating", label: "Rating (1–5)", type: "number", half: true },
          published,
        ],
      },
    ],
  },
  {
    key: "team",
    label: "Team",
    singular: "Team member",
    icon: "users",
    description: "The people behind the studio.",
    titleField: "name",
    subtitleField: "role",
    imageField: "photo",
    sortable: true,
    publishable: true,
    viewPath: "/about",
    defaults: { published: true },
    groups: [
      {
        title: "Member",
        fields: [
          { name: "name", label: "Name", type: "text", required: true, half: true },
          { name: "role", label: "Role", type: "text", half: true },
          { name: "bio", label: "Bio", type: "textarea" },
          { name: "photo", label: "Photo", type: "image" },
          { name: "instagram", label: "Instagram URL", type: "url" },
          published,
        ],
      },
    ],
  },
  {
    key: "posts",
    label: "Journal",
    singular: "Post",
    icon: "pen",
    description: "Blog posts and stories.",
    titleField: "title",
    subtitleField: "publishedAt",
    imageField: "cover",
    publishable: true,
    viewPath: "/journal/{slug}",
    defaults: { tags: [], published: false, publishedAt: new Date().toISOString().slice(0, 10) },
    groups: [
      {
        title: "Post",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "slug", label: "URL slug", type: "slug", from: "title", required: true },
          { name: "excerpt", label: "Excerpt", type: "textarea" },
          { name: "cover", label: "Cover image", type: "image" },
          { name: "content", label: "Content", type: "markdown" },
        ],
      },
      {
        title: "Meta",
        fields: [
          { name: "author", label: "Author", type: "text", half: true },
          { name: "publishedAt", label: "Publish date", type: "date", half: true },
          { name: "tags", label: "Tags", type: "tags" },
          published,
        ],
      },
    ],
  },
  {
    key: "faqs",
    label: "FAQs",
    singular: "FAQ",
    icon: "help",
    description: "Frequently asked questions.",
    titleField: "question",
    sortable: true,
    publishable: true,
    defaults: { published: true },
    groups: [
      {
        title: "FAQ",
        fields: [
          { name: "question", label: "Question", type: "text", required: true },
          { name: "answer", label: "Answer", type: "textarea", required: true },
          published,
        ],
      },
    ],
  },
  {
    key: "cameraFeatures",
    label: "3D Camera Steps",
    singular: "Camera step",
    icon: "camera",
    description: "The text chapters shown as visitors scroll through the 3D camera.",
    titleField: "title",
    subtitleField: "spec",
    sortable: true,
    publishable: true,
    defaults: { published: true },
    groups: [
      {
        title: "Chapter",
        fields: [
          { name: "title", label: "Headline", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "spec", label: "Big number", type: "text", half: true, placeholder: "61" },
          { name: "specLabel", label: "Number label", type: "text", half: true, placeholder: "Megapixels" },
          published,
        ],
      },
    ],
  },
  {
    key: "process",
    label: "Process",
    singular: "Step",
    icon: "list",
    description: "How a project works, step by step.",
    titleField: "title",
    subtitleField: "duration",
    sortable: true,
    publishable: true,
    defaults: { published: true },
    groups: [
      {
        title: "Step",
        fields: [
          { name: "title", label: "Title", type: "text", required: true, half: true },
          { name: "duration", label: "When", type: "text", half: true },
          { name: "description", label: "Description", type: "textarea" },
          published,
        ],
      },
    ],
  },
  {
    key: "stats",
    label: "Stats",
    singular: "Stat",
    icon: "chart",
    description: "Animated counters.",
    titleField: "label",
    subtitleField: "value",
    sortable: true,
    publishable: true,
    defaults: { value: 100, suffix: "+", published: true },
    groups: [
      {
        title: "Stat",
        fields: [
          { name: "label", label: "Label", type: "text", required: true },
          { name: "value", label: "Value", type: "number", half: true },
          { name: "suffix", label: "Suffix", type: "text", half: true, placeholder: "+" },
          published,
        ],
      },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    singular: "Client",
    icon: "award",
    description: "Logos / names in the marquee.",
    titleField: "name",
    imageField: "logo",
    sortable: true,
    publishable: true,
    defaults: { published: true },
    groups: [
      {
        title: "Client",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "logo", label: "Logo (optional)", type: "image", help: "Leave empty to show the name as a wordmark." },
          { name: "url", label: "Website", type: "url" },
          published,
        ],
      },
    ],
  },
  {
    key: "customPages",
    group: "pages",
    label: "Custom & legal pages",
    singular: "Page",
    icon: "file",
    description: "Privacy policy, terms, refund policy or any extra page — each gets its own URL.",
    titleField: "title",
    subtitleField: "slug",
    sortable: true,
    publishable: true,
    viewPath: "/{slug}",
    defaults: { showInFooter: true, published: true, content: "" },
    groups: [
      {
        title: "Page",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "slug", label: "URL", type: "slug", from: "title", required: true, help: "The page will live at yoursite.com/<url>." },
          { name: "content", label: "Content", type: "markdown" },
        ],
      },
      {
        title: "SEO & visibility",
        fields: [
          { name: "seoTitle", label: "SEO title", type: "text", half: true },
          { name: "seoDescription", label: "SEO description", type: "text", half: true },
          { name: "showInFooter", label: "Link in footer", type: "boolean", half: true },
          published,
        ],
      },
    ],
  },
  {
    key: "galleries",
    group: "clients",
    label: "Client galleries",
    singular: "Gallery",
    icon: "lock",
    description: "Private, code-protected galleries where clients favourite, download and order prints.",
    titleField: "title",
    subtitleField: "clientName",
    imageField: "cover",
    publishable: true,
    publicPath: "/gallery/{slug}",
    actions: [{ key: "send", label: "Email link to client", help: "Sends the gallery link and access code." }],
    defaults: { allowDownload: true, allowFavorites: true, allowPrints: true, watermark: true, maxSelections: 0, images: [], favorites: [], published: true },
    groups: [
      {
        title: "Gallery",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "slug", label: "URL", type: "slug", from: "title", required: true },
          { name: "clientName", label: "Client name", type: "text", half: true },
          { name: "clientEmail", label: "Client email", type: "email", half: true },
          { name: "accessCode", label: "Access code", type: "code", required: true, help: "Clients enter this code to open the gallery." },
          { name: "eventDate", label: "Event date", type: "date", half: true },
          { name: "expiresAt", label: "Expires on (optional)", type: "date", half: true },
          { name: "message", label: "Welcome message", type: "textarea" },
        ],
      },
      { title: "Photos", fields: [{ name: "cover", label: "Cover", type: "image" }, { name: "images", label: "Photos", type: "gallery" }] },
      {
        title: "Client permissions",
        fields: [
          { name: "allowFavorites", label: "Favourites / album selection", type: "boolean", half: true },
          { name: "maxSelections", label: "Max selections (0 = unlimited)", type: "number", half: true },
          { name: "allowDownload", label: "Full-resolution downloads", type: "boolean", half: true },
          { name: "allowPrints", label: "Print ordering", type: "boolean", half: true },
          { name: "watermark", label: "Watermark previews", type: "boolean", half: true, help: "Downloads stay clean when allowed." },
          published,
        ],
      },
      {
        title: "Client selection",
        description: "Filled in by the client from their gallery.",
        fields: [
          { name: "favorites", label: "Favourites", type: "readonly" },
          { name: "clientNote", label: "Note from client", type: "readonly" },
          { name: "selectionSubmittedAt", label: "Submitted", type: "readonly" },
        ],
      },
    ],
  },
  {
    key: "printOrders",
    group: "clients",
    label: "Print orders",
    singular: "Print order",
    icon: "printer",
    description: "Prints ordered from client galleries.",
    titleField: "name",
    subtitleField: "status",
    defaults: { status: "pending", paymentStatus: "unpaid", items: [] },
    groups: [
      {
        title: "Order",
        fields: [
          { name: "status", label: "Status", type: "select", options: ["pending", "paid", "printing", "shipped", "delivered", "cancelled"], half: true },
          { name: "paymentStatus", label: "Payment", type: "select", options: ["unpaid", "paid"], half: true },
          { name: "galleryTitle", label: "Gallery", type: "readonly", half: true },
          { name: "total", label: "Total", type: "readonly", half: true },
          { name: "items", label: "Items", type: "readonly" },
          { name: "notes", label: "Internal notes", type: "textarea" },
        ],
      },
      {
        title: "Customer",
        fields: [
          { name: "name", label: "Name", type: "text", half: true },
          { name: "email", label: "Email", type: "email", half: true },
          { name: "phone", label: "Phone", type: "text", half: true },
          { name: "address", label: "Shipping address", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "printProducts",
    group: "clients",
    label: "Print price list",
    singular: "Print product",
    icon: "tag",
    description: "Print sizes and prices clients can order from galleries.",
    titleField: "name",
    subtitleField: "size",
    sortable: true,
    publishable: true,
    defaults: { price: 1000, published: true },
    groups: [
      {
        title: "Product",
        fields: [
          { name: "name", label: "Name", type: "text", required: true, half: true },
          { name: "size", label: "Size", type: "text", half: true, placeholder: "8 × 10 in" },
          { name: "price", label: "Price", type: "number", half: true },
          { name: "description", label: "Description", type: "text", half: true },
          published,
        ],
      },
    ],
  },
  {
    key: "invoices",
    group: "clients",
    label: "Invoices & quotes",
    singular: "Invoice / quote",
    icon: "receipt",
    description: "Send quotations clients can accept, and invoices they can pay online.",
    titleField: "number",
    subtitleField: "clientName",
    publicPath: "/invoice/{token}",
    actions: [{ key: "send", label: "Email to client" }],
    defaults: { kind: "invoice", status: "draft", items: [{ description: "", qty: 1, rate: 0 }], taxPercent: 18, discount: 0, issueDate: new Date().toISOString().slice(0, 10) },
    groups: [
      {
        title: "Document",
        fields: [
          { name: "kind", label: "Type", type: "select", options: ["invoice", "quote"], half: true },
          { name: "status", label: "Status", type: "select", options: ["draft", "sent", "accepted", "declined", "paid"], half: true },
          { name: "number", label: "Number", type: "text", half: true, placeholder: "Auto-generated if empty" },
          { name: "issueDate", label: "Issue date", type: "date", half: true },
          { name: "dueDate", label: "Due / valid until", type: "date", half: true },
        ],
      },
      {
        title: "Client",
        fields: [
          { name: "clientName", label: "Name", type: "text", required: true, half: true },
          { name: "clientEmail", label: "Email", type: "email", half: true },
          { name: "clientPhone", label: "Phone", type: "text", half: true },
          { name: "clientAddress", label: "Address", type: "text", half: true },
        ],
      },
      {
        title: "Items",
        fields: [
          { name: "items", label: "Line items", type: "lineItems" },
          { name: "discount", label: "Discount (amount)", type: "number", half: true },
          { name: "taxPercent", label: "Tax / GST %", type: "number", half: true },
          { name: "notes", label: "Notes & payment terms", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "contracts",
    group: "clients",
    label: "Contracts",
    singular: "Contract",
    icon: "signature",
    description: "Agreements clients review and e-sign online.",
    titleField: "title",
    subtitleField: "clientName",
    publicPath: "/contract/{token}",
    actions: [{ key: "send", label: "Email to client for signature" }],
    defaults: { status: "draft", body: "" },
    groups: [
      {
        title: "Agreement",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "clientName", label: "Client name", type: "text", required: true, half: true },
          { name: "clientEmail", label: "Client email", type: "email", half: true },
          { name: "eventDate", label: "Event date", type: "date", half: true },
          { name: "status", label: "Status", type: "select", options: ["draft", "sent", "signed"], half: true },
          { name: "body", label: "Contract text", type: "markdown", help: "Placeholders: {{client}}, {{date}}, {{studio}}." },
        ],
      },
      {
        title: "Signature",
        fields: [
          { name: "signedName", label: "Signed by", type: "readonly", half: true },
          { name: "signedAt", label: "Signed at", type: "readonly", half: true },
          { name: "signedIp", label: "IP address", type: "readonly", half: true },
          { name: "signature", label: "Signature", type: "readonly" },
        ],
      },
    ],
  },
  {
    key: "payments",
    group: "clients",
    label: "Payments",
    singular: "Payment",
    icon: "card",
    readOnly: true,
    description: "Every online payment (deposits, invoices, prints) received through Razorpay.",
    titleField: "description",
    subtitleField: "status",
    defaults: {},
    groups: [
      {
        title: "Payment",
        fields: [
          { name: "status", label: "Status", type: "readonly", half: true },
          { name: "amount", label: "Amount", type: "readonly", half: true },
          { name: "purpose", label: "For", type: "readonly", half: true },
          { name: "description", label: "Description", type: "readonly", half: true },
          { name: "customerName", label: "Customer", type: "readonly", half: true },
          { name: "customerEmail", label: "Email", type: "readonly", half: true },
          { name: "providerOrderId", label: "Razorpay order", type: "readonly", half: true },
          { name: "providerPaymentId", label: "Razorpay payment", type: "readonly", half: true },
          { name: "paidAt", label: "Paid at", type: "readonly", half: true },
        ],
      },
    ],
  },
];

export const singletons: SingletonConfig[] = [
  {
    key: "hero",
    group: "pages",
    label: "Hero",
    icon: "sparkles",
    description: "The first thing visitors see.",
    viewPath: "/",
    groups: [
      {
        title: "Headline",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "titleLine1", label: "Title — line 1", type: "text", half: true },
          { name: "titleLine2", label: "Title — line 3", type: "text", half: true },
          { name: "rotatingWords", label: "Rotating words (line 2)", type: "tags", help: "These words cycle with an animation between the two title lines." },
          { name: "subtitle", label: "Subtitle", type: "textarea" },
          { name: "location", label: "Location label", type: "text" },
        ],
      },
      {
        title: "Buttons",
        fields: [
          { name: "primaryCtaLabel", label: "Primary label", type: "text", half: true },
          { name: "primaryCtaHref", label: "Primary link", type: "text", half: true },
          { name: "secondaryCtaLabel", label: "Secondary label", type: "text", half: true },
          { name: "secondaryCtaHref", label: "Secondary link", type: "text", half: true },
        ],
      },
      {
        title: "Background",
        fields: [
          { name: "slides", label: "Slideshow images", type: "gallery" },
          { name: "videoUrl", label: "Background video (.mp4)", type: "url", help: "Optional. Overrides the slideshow." },
          { name: "showViewfinder", label: "Show camera viewfinder overlay", type: "boolean" },
        ],
      },
    ],
  },
  {
    key: "home",
    group: "pages",
    label: "Homepage",
    icon: "home",
    description: "Section order, visibility and headings.",
    viewPath: "/",
    groups: [
      { title: "Sections", description: "Drag to reorder. Toggle to show or hide.", fields: [{ name: "sections", label: "Homepage sections", type: "sections" }] },
      { title: "Manifesto", fields: [{ name: "manifesto", label: "Manifesto text", type: "textarea", help: "Words light up one by one as visitors scroll." }] },
      {
        title: "3D Camera",
        fields: [
          { name: "cameraEyebrow", label: "Eyebrow", type: "text", half: true },
          { name: "cameraTitle", label: "Title", type: "text", half: true },
          { name: "cameraSubtitle", label: "Subtitle", type: "text" },
        ],
      },
      {
        title: "Services & Work",
        fields: [
          { name: "servicesEyebrow", label: "Services eyebrow", type: "text", half: true },
          { name: "servicesTitle", label: "Services title", type: "text", half: true },
          { name: "workEyebrow", label: "Work eyebrow", type: "text", half: true },
          { name: "workTitle", label: "Work title", type: "text", half: true },
        ],
      },
      {
        title: "Showreel",
        fields: [
          { name: "showreelTitle", label: "Title", type: "text", half: true },
          { name: "showreelSubtitle", label: "Subtitle", type: "text", half: true },
          { name: "showreelPoster", label: "Poster image", type: "image" },
          { name: "showreelVideoUrl", label: "Video URL", type: "url", help: "YouTube, Vimeo or .mp4" },
        ],
      },
      {
        title: "Before / After",
        fields: [
          { name: "retouchTitle", label: "Title", type: "text", half: true },
          { name: "retouchSubtitle", label: "Subtitle", type: "text", half: true },
          { name: "retouchAfter", label: "Edited image", type: "image" },
          { name: "retouchBefore", label: "RAW image (optional)", type: "image", help: "Leave empty to auto-generate a flat RAW look from the edited image." },
        ],
      },
      {
        title: "Other headings",
        fields: [
          { name: "processTitle", label: "Process title", type: "text", half: true },
          { name: "testimonialsTitle", label: "Testimonials title", type: "text", half: true },
          { name: "pricingTitle", label: "Pricing title", type: "text", half: true },
          { name: "pricingSubtitle", label: "Pricing subtitle", type: "text", half: true },
          { name: "teamTitle", label: "Team title", type: "text", half: true },
          { name: "faqTitle", label: "FAQ title", type: "text", half: true },
          { name: "journalTitle", label: "Journal title", type: "text", half: true },
        ],
      },
      {
        title: "Final call to action",
        fields: [
          { name: "ctaTitle", label: "Title", type: "text" },
          { name: "ctaSubtitle", label: "Subtitle", type: "text" },
          { name: "ctaImage", label: "Background image", type: "image" },
        ],
      },
    ],
  },
  {
    key: "about",
    group: "pages",
    label: "About page",
    icon: "info",
    description: "Studio story, values and awards.",
    viewPath: "/about",
    groups: [
      {
        title: "Intro",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "intro", label: "Intro", type: "textarea" },
          { name: "image", label: "Image", type: "image" },
          { name: "story", label: "Story", type: "markdown" },
        ],
      },
      {
        title: "Lists",
        fields: [
          { name: "values", label: "Values", type: "list" },
          { name: "awards", label: "Awards", type: "list" },
          { name: "equipment", label: "Equipment", type: "list" },
        ],
      },
    ],
  },
  {
    key: "settings",
    group: "system",
    label: "Site settings",
    icon: "settings",
    description: "Brand, contact, social links, SEO and features.",
    groups: [
      {
        title: "Brand",
        fields: [
          { name: "siteName", label: "Studio name", type: "text", half: true },
          { name: "logoText", label: "Logo text", type: "text", half: true },
          { name: "tagline", label: "Tagline", type: "text" },
        ],
      },
      {
        title: "Contact",
        fields: [
          { name: "email", label: "Email", type: "email", half: true },
          { name: "phone", label: "Phone", type: "text", half: true },
          { name: "whatsapp", label: "WhatsApp number", type: "text", half: true, help: "Digits only incl. country code — enables the floating chat button." },
          { name: "hours", label: "Opening hours", type: "text", half: true },
          { name: "address", label: "Address", type: "text", half: true },
          { name: "city", label: "City / country", type: "text", half: true },
          { name: "mapEmbedUrl", label: "Google Maps embed URL", type: "url" },
        ],
      },
      {
        title: "Social",
        fields: [
          { name: "instagram", label: "Instagram", type: "url", half: true },
          { name: "youtube", label: "YouTube", type: "url", half: true },
          { name: "vimeo", label: "Vimeo", type: "url", half: true },
          { name: "behance", label: "Behance", type: "url", half: true },
          { name: "tiktok", label: "TikTok", type: "url", half: true },
          { name: "facebook", label: "Facebook", type: "url", half: true },
          { name: "linkedin", label: "LinkedIn", type: "url", half: true },
        ],
      },
      {
        title: "SEO",
        fields: [
          { name: "metaTitle", label: "Meta title", type: "text" },
          { name: "metaDescription", label: "Meta description", type: "textarea" },
          { name: "keywords", label: "Keywords", type: "text" },
          { name: "ogImage", label: "Social share image", type: "image" },
        ],
      },
      {
        title: "Announcement bar",
        fields: [
          { name: "announcement", label: "Text", type: "text", help: "Leave empty to hide." },
          { name: "announcementLink", label: "Link", type: "text" },
        ],
      },
      {
        title: "Features",
        fields: [
          { name: "showPreloader", label: "Intro preloader", type: "boolean", half: true },
          { name: "showCursor", label: "Custom cursor", type: "boolean", half: true },
          { name: "showGrain", label: "Film grain overlay", type: "boolean", half: true },
          { name: "bookingEnabled", label: "Accept online bookings", type: "boolean", half: true },
        ],
      },
      {
        title: "Footer",
        fields: [
          { name: "footerHeadline", label: "Footer headline", type: "text" },
          { name: "copyright", label: "Copyright", type: "text" },
        ],
      },
    ],
  },
  {
    key: "pages",
    group: "pages",
    label: "Page headers & SEO",
    icon: "search",
    description: "Headings and search-engine titles, descriptions and share images for every page.",
    groups: [
      {
        title: "Global SEO",
        fields: [
          { name: "siteUrl", label: "Website URL", type: "url", placeholder: "https://yourstudio.com", help: "Used for sitemap, share links, emails and payment links." },
          { name: "googleVerification", label: "Google Search Console verification code", type: "text" },
          { name: "noindex", label: "Hide whole site from search engines", type: "select", options: ["", "true"], help: "Choose 'true' while the site is in development." },
        ],
      },
      ...PAGE_DEFS.map((p) => ({
        title: p.label,
        fields: [
          ...(p.header
            ? [
                { name: `${p.key}_eyebrow`, label: "Eyebrow", type: "text" as const, half: true },
                { name: `${p.key}_title`, label: "Heading", type: "text" as const, half: true },
                { name: `${p.key}_subtitle`, label: "Intro text", type: "textarea" as const },
              ]
            : []),
          { name: `${p.key}_metaTitle`, label: "SEO title", type: "text" as const, half: true },
          { name: `${p.key}_metaDescription`, label: "SEO description", type: "text" as const, half: true },
          { name: `${p.key}_ogImage`, label: "Social share image", type: "image" as const },
        ],
      })),
    ],
  },
  {
    key: "theme",
    group: "system",
    label: "Theme",
    icon: "palette",
    description: "Colours, fonts and corner style for the whole website.",
    groups: [
      { title: "Preset", fields: [{ name: "preset", label: "Theme preset", type: "select", options: Object.keys(THEMES) }] },
      {
        title: "Customise",
        fields: [
          { name: "accent", label: "Accent colour", type: "color" },
          { name: "radius", label: "Corners", type: "select", options: ["sharp", "soft", "round"], half: true },
          { name: "fontSans", label: "Body font", type: "select", options: SANS_FONTS, half: true },
          { name: "fontDisplay", label: "Heading font", type: "select", options: DISPLAY_FONTS, half: true },
          { name: "fontSerif", label: "Accent serif (italic words)", type: "select", options: SERIF_FONTS, half: true },
        ],
      },
      {
        title: "3D camera",
        fields: [
          { name: "cameraMode", label: "3D camera mode", type: "select", options: ["auto", "3d", "static"], help: "Auto shows a light animated photo on slow phones, data-saver or devices without WebGL." },
          { name: "cameraFallbackImage", label: "Fallback image", type: "image" },
        ],
      },
    ],
  },
  {
    key: "booking",
    group: "system",
    label: "Booking & deposits",
    icon: "calendar",
    description: "Availability rules and the online deposit taken when someone books.",
    groups: [
      {
        title: "Deposit",
        fields: [
          { name: "depositEnabled", label: "Take an online deposit when booking", type: "boolean", help: "Requires Razorpay in Integrations." },
          { name: "depositType", label: "Deposit type", type: "select", options: ["percent", "fixed"], half: true },
          { name: "depositPercent", label: "Percent of package price", type: "number", half: true },
          { name: "depositFixed", label: "Fixed amount (used when no package / type fixed)", type: "number", half: true },
          { name: "requireDeposit", label: "Booking is only confirmed after payment", type: "boolean", half: true },
        ],
      },
      {
        title: "Availability",
        fields: [
          { name: "maxBookingsPerDay", label: "Max bookings per day", type: "number", half: true },
          { name: "minNoticeDays", label: "Minimum notice (days)", type: "number", half: true },
          { name: "closedWeekdays", label: "Closed weekdays", type: "weekdays" },
          { name: "blockedDates", label: "Blocked dates (YYYY-MM-DD)", type: "tags", help: "Tip: use the Calendar page to block dates with a click." },
          { name: "bookingTerms", label: "Text under the booking form", type: "text" },
        ],
      },
    ],
  },
  {
    key: "integrations",
    group: "system",
    adminOnly: true,
    label: "Integrations & API keys",
    icon: "plug",
    description: "Razorpay, Cloudinary, SMTP email, captcha, analytics and webhooks. Secrets are never shown again after saving.",
    groups: [
      {
        title: "Razorpay — online payments",
        description: "Dashboard → Account & Settings → API Keys. Webhook URL: <your site>/api/payments/webhook (event payment.captured).",
        fields: [
          { name: "razorpayEnabled", label: "Enable Razorpay", type: "boolean" },
          { name: "razorpayKeyId", label: "Key ID", type: "text", half: true, placeholder: "rzp_live_…" },
          { name: "razorpayKeySecret", label: "Key secret", type: "password", half: true },
          { name: "razorpayWebhookSecret", label: "Webhook secret (optional)", type: "password", half: true },
          { name: "currency", label: "Currency", type: "select", options: ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD"], half: true },
        ],
      },
      {
        title: "Cloudinary — image & video CDN",
        description: "When enabled, every upload goes to Cloudinary and is served in the best format and size for each device.",
        fields: [
          { name: "cloudinaryEnabled", label: "Enable Cloudinary", type: "boolean" },
          { name: "cloudinaryCloudName", label: "Cloud name", type: "text", half: true },
          { name: "cloudinaryFolder", label: "Folder", type: "text", half: true },
          { name: "cloudinaryApiKey", label: "API key", type: "text", half: true },
          { name: "cloudinaryApiSecret", label: "API secret", type: "password", half: true },
          { name: "optimizeUploads", label: "Auto-compress local uploads to WebP (when Cloudinary is off)", type: "boolean" },
        ],
      },
      {
        title: "Email (SMTP)",
        description: "Works with Gmail (app password), Zoho, Brevo, Mailgun, Amazon SES, Hostinger… Booking alerts and client auto-replies use this.",
        fields: [
          { name: "smtpEnabled", label: "Enable email", type: "boolean" },
          { name: "smtpHost", label: "SMTP host", type: "text", half: true, placeholder: "smtp.gmail.com" },
          { name: "smtpPort", label: "Port", type: "number", half: true, placeholder: "587" },
          { name: "smtpSecure", label: "Use SSL (port 465)", type: "boolean", half: true },
          { name: "smtpUser", label: "Username", type: "text", half: true },
          { name: "smtpPass", label: "Password / app password", type: "password", half: true },
          { name: "smtpFromName", label: "From name", type: "text", half: true },
          { name: "smtpFromEmail", label: "From email", type: "email", half: true },
          { name: "notifyEmail", label: "Send studio alerts to", type: "email", half: true, help: "Defaults to the studio email in Site settings." },
        ],
      },
      {
        title: "Spam protection (captcha)",
        description: "Protects the booking form, newsletter, gallery login and contract signing.",
        fields: [
          { name: "captchaProvider", label: "Provider", type: "select", options: ["none", "turnstile", "recaptcha"], help: "turnstile = Cloudflare Turnstile · recaptcha = Google reCAPTCHA v3" },
          { name: "captchaSiteKey", label: "Site key", type: "text", half: true },
          { name: "captchaSecretKey", label: "Secret key", type: "password", half: true },
        ],
      },
      {
        title: "Analytics & tracking",
        fields: [
          { name: "gaMeasurementId", label: "Google Analytics 4 ID", type: "text", half: true, placeholder: "G-XXXXXXX" },
          { name: "gtmId", label: "Google Tag Manager ID", type: "text", half: true, placeholder: "GTM-XXXXXX" },
          { name: "metaPixelId", label: "Meta (Facebook) Pixel ID", type: "text", half: true },
        ],
      },
      {
        title: "Automation & protection",
        fields: [
          { name: "webhookUrl", label: "Webhook URL (Zapier / Make / n8n)", type: "url", help: "Receives JSON for every booking, payment, selection, print order and signature — connect it to WhatsApp, Slack or Google Sheets." },
          { name: "protectImages", label: "Disable right-click & drag on images", type: "boolean" },
        ],
      },
    ],
  },
  {
    key: "emails",
    group: "system",
    label: "Email templates",
    icon: "mail",
    description: "Every automatic email. Use {{placeholders}} like {{name}}, {{studio}}, {{link}}. Markdown supported.",
    groups: [
      { title: "Footer", fields: [{ name: "footer", label: "Footer line", type: "text" }] },
      ...[
        ["bookingClient", "Booking — auto-reply to client", "{{name}} {{service}} {{date}} {{paymentLine}}"],
        ["bookingAdmin", "Booking — alert to studio", "{{name}} {{email_client}} {{phone_client}} {{service}} {{package}} {{date}} {{location}} {{budget}} {{message}} {{adminUrl}}"],
        ["paymentClient", "Payment received", "{{name}} {{amount}} {{description}} {{paymentId}}"],
        ["galleryClient", "Gallery ready — to client", "{{name}} {{gallery}} {{link}} {{code}}"],
        ["selectionAdmin", "Favourites submitted — to studio", "{{name}} {{gallery}} {{count}} {{note}} {{adminUrl}}"],
        ["printOrderClient", "Print order confirmation", "{{name}} {{count}} {{amount}}"],
        ["invoiceClient", "Invoice / quote — to client", "{{name}} {{kind}} {{number}} {{amount}} {{link}}"],
        ["contractClient", "Contract — to client", "{{name}} {{title}} {{link}}"],
        ["contractSignedAdmin", "Contract signed — to studio", "{{name}} {{title}} {{signedAt}} {{adminUrl}}"],
      ].map(([k, label, vars]) => ({
        title: label,
        description: `Placeholders: ${vars}`,
        fields: [
          { name: `${k}Subject`, label: "Subject", type: "text" as const },
          { name: `${k}Body`, label: "Body", type: "markdown" as const },
        ],
      })),
    ],
  },
];

export const getCollectionConfig = (key: string) => collections.find((c) => c.key === key);
export const getSingletonConfig = (key: string) => singletons.find((s) => s.key === key);
