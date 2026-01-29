'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Trophy, Wine, Gamepad2, Smile, Menu, X } from 'lucide-react';

/* --- COMPONENTS --- */

// Navbar
const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-mingles-beige/90 backdrop-blur-md border-b-2 border-mingles-dark py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
            {/* Placeholder logo shape */}
            <Link href={"/"} className="w-10 h-10 bg-mingles-red rounded-full border-2 border-mingles-dark flex items-center justify-center text-white font-bold">
                <Image src={"/images/Mingles_Logo_Blanco.png"} alt='Mingles' width={120} height={120} />
            </Link>
        </div>

        {/* Center: Desktop Menu */}
        <div className="hidden md:flex gap-8 font-bold text-sm uppercase tracking-wide">
          <Link href="#how-it-works" className="hover:text-mingles-red transition-colors">How It Works</Link>
          <Link href="#story" className="hover:text-mingles-red transition-colors">Story</Link>
        </div>

        {/* Right: CTA & Web3 */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="font-bold hover:underline">Member Login</Link>
          {/* Usamos un wrapper custom para el botón de RainbowKit si quieres, o el default */}
          <div className="scale-90 origin-right">
             <ConnectButton label="Join Mingles" showBalance={false} accountStatus="avatar" />
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
            {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-mingles-beige border-b-2 border-mingles-dark p-4 flex flex-col gap-4 shadow-xl">
             <Link href="#how-it-works" className="font-bold">How It Works</Link>
             <Link href="#story" className="font-bold">Story</Link>
             <hr className="border-mingles-dark/20"/>
             <Link href="/login" className="font-bold">Member Login</Link>
             <ConnectButton label="Join Mingles" showBalance={false} />
        </div>
      )}
    </nav>
  );
};

// Section 1: Hero
const Hero = () => (
  <section className="relative pt-12 pb-20 overflow-hidden">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
      <div className="md:w-1/2 z-10">
        <h1 className="text-5xl md:text-7xl font-black leading-[0.95] mb-6">
          Make friends and <span className="text-mingles-red">be part</span> of something <span className="text-agave-green">exciting.</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 font-medium text-gray-700">
          A social club built around tequila culture, games, and shared experiences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="btn-primary text-lg">Join Mingles</button>
          <Link href="#what-you-get" className="flex items-center justify-center font-bold text-lg hover:text-mingles-red transition-colors gap-2 group">
            See What’s Inside <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>
      </div>
      
      {/* Visual: Hero Image / Animation */}
      <div className="md:w-1/2 relative">
        <div className="absolute inset-0 bg-mingles-red/10 rounded-full blur-3xl transform scale-90"></div>
        {/* Placeholder for "Mingles Characters in social scene" */}
        <div className="relative bg-transparent border-4 border-mingles-dark rounded-3xl p-4 shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] rotate-2 hover:rotate-0 transition-transform duration-500 aspect-square flex items-center justify-center overflow-hidden">
             <Image className='rounded-xl' src={"/images/events/IMG_6187.jpeg"} alt='Cheers!' width={1000} height={1000} />
             {/*<span className="text-gray-400 font-bold text-center p-8">
                 [IMAGEN AQUI: Personajes Mingles (Gusanos Tequileros) jugando y brindando en estilo Crypto/Gamer 3D o 2D vibrante]
             </span>*/}
        </div>
        {/* Floating elements decoration */}
        <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-6 -right-6 bg-agave-green text-white p-4 rounded-xl border-2 border-mingles-dark font-bold shadow-lg">
            🍻 Cheers!
        </motion.div>
      </div>
    </div>
  </section>
);

