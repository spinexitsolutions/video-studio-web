"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import VideoModal from "@/components/site/VideoModal";

export default function PlayButton({ url, label = "Watch the film" }: { url: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-accent">
        <Play className="h-4 w-4 fill-current" /> {label}
      </button>
      <VideoModal url={url} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
