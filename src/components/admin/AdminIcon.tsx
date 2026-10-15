import {
  Award,
  BarChart3,
  Briefcase,
  Camera,
  CalendarCheck,
  Database,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Images,
  Info,
  LayoutDashboard,
  ListOrdered,
  Mail,
  PenLine,
  Quote,
  Settings,
  Sparkles,
  Tag,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  images: Images,
  briefcase: Briefcase,
  tag: Tag,
  quote: Quote,
  users: Users,
  pen: PenLine,
  help: HelpCircle,
  camera: Camera,
  list: ListOrdered,
  chart: BarChart3,
  award: Award,
  sparkles: Sparkles,
  home: Home,
  info: Info,
  settings: Settings,
  dashboard: LayoutDashboard,
  calendar: CalendarCheck,
  mail: Mail,
  media: ImageIcon,
  user: UserCog,
  database: Database,
};

export default function AdminIcon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const I = icons[name] || Sparkles;
  return <I className={className} strokeWidth={1.75} />;
}
