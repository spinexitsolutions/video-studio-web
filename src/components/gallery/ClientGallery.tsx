"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronLeft, ChevronRight, Download, Heart, Loader2, Minus, Plus, Printer, Send, ShoppingBag, Trash2, X } from "lucide-react";
import type { Gallery } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { formatDate, cn } from "@/lib/utils";
import { payWithRazorpay } from "@/components/site/razorpay";
import SplitText from "@/components/motion/SplitText";

type Product = { id: string; name: string; size: string; price: number; description: string };
type CartItem = { image: string; productId: string; qty: number };

interface Props {
  gallery: Gallery;
  products: Product[];
  payments: boolean;
  currency: string;
  studio: string;
}

const input =
  "w-full rounded-[calc(14px*var(--rs))] border border-paper/10 bg-paper/[0.03] px-4 py-3 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-accent";

export default function ClientGallery({ gallery, products, payments, currency, studio }: Props) {
  const g = gallery;
  const base = `/api/gallery/${g.slug}`;
  const preview = (i: number, w: number) => `${base}/image?i=${i}&w=${w}`;
  const [favorites, setFavorites] = useState<string[]>(g.favorites || []);
  const [tab, setTab] = useState<"all" | "fav">("all");
  const [viewer, setViewer] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitted, setSubmitted] = useState(g.selectionSubmittedAt);

  useEffect(() => {
    try {
      const c = localStorage.getItem(`cart-${g.id}`);
      if (c) setCart(JSON.parse(c));
    } catch {}
  }, [g.id]);
  useEffect(() => {
    try {
      localStorage.setItem(`cart-${g.id}`, JSON.stringify(cart));
    } catch {}
  }, [cart, g.id]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  const list = useMemo(() => g.images.map((src, i) => ({ src, i })).filter((x) => tab === "all" || favorites.includes(x.src)), [g.images, favorites, tab]);

  const toggleFav = useCallback(
    async (src: string) => {
      const on = !favorites.includes(src);
      setFavorites((f) => (on ? [...f, src] : f.filter((x) => x !== src)));
      const res = await fetch(`${base}/favorites`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: src, on }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setFavorites(data.favorites);
      else {
        setFavorites((f) => (on ? f.filter((x) => x !== src) : [...f, src]));
        flash(data.error || "Couldn't save — try again");
      }
    },
    [favorites, base]
  );

  const addToCart = (src: string) => {
    if (!products.length) return;
    setCart((c) => [...c, { image: src, productId: products[0].id, qty: 1 }]);
    flash("Added to your print order");
  };

  const coverIndex = Math.max(0, g.images.indexOf(g.cover));
  const max = g.maxSelections > 0 ? g.maxSelections : 0;

  return (
    <div className="pb-32">
      {/* Cover */}
      <section className="on-dark relative flex h-[88svh] min-h-[560px] items-end overflow-hidden bg-ink">
        {g.images.length > 0 && <img src={preview(coverIndex, 2400)} alt="" className="absolute inset-0 h-full w-full animate-kenburns object-cover" data-protect />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />
        <div className="container-x relative pb-16">
          <span className="eyebrow !text-white/70">
            {g.clientName ? `For ${g.clientName}` : "Private gallery"} {g.eventDate && `· ${formatDate(g.eventDate)}`}
          </span>
          <h1 className="display mt-5 max-w-5xl text-[clamp(2.8rem,7.5vw,7rem)]">
            <SplitText text={g.title} by="char" stagger={0.02} />
          </h1>
          {g.message && <p className="mt-6 max-w-xl text-lg text-white/75">{g.message}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#photos" className="btn-accent">
              View {g.images.length} photos
            </a>
            {g.allowDownload && (
              <a href={`${base}/download?all=1`} className="btn-ghost backdrop-blur-md">
                <Download className="h-4 w-4" /> Download all
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div id="photos" className="sticky top-20 z-30 mt-6 scroll-mt-24">
        <div className="container-x">
          <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-full p-1.5">
            <div className="flex gap-1">
              {(["all", "fav"] as const).map((t) =>
                t === "fav" && !g.allowFavorites ? null : (
                  <button key={t} onClick={() => setTab(t)} className={cn("relative rounded-full px-4 py-2 text-sm", tab === t ? "text-ink" : "text-paper/70")}>
                    {tab === t && <motion.span layoutId="gal-tab" className="absolute inset-0 rounded-full bg-paper" />}
                    <span className="relative flex items-center gap-1.5">
                      {t === "all" ? `All · ${g.images.length}` : <><Heart className="h-3.5 w-3.5" /> Favourites · {favorites.length}{max ? `/${max}` : ""}</>}
                    </span>
                  </button>
                )
              )}
            </div>
            <div className="flex items-center gap-1">
              {g.allowDownload && favorites.length > 0 && (
                <a href={`${base}/download?favorites=1`} className="hidden rounded-full px-4 py-2 text-sm text-paper/80 hover:bg-paper/10 sm:inline-flex sm:items-center sm:gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Favourites
                </a>
              )}
              {g.allowPrints && products.length > 0 && (
                <button onClick={() => setCartOpen(true)} className="relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm hover:bg-paper/10">
                  <ShoppingBag className="h-4 w-4" /> Prints
                  {cart.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-on-accent">{cart.length}</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="container-x mt-8">
        {list.length === 0 ? (
          <div className="py-24 text-center text-muted">
            <Heart className="mx-auto mb-3 h-8 w-8" strokeWidth={1.25} />
            Tap the heart on any photo to add it to your favourites.
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
            {list.map(({ src, i }) => {
              const fav = favorites.includes(src);
              return (
                <motion.div
                  key={src + i}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative mb-3 break-inside-avoid overflow-hidden rounded-[calc(16px*var(--rs))] bg-ink-200 sm:mb-4"
                  data-protect
                >
                  <button onClick={() => setViewer(i)} className="block w-full" aria-label={`Open photo ${i + 1}`} data-cursor-label="View">
                    <img src={preview(i, 900)} alt={`Photo ${i + 1}`} loading="lazy" className="w-full transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.04]" />
                  </button>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-2 right-2 flex gap-1.5">
                    {g.allowPrints && products.length > 0 && (
                      <button onClick={() => addToCart(src)} className="grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition group-hover:translate-y-0 group-hover:opacity-100" aria-label="Order print">
                        <Printer className="h-4 w-4" />
                      </button>
                    )}
                    {g.allowDownload && (
                      <a href={`${base}/download?i=${i}`} className="grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition group-hover:translate-y-0 group-hover:opacity-100" aria-label="Download">
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    {g.allowFavorites && (
                      <button
                        onClick={() => toggleFav(src)}
                        className={cn("grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition", fav ? "bg-accent text-on-accent" : "bg-black/50 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100")}
                        aria-label={fav ? "Remove favourite" : "Add favourite"}
                      >
                        <Heart className={cn("h-4 w-4", fav && "fill-current")} />
                      </button>
                    )}
                  </div>
                  <span className="absolute left-2 top-2 rounded-md bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-white/80 opacity-0 backdrop-blur group-hover:opacity-100">{String(i + 1).padStart(3, "0")}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Selection bar */}
      <AnimatePresence>
        {g.allowFavorites && favorites.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
            <div className="glass flex items-center gap-4 rounded-full py-2 pl-5 pr-2 shadow-2xl">
              <span className="text-sm">
                <Heart className="mr-1.5 inline h-4 w-4 fill-accent text-accent" />
                {favorites.length}
                {max ? ` / ${max}` : ""} selected {submitted && <span className="text-muted">· submitted</span>}
              </span>
              <button onClick={() => setSubmitOpen(true)} className="btn-accent !py-2.5 !text-sm">
                <Send className="h-4 w-4" /> {submitted ? "Update selection" : "Send selection"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Viewer */}
      {viewer !== null && (
        <Viewer
          count={g.images.length}
          index={viewer}
          onIndex={setViewer}
          src={(i) => preview(i, 2200)}
          fav={favorites.includes(g.images[viewer])}
          onFav={g.allowFavorites ? () => toggleFav(g.images[viewer]) : undefined}
          download={g.allowDownload ? `${base}/download?i=${viewer}` : undefined}
          onPrint={g.allowPrints && products.length ? () => addToCart(g.images[viewer]) : undefined}
        />
      )}

      {submitOpen && (
        <SubmitModal
          count={favorites.length}
          onClose={() => setSubmitOpen(false)}
          onSubmit={async (note) => {
            const res = await fetch(`${base}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) });
            if (res.ok) {
              setSubmitted(new Date().toISOString());
              setSubmitOpen(false);
              flash(`Thank you! ${studio} has received your selection.`);
            } else flash("Couldn't send — please try again");
          }}
        />
      )}

      {cartOpen && (
        <PrintCart
          cart={cart}
          setCart={setCart}
          products={products}
          currency={currency}
          payments={payments}
          thumb={(src) => preview(g.images.indexOf(src), 300)}
          slug={g.slug}
          onClose={() => setCartOpen(false)}
          onDone={(m) => {
            setCart([]);
            setCartOpen(false);
            flash(m);
          }}
        />
      )}

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass fixed left-1/2 top-24 z-[96] -translate-x-1/2 rounded-full px-5 py-3 text-sm shadow-2xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Viewer({ count, index, onIndex, src, fav, onFav, download, onPrint }: { count: number; index: number; onIndex: (i: number | null) => void; src: (i: number) => string; fav: boolean; onFav?: () => void; download?: string; onPrint?: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndex(null);
      if (e.key === "ArrowRight") onIndex((index + 1) % count);
      if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
      if (e.key.toLowerCase() === "f") onFav?.();
    };
    window.addEventListener("keydown", k);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.documentElement.style.overflow = "";
    };
  }, [index, count, onIndex, onFav]);
  return createPortal(
    <div className="on-dark fixed inset-0 z-[95] flex flex-col bg-black/95 backdrop-blur-xl" data-lenis-prevent data-protect>
      <div className="flex items-center justify-between p-4">
        <span className="font-mono text-xs tracking-[0.3em] text-white/60">
          {String(index + 1).padStart(3, "0")} / {String(count).padStart(3, "0")}
        </span>
        <div className="flex gap-2">
          {onPrint && (
            <button onClick={onPrint} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Order print">
              <Printer className="h-4 w-4" />
            </button>
          )}
          {download && (
            <a href={download} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Download">
              <Download className="h-4 w-4" />
            </a>
          )}
          {onFav && (
            <button onClick={onFav} className={cn("grid h-11 w-11 place-items-center rounded-full", fav ? "bg-accent text-on-accent" : "bg-white/10 hover:bg-white/20")} aria-label="Favourite">
              <Heart className={cn("h-4 w-4", fav && "fill-current")} />
            </button>
          )}
          <button onClick={() => onIndex(null)} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={src(index)}
            alt=""
            className="max-h-full max-w-full rounded-md object-contain"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, i) => {
              if (i.offset.x < -80) onIndex((index + 1) % count);
              if (i.offset.x > 80) onIndex((index - 1 + count) % count);
            }}
          />
        </AnimatePresence>
        <button onClick={() => onIndex((index - 1 + count) % count)} className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Previous">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => onIndex((index + 1) % count)} className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Next">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.body
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[97] flex justify-end" data-lenis-prevent>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative flex h-full w-full max-w-md flex-col bg-ink-100 text-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-paper/10 p-5">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper/10" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </motion.div>
    </div>,
    document.body
  );
}

function SubmitModal({ count, onClose, onSubmit }: { count: number; onClose: () => void; onSubmit: (note: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Sheet title="Send your selection" onClose={onClose}>
      <p className="text-muted">
        You&apos;ve chosen <span className="font-semibold text-paper">{count} photos</span>. We&apos;ll use them for your album and final edits. You can still change your favourites afterwards.
      </p>
      <label className="mt-6 block text-sm text-muted">Anything we should know? (optional)</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} placeholder="e.g. Please make #012 black & white" className={cn(input, "mt-2 resize-none")} />
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onSubmit(note);
          setBusy(false);
        }}
        className="btn-accent mt-6 w-full"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Send to the studio</>}
      </button>
    </Sheet>
  );
}

function PrintCart({
  cart,
  setCart,
  products,
  currency,
  payments,
  thumb,
  slug,
  onClose,
  onDone,
}: {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  products: Product[];
  currency: string;
  payments: boolean;
  thumb: (src: string) => string;
  slug: string;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [f, setF] = useState({ name: "", email: "", phone: "", address: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const total = cart.reduce((s, c) => s + (products.find((p) => p.id === c.productId)?.price || 0) * c.qty, 0);
  const update = (i: number, patch: Partial<CartItem>) => setCart((c) => c.map((x, k) => (k === i ? { ...x, ...patch } : x)));

  return (
    <Sheet title="Your print order" onClose={onClose}>
      {cart.length === 0 ? (
        <div className="py-16 text-center text-muted">
          <Printer className="mx-auto mb-3 h-8 w-8" strokeWidth={1.25} />
          Tap the printer icon on any photo to add it here.
          <ul className="mt-8 space-y-2 text-left text-sm">
            {products.map((p) => (
              <li key={p.id} className="flex justify-between rounded-xl bg-paper/[0.04] px-4 py-3">
                <span>
                  {p.name} <span className="text-muted">· {p.size}</span>
                </span>
                <span>{formatMoney(p.price, currency)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const res = await fetch(`/api/gallery/${slug}/prints`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, items: cart }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setError(data.error || "Something went wrong");
              setBusy(false);
              return;
            }
            let paid = false;
            if (data.checkout) {
              try {
                paid = await payWithRazorpay(data.checkout);
              } catch (err: any) {
                setError(err.message);
              }
            }
            setBusy(false);
            onDone(paid ? "Payment received — your prints are on their way to production!" : "Order placed! We'll email you to confirm payment & delivery.");
          }}
          className="space-y-4"
        >
          <ul className="space-y-3">
            {cart.map((c, i) => (
              <li key={i} className="flex gap-3 rounded-2xl bg-paper/[0.04] p-3">
                <img src={thumb(c.image)} alt="" className="h-20 w-16 shrink-0 rounded-lg object-cover" data-protect />
                <div className="min-w-0 flex-1 space-y-2">
                  <select value={c.productId} onChange={(e) => update(i, { productId: e.target.value })} className={cn(input, "py-2 text-sm")}>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-ink-100">
                        {p.name} · {p.size} — {formatMoney(p.price, currency)}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => update(i, { qty: Math.max(1, c.qty - 1) })} className="grid h-8 w-8 place-items-center rounded-full bg-paper/10" aria-label="Less">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">{c.qty}</span>
                      <button type="button" onClick={() => update(i, { qty: Math.min(50, c.qty + 1) })} className="grid h-8 w-8 place-items-center rounded-full bg-paper/10" aria-label="More">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button type="button" onClick={() => setCart((x) => x.filter((_, k) => k !== i))} className="grid h-8 w-8 place-items-center rounded-full text-red-500 hover:bg-red-500/10" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-paper/10 pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
          <input required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} />
          <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={input} />
          <input required placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={input} />
          <textarea required placeholder="Shipping address" rows={3} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className={cn(input, "resize-none")} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button disabled={busy} className="btn-accent w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> {payments ? `Pay ${formatMoney(total, currency)}` : "Place order"}</>}
          </button>
          <p className="text-center text-xs text-muted">{payments ? "Secure payment by Razorpay." : "We'll confirm and send a payment link by email."}</p>
        </form>
      )}
    </Sheet>
  );
}
