import { Aperture, Baby, Box, Building2, Camera, Clapperboard, Film, Heart, Mic, Plane, Sparkles, User, type LucideIcon } from "lucide-react";

const map: Record<string, LucideIcon> = {
  heart: Heart,
  box: Box,
  clapperboard: Clapperboard,
  user: User,
  sparkles: Sparkles,
  mic: Mic,
  camera: Camera,
  film: Film,
  aperture: Aperture,
  plane: Plane,
  building: Building2,
  baby: Baby,
};

export default function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = map[name] || Camera;
  return <Icon className={className} strokeWidth={1.5} />;
}
