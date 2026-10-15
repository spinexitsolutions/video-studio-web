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

export interface Singletons {
  settings: Settings;
  hero: Hero;
  home: Home;
  about: About;
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
  | "media";

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
  size: number;
  mime: string;
  alt: string;
}
