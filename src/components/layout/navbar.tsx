"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-beige/80 backdrop-blur-md border-b border-beige-dark/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Left */}
        <Link href="/" className="font-black text-2xl tracking-tighter text-dark">
          Mingles<span className="text-primary">.</span>
        </Link>

        {/* Desktop Nav Center */}
        <div className="hidden md:flex items-center gap-8 font-medium text-dark/80">
          <Link href="#how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
          <Link href="#story" className="hover:text-primary transition-colors">Story</Link>
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">
           <Button variant="link" className="text-dark">Member Login</Button>
           <Button>Join Mingles</Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6 text-dark" /> : <Menu className="h-6 w-6 text-dark" />}
        </button>
      </div>

       {/* Mobile Nav Overlay */}
       <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-16 left-0 w-full bg-beige border-b border-beige-dark p-4 flex flex-col gap-4 shadow-lg"
          >
            <Link href="#how-it-works" className="text-lg font-medium p-2" onClick={() => setIsOpen(false)}>How It Works</Link>
            <Link href="#story" className="text-lg font-medium p-2" onClick={() => setIsOpen(false)}>Story</Link>
            <div className="h-px bg-beige-dark/50 my-2" />
            <Button variant="outline" className="w-full justify-center">Member Login</Button>
            <Button className="w-full justify-center">Join Mingles</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}