// Section 2: Problem
const Problem = () => (
  <section className="py-20 bg-mingles-beige border-y-2 border-mingles-dark">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/2 order-2 md:order-1">
             {/* Visual: Outside looking in */}
             <div className="card-panel aspect-video flex items-center justify-center bg-gray-100">
                <Image className='rounded-xl' src={"/images/MingleAlone.png"} alt='Making Friends' width={800} height={800} />
             </div>
        </div>
        <div className="md:w-1/2 order-1 md:order-2">
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Making friends shouldn’t be <span className="underline decoration-wavy decoration-mingles-red">hard.</span></h2>
            <ul className="space-y-6">
                {[
                    "Busy schedules, plans fall apart.",
                    "Can’t find your people.",
                    "Missing out on exciting opportunities."
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-xl font-medium">
                        <div className="w-8 h-8 rounded-full bg-mingles-red text-white flex items-center justify-center border-2 border-mingles-dark flex-shrink-0">
                            <X size={18} strokeWidth={4} />
                        </div>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    </div>
  </section>
);

// Section 3: Guide
const Guide = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 text-center max-w-3xl">
        <p className="text-2xl md:text-3xl font-black mb-6">
            We know how hard it is to make new friends and keep life fun.
        </p>
        <p className="text-lg text-gray-700 mb-12">
            That's why we’ve already brought together <span className="font-bold bg-agave-light px-1">900+ people</span> through tequila, culture, and events.
        </p>
    </div>
    {/* Grid of photos */}
    <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
            {id: 1, name: "Event 1", url: "/images/18.png"},
            {id: 2, name: "Event 2", url: "/images/PARIS2025.jpg"},
            {id: 3, name: "Event 3", url: "/images/4647.png"},
            {id: 4, name: "Event 4", url: "/MinglesJugando.png"}
        ].map((i) => (
            <div key={i.id} className={`rounded-2xl border-2 border-mingles-dark overflow-hidden h-48 bg-gray-200 relative ${i.id%2===0 ? 'rotate-1' : '-rotate-1'}`}>
                {/* Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold text-xs">
                    <Image className='rounded-xl' alt={i.name} src={i.url} width={500} height={500} />
                    
                </div>
            </div>
        ))}
    </div>
  </section>
);

// Section 4: How It Works
const HowItWorks = () => (
  <section id="how-it-works" className="py-20 bg-mingles-dark text-mingles-beige">
    <div className="container mx-auto px-4">
        <h2 className="text-4xl font-black text-center mb-16 text-white">How Mingles Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
            {[
                { icon: Users, title: "1. Join", desc: "Become a member." },
                { icon: Wine, title: "2. Show up", desc: "Join experiences, games, and events." },
                { icon: Smile, title: "3. Connect", desc: "Meet people & build real connections." },
            ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-mingles-red rounded-2xl border-4 border-white flex items-center justify-center mb-6 shadow-[8px_8px_0px_0px_#FFF] group-hover:translate-y-[-5px] transition-transform">
                        <step.icon size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className="text-lg opacity-80">{step.desc}</p>
                </div>
            ))}
        </div>
        <div className="text-center mt-16">
            <button className="bg-agave-green text-white px-8 py-4 rounded-xl font-bold border-2 border-white shadow-[4px_4px_0px_0px_#FFF] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#FFF] transition-all text-xl cursor-pointer">
                Join Mingles
            </button>
        </div>
    </div>
  </section>
);

// Section 5: What You Get
const WhatYouGet = () => (
    <section id="what-you-get" className="py-20">
      <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-12">What you get</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                  { title: "Meetups & experiences", icon: "🎟️" },
                  { title: "Tequila culture & Collectibles", icon: "🥃" },
                  { title: "Games & challenges", icon: "🎲" },
                  { title: "Friends you actually keep", icon: "🤝" },
              ].map((card, i) => (
                  <div key={i} className="card-panel p-8 flex flex-col items-center text-center hover:bg-red-50 transition-colors">
                      <div className="text-5xl mb-4">{card.icon}</div>
                      <h3 className="text-xl font-bold leading-tight">{card.title}</h3>
                  </div>
              ))}
          </div>
      </div>
    </section>
);

// Section 6: Story / IP
const Story = () => (
    <section id="story" className="py-20 bg-agave-green text-white border-y-2 border-mingles-dark">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
              <h2 className="text-4xl font-black mb-6">Meet the Mingles</h2>
              <p className="text-xl mb-8 leading-relaxed opacity-90">
                  Funny guides to tequila culture—built to make learning social and fun. Our "Gusanos Tequileros" aren't just mascots; they are your ticket to the underground world of agave.
              </p>
              <Link href="#" className="inline-block border-b-2 border-white pb-1 font-bold hover:text-mingles-beige">
                  Explore the Story →
              </Link>
          </div>
          <div className="md:w-1/2">
               {/* Visual: Comic strip style or Character lineup */}
               <div className="bg-white/10 backdrop-blur-sm border-2 border-white rounded-3xl p-6">
                   <div className="aspect-video bg-black/20 rounded-xl flex items-center justify-center">
                       <Image className='rounded-xl' src={"/images/IMG_4123-p-2600.jpg"} alt='Meet. Mingles' width={800} height={800} />
                       {/*[IP CHARACTER LINEUP]*/}
                   </div>
               </div>
          </div>
      </div>
    </section>
);

// Section 7: Experiences Gallery
const Gallery = () => (
    <section className="py-20">
      <div className="container mx-auto px-4 mb-10">
          <h2 className="text-4xl font-black">This is Mingles</h2>
          <p className="text-xl text-gray-600 font-bold">Real people. Real moments.</p>
      </div>
      {/* Masonry-ish grid */}
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-4 h-96 md:h-[500px]">
          <div className="rounded-xl col-span-2 row-span-2 relative overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-500">
                <Image className='rounded-2xl' src={"/images/PARIS2025.jpg"} alt='Party' height={800} width={800} />
            </div>
          </div>
          <div className="rounded-xl relative overflow-hidden">
             <span className="absolute inset-0 flex items-center justify-center font-bold text-gray-500">
                <Image className='rounded-2xl' src={"/images/events/IMG_5551.jpeg"} alt='Party' height={400} width={400} />
             </span>
          </div>
          <div className="rounded-xl relative overflow-hidden">
             <span className="absolute inset-0 flex items-center justify-center font-bold text-gray-500">
                <Image className='rounded-2xl' src={"/images/events/IMG_5593.jpeg"} alt='Party' height={400} width={400} />
             </span>
          </div>
      </div>
    </section>
);

// Section 8: Social Proof
const SocialProof = () => (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-12">Members say it best</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { quote: "I made real friends. Not just networking contacts.", author: "@alex_web3" },
                    { quote: "It got me out of my routine. The tequila games are genius.", author: "@sarah_j" },
                    { quote: "Feels like I belong. Finally a cool social club.", author: "@mike_nft" },
                ].map((t, i) => (
                    <div key={i} className="card-panel p-6 bg-mingles-beige relative">
                        <div className="text-4xl text-mingles-red absolute top-4 left-4 font-serif">“</div>
                        <p className="text-lg font-medium italic mb-4 mt-4 relative z-10">{t.quote}</p>
                        <p className="font-bold text-sm text-gray-500 uppercase tracking-widest">{t.author}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// Section 9: CTA Join
const Join = () => (
    <section className="py-24 bg-mingles-red text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-md">Join Mingles</h2>
            <p className="text-2xl mb-10 font-bold max-w-2xl mx-auto">Join the club. Show up. Meet people.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-white text-mingles-red px-8 py-4 rounded-xl font-bold border-2 border-mingles-dark shadow-[4px_4px_0px_0px_#1A1A1A] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1A1A1A] transition-all text-xl w-full sm:w-auto cursor-pointer">
                    Join Mingles
                </button>
                <Link href="/login" className="font-bold text-white underline hover:text-mingles-beige">
                    Member Login
                </Link>
            </div>
        </div>
    </section>
);

// Footer
const Footer = () => (
    <footer className="bg-mingles-dark text-white pt-20 pb-10">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16 border-b border-gray-800 pb-12">
            <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    
                    <div className="w-8 h-8 bg-mingles-red rounded-full flex items-center justify-center font-bold">
                        <Image src={"/images/Mingles_Logo_Blanco.png"} alt='Mingles' width={120} height={120} />
                    </div>
                </div>
                <h3 className="text-3xl font-bold mb-6 max-w-sm">Make new friends. Keep life fun.</h3>
                <button className="bg-mingles-red text-white px-6 py-2 rounded-lg font-bold border border-white/20 hover:bg-mingles-red-hover transition-colors">
                    Join Mingles
                </button>
            </div>
            
            <div>
                <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-4 text-sm">Legal</h4>
                <ul className="space-y-2">
                    <li><Link href="#" className="hover:text-mingles-red">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-mingles-red">Terms of Service</Link></li>
                </ul>
            </div>
            <div>
                 <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-4 text-sm">Connect</h4>
                <ul className="space-y-2">
                    <li><Link href="https://x.com/MinglesNFT" className="hover:text-mingles-red">Twitter / X</Link></li>
                    <li><Link href="⁠https://giphy.com/minglestequila" className="hover:text-mingles-red">Giphy</Link></li>
                    <li><Link href="⁠https://discord.gg/5ubwCpDZFa" className="hover:text-mingles-red">Discord</Link></li>
                    <li><a href="mailto:mingles@mingles.com" className="hover:text-mingles-red">Contact Us</a></li>
                </ul>
            </div>
        </div>
        <div className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Mingles Social Club. All rights reserved.
        </div>
    </footer>
);

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Problem />
      <Guide />
      <HowItWorks />
      <WhatYouGet />
      <Story />
      <Gallery />
      <SocialProof />
      <Join />
      <Footer />
    </main>
  );
}