import React from 'react';
import Link from 'next/link';

const NavigationBarComponent = () => {
    const navigationItems = [
        { name: 'Home', link: '/' },
        { name: 'Blog', link: '/blog' },
        { name: 'About', link: '/about' },
        { name: 'Services', link: '/services' },
        { name: 'Contact', link: '/contact' },
        { name: 'Login', link: '/login' },
    ];
    return (
        <header className="w-full bg-green-700">
            <div className="w-7xl flex mx-auto justify-between items-center p-4 text-white">
                <div className="text-lg font-bold">NeuroSoft</div>
                <nav className="flex gap-4">
                    {navigationItems.map((item, index) => (
                        <Link key={index} href={item.link} className="hover:underline">
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default NavigationBarComponent;