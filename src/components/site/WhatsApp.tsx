"use client";

import { motion } from "framer-motion";
import { SocialIcon } from "./Social";

export default function WhatsApp({ number }: { number: string }) {
  if (!number) return null;
  return (
    <motion.a
      href={`https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent("Hi! I'd like to know more about a shoot.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2.5, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      className="group fixed bottom-5 right-5 z-[45] flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_10px_40px_rgba(37,211,102,.35)]"
    >
      <SocialIcon name="whatsapp" className="h-6 w-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-500 group-hover:max-w-[120px] group-hover:pr-1">
        Chat with us
      </span>
    </motion.a>
  );
}
