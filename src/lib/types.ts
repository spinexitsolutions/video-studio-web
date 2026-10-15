export type ID = string;

export interface BaseDoc {
  id: ID;
  order: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface Settings {
  siteName: string;
  logoText: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  accentColor: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  hours: string;
  mapEmbedUrl: string;
  instagram: string;
  youtube: string;
  vimeo: string;
  behance: string;
  tiktok: string;
  facebook: string;
  linkedin: string;
  announcement: string;
  announcementLink: string;
  showPreloader: boolean;
  showCursor: boolean;
  showGrain: boolean;
  bookingEnabled: boolean;
  footerHeadline: string;
  copyright: string;
}

export interface Hero {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  rotatingWords: string[];
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  slides: string[];
  videoUrl: string;
  showViewfinder: boolean;
  location: string;
}

export interface SectionToggle {
  key: string;
  label: string;
  enabled: boolean;
}

export interface Home {
  sections: SectionToggle[];
  manifesto: string;
  cameraEyebrow: string;
  cameraTitle: string;
  cameraSubtitle: string;
  servicesEyebrow: string;
  servicesTitle: string;
  workEyebrow: string;
  workTitle: string;
  showreelTitle: string;
  showreelSubtitle: string;
  showreelPoster: string;
  showreelVideoUrl: string;
  retouchTitle: string;
  retouchSubtitle: string;
  retouchBefore: string;
  retouchAfter: string;
  processTitle: string;
  pricingTitle: string;
  pricingSubtitle: string;
  testimonialsTitle: string;
  teamTitle: string;
  faqTitle: string;
  journalTitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaImage: string;
}

export interface About {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  story: string;
  values: string[];
  awards: string[];
  equipment: string[];
}

export interface Theme {
  preset: string;
  accent: string;
  fontSans: string;
  fontDisplay: string;
  fontSerif: string;
  radius: "sharp" | "soft" | "round";
  cameraMode: "auto" | "3d" | "static";
  cameraFallbackImage: string;
}

export interface Integrations {
  // Razorpay
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
  currency: string;
  // Cloudinary
  cloudinaryEnabled: boolean;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  cloudinaryFolder: string;
  // SMTP
  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFromName: string;
  smtpFromEmail: string;
  notifyEmail: string;
  // Captcha
  captchaProvider: "none" | "turnstile" | "recaptcha";
  captchaSiteKey: string;
  captchaSecretKey: string;
  // Analytics
  gaMeasurementId: string;
  gtmId: string;
  metaPixelId: string;
  // Automation
  webhookUrl: string;
  // Image protection
  protectImages: boolean;
  optimizeUploads: boolean;
}

export interface BookingSettings {
  depositEnabled: boolean;
  depositType: "percent" | "fixed";
  depositPercent: number;
  depositFixed: number;
  requireDeposit: boolean;
  maxBookingsPerDay: number;
  minNoticeDays: number;
  closedWeekdays: string[];
  blockedDates: string[];
  bookingTerms: string;
}

export interface EmailTemplates {
  footer: string;
  bookingClientSubject: string;
  bookingClientBody: string;
  bookingAdminSubject: string;
  bookingAdminBody: string;
  paymentClientSubject: string;
  paymentClientBody: string;
  galleryClientSubject: string;
  galleryClientBody: string;
  selectionAdminSubject: string;
  selectionAdminBody: string;
  printOrderClientSubject: string;
  printOrderClientBody: string;
  invoiceClientSubject: string;
  invoiceClientBody: string;
  contractClientSubject: string;
  contractClientBody: string;
  contractSignedAdminSubject: string;
  contractSignedAdminBody: string;
}

export interface PageMeta {
  [key: string]: string;
}

export interface Singletons {
  settings: Settings;
  hero: Hero;
  home: Home;
  about: About;
  theme: Theme;
  integrations: Integrations;
  booking: BookingSettings;
  emails: EmailTemplates;
  pages: PageMeta;
}

export type SingletonKey = keyof Singletons;

export type CollectionKey =
  | "projects"
  | "services"
  | "packages"
  | "testimonials"
  | "team"
  | "faqs"
  | "posts"
  | "clients"
  | "stats"
  | "process"
  | "cameraFeatures"
  | "bookings"
  | "subscribers"
  | "users"
  | "media"
  | "galleries"
  | "printProducts"
  | "printOrders"
  | "invoices"
  | "contracts"
  | "payments"
  | "customPages";

export interface Database {
  version: number;
  singletons: Singletons;
  collections: Record<CollectionKey, BaseDoc[]>;
}

export interface Project extends BaseDoc {
  title: string;
  slug: string;
  category: string;
  kind: "photo" | "video";
  client: string;
  year: string;
  location: string;
  cover: string;
  gallery: string[];
  videoUrl: string;
  excerpt: string;
  description: string;
  featured: boolean;
  published: boolean;
}

export interface Service extends BaseDoc {
  title: string;
  slug: string;
  icon: string;
  summary: string;
  description: string;
  image: string;
  features: string[];
  startingPrice: string;
  published: boolean;
}

export interface Package extends BaseDoc {
  name: string;
  price: string;
  amount: number;
  unit: string;
  description: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
  published: boolean;
}

export interface Testimonial extends BaseDoc {
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
  published: boolean;
}

export interface TeamMember extends BaseDoc {
  name: string;
  role: string;
  bio: string;
  photo: string;
  instagram: string;
  published: boolean;
}

export interface Faq extends BaseDoc {
  question: string;
  answer: string;
  published: boolean;
}

export interface Post extends BaseDoc {
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  content: string;
  author: string;
  tags: string[];
  publishedAt: string;
  published: boolean;
}

export interface Client extends BaseDoc {
  name: string;
  logo: string;
  url: string;
  published: boolean;
}

export interface Stat extends BaseDoc {
  label: string;
  value: number;
  suffix: string;
  published: boolean;
}

export interface ProcessStep extends BaseDoc {
  title: string;
  description: string;
  duration: string;
  published: boolean;
}

export interface CameraFeature extends BaseDoc {
  title: string;
  description: string;
  spec: string;
  specLabel: string;
  published: boolean;
}

export type BookingStatus = "new" | "contacted" | "confirmed" | "completed" | "cancelled";

export interface Booking extends BaseDoc {
  name: string;
  email: string;
  phone: string;
  service: string;
  package: string;
  date: string;
  location: string;
  budget: string;
  message: string;
  status: BookingStatus;
  notes: string;
  paymentStatus?: "none" | "pending" | "deposit_paid";
  depositAmount?: number;
  paymentToken?: string;
}

export interface Subscriber extends BaseDoc {
  email: string;
}

export interface User extends BaseDoc {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "editor";
}

export interface Media extends BaseDoc {
  filename: string;
  originalName: string;
  url: string;
  original?: string;
  provider?: "local" | "cloudinary";
  width?: number;
  height?: number;
  size: number;
  mime: string;
  alt: string;
}

export interface Gallery extends BaseDoc {
  title: string;
  slug: string;
  clientName: string;
  clientEmail: string;
  accessCode: string;
  eventDate: string;
  expiresAt: string;
  cover: string;
  images: string[];
  message: string;
  allowDownload: boolean;
  allowFavorites: boolean;
  allowPrints: boolean;
  watermark: boolean;
  maxSelections: number;
  favorites: string[];
  clientNote: string;
  selectionSubmittedAt: string;
  published: boolean;
}

export interface PrintProduct extends BaseDoc {
  name: string;
  size: string;
  description: string;
  price: number;
  published: boolean;
}

export interface PrintItem {
  image: string;
  productId: string;
  product: string;
  qty: number;
  price: number;
}

export interface PrintOrder extends BaseDoc {
  galleryId: string;
  galleryTitle: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  items: PrintItem[];
  total: number;
  status: "pending" | "paid" | "printing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  notes: string;
}

export interface LineItem {
  description: string;
  qty: number;
  rate: number;
}

export interface Invoice extends BaseDoc {
  kind: "invoice" | "quote";
  number: string;
  token: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  items: LineItem[];
  taxPercent: number;
  discount: number;
  notes: string;
  status: "draft" | "sent" | "accepted" | "declined" | "paid";
  paidAt: string;
}

export interface Contract extends BaseDoc {
  title: string;
  token: string;
  clientName: string;
  clientEmail: string;
  eventDate: string;
  body: string;
  status: "draft" | "sent" | "signed";
  signedName: string;
  signature: string;
  signedAt: string;
  signedIp: string;
}

export interface Payment extends BaseDoc {
  token: string;
  purpose: "booking" | "invoice" | "print";
  refId: string;
  description: string;
  amount: number; // in major units (e.g. rupees)
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  provider: "razorpay";
  providerOrderId: string;
  providerPaymentId: string;
  status: "created" | "paid" | "failed";
  paidAt: string;
}

export interface CustomPage extends BaseDoc {
  title: string;
  slug: string;
  content: string;
  showInFooter: boolean;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
}
