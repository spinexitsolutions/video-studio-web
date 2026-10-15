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
  | "sections";

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

export interface CollectionConfig {
  key: string;
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
  key: "settings" | "hero" | "home" | "about";
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
          { name: "price", label: "Price", type: "text", half: true },
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
];

export const singletons: SingletonConfig[] = [
  {
    key: "hero",
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
          { name: "accentColor", label: "Accent colour", type: "color", help: "Used for highlights, buttons and the 3D camera ring." },
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
];

export const getCollectionConfig = (key: string) => collections.find((c) => c.key === key);
export const getSingletonConfig = (key: string) => singletons.find((s) => s.key === key);
