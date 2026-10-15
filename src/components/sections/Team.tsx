"use client";

import { motion } from "framer-motion";
import type { TeamMember } from "@/lib/types";
import Img from "@/components/site/Img";
import SectionHeading from "./SectionHeading";

export default function Team({ team, title, index }: { team: TeamMember[]; title: string; index?: string }) {
  return (
    <section className="py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading eyebrow="The crew" title={title} index={index} />
        <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {team.map((m, i) => (
            <motion.figure
              key={m.id}
              className="group"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-ink-200">
                <Img src={m.photo} alt={m.name} className="h-full w-full object-cover grayscale transition-all duration-[1.2s] ease-expo group-hover:scale-105 group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <p className="absolute inset-x-0 bottom-0 translate-y-4 p-5 text-sm leading-relaxed text-white/85 opacity-0 transition-all duration-700 ease-expo group-hover:translate-y-0 group-hover:opacity-100">
                  {m.bio}
                </p>
              </div>
              <figcaption className="mt-4">
                <p className="text-lg font-medium">{m.name}</p>
                <p className="text-sm text-muted">{m.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
