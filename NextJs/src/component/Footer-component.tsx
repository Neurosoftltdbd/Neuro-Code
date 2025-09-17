import React from 'react';
import Link from 'next/link';

const FooterComponent = () => {
    return (
        <footer className="w-7xl mx-auto row-start-3 flex  gap-[24px] items-center justify-around py-8">
            <p className="text-sm">&copy; {new Date().getFullYear()} NeuroCode. All rights reserved.</p>
            <nav className="flex gap-4">
                <Link href="#privacy" className="hover:underline">Privacy Policy</Link>
                <Link href="#terms" className="hover:underline">Terms of Service</Link>
            </nav>
        </footer>
    );
};

export default FooterComponent;