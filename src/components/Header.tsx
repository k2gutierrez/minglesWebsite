"use client";

import { useState } from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar-4 w-nav sm:px-10 py-2 font-[family-name:var(--font-pressura)]">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <Link href="/lair" className="flex items-start">
                    <Image
                        src="/images/Mingles_Simbolo_Blanco.png"
                        alt="Mingles Logo"
                        width={45}
                        height={45}
                        className=""
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-10">
                    <Link href="/lair" className="text-white hover:text-red-300 transition-colors">
                        LAIR
                    </Link>
                    <Link href="/cava" className="text-white hover:text-red-300 transition-colors">
                        CAVA
                    </Link>
                    <Link href="/prison-break" className="text-white hover:text-red-300 transition-colors">
                        PRISON BREAK
                    </Link>
                    <Link href="/scratch-off" className="text-white hover:text-red-500 transition-colors">
                        SCRATCH-OFF
                    </Link>
                    <Link href="/about" className="text-white hover:text-red-300 transition-colors">
                        ABOUT
                    </Link>
                    <div className="pl-4">
                        <ConnectButton label='CONNECT WALLET'/>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-white focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} mt-4 pb-4`}>
                <div className="flex flex-col space-y-4">
                    <Link href="/lair" className="text-white hover:text-gray-300 transition-colors">
                        LAIR
                    </Link>
                    <Link href="/cava" className="text-white hover:text-gray-300 transition-colors">
                        CAVA
                    </Link>
                    <Link href="/prison-break" className="text-white hover:text-gray-300 transition-colors">
                        PRISON BREAK
                    </Link>
                    <Link href="#" className="text-white hover:text-gray-300 transition-colors">
                        SCRATCH-OFF
                    </Link>
                    <Link href="/about" className="text-white hover:text-gray-300 transition-colors">
                        ABOUT
                    </Link>
                    <div className="pt-2">
                        <ConnectButton label='CONNECT WALLET'/>
                    </div>
                </div>
            </div>
        </nav>
    );
}