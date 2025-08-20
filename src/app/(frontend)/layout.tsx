import React from 'react';
import Link from "next/link";

export const MainLayout = ({children} : {children: React.ReactNode}) => {
    return (
        <div className="w-full min-h-screen grid grid-rows-[auto_1fr_auto]">
            <header className="w-7xl mx-auto flex justify-between items-center p-4 text-white">
                <div className="text-lg font-bold">NeuroCode</div>
                <nav className="flex gap-4">
                    <Link href="#home" className="hover:underline">Home</Link>
                    <Link href="#about" className="hover:underline">About</Link>
                    <Link href="#services" className="hover:underline">Services</Link>
                    <Link href="#contact" className="hover:underline">Contact</Link>
                </nav>
            </header>
            {children}
            <footer className="w-7xl mx-auto row-start-3 flex  gap-[24px] items-center justify-around py-8">
                <p className="text-sm">&copy; {new Date().getFullYear()} NeuroCode. All rights reserved.</p>
                <nav className="flex gap-4">
                    <Link href="#privacy" className="hover:underline">Privacy Policy</Link>
                    <Link href="#terms" className="hover:underline">Terms of Service</Link>
                </nav>
            </footer>
        </div>
    );
}
