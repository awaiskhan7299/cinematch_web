"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { ChevronDown, Flame, Home, Bookmark } from "lucide-react";
import CommandSearch from "./CommandSearch";
import { useLiked } from "../lib/useMovieList";

const INDUSTRIES = [
  { label: "Hollywood", lang: "en" },
  { label: "Bollywood", lang: "hi" },
  { label: "K-Drama / Korean", lang: "ko" },
  { label: "Anime / Japan", lang: "ja" },
  { label: "Urdu", lang: "ur" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showIndustries, setShowIndustries] = useState(false);
  const { liked } = useLiked();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const link = (href: string) =>
    `relative py-1 transition-colors ${pathname === href ? "text-white" : "text-white/55 hover:text-white"}`;

  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Flame },
    { href: "/list", label: "My List", icon: Bookmark, badge: liked.length },
  ];

  return (
    <>
      <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-brand-gradient origin-left z-[60]" style={{ scaleX }} />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || pathname !== "/" ? "bg-background/75 backdrop-blur-xl border-b border-white/10 py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-10">
            <Link href="/" className="font-display text-2xl font-black tracking-tight">
              Cine<span className="text-brand">Match</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="/" className={link("/")}>Home</Link>
              <Link href="/discover" className={link("/discover")}>Discover</Link>

              <div
                className="relative py-3"
                onMouseEnter={() => setShowIndustries(true)}
                onMouseLeave={() => setShowIndustries(false)}
                onFocus={() => setShowIndustries(true)}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setShowIndustries(false); }}
              >
                <button className="flex items-center gap-1 text-white/55 hover:text-white transition-colors" aria-haspopup="menu" aria-expanded={showIndustries}>
                  Industries <ChevronDown size={14} className={`transition-transform duration-300 ${showIndustries ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {showIndustries && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-0 w-52 glass-panel py-2 flex flex-col bg-background/90"
                      role="menu"
                    >
                      {INDUSTRIES.map((i) => (
                        <Link
                          key={i.lang}
                          href={`/discover?lang=${i.lang}`}
                          role="menuitem"
                          onClick={() => setShowIndustries(false)}
                          className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {i.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/list" className={`${link("/list")} flex items-center gap-2`}>
                My List
                {liked.length > 0 && (
                  <span className="rounded-full bg-accent/90 px-1.5 text-[11px] font-bold leading-5 min-w-5 text-center">{liked.length}</span>
                )}
              </Link>
            </div>
          </div>

          <CommandSearch />
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-background/85 backdrop-blur-xl safe-bottom">
        <div className="grid grid-cols-3">
          {tabs.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${active ? "text-white" : "text-white/45"}`}>
                <span className="relative">
                  <Icon size={22} className={active ? "text-accent" : ""} />
                  {!!badge && <span className="absolute -top-1.5 -right-3 rounded-full bg-accent px-1 text-[10px] font-bold leading-4">{badge}</span>}
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
