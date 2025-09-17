import React from 'react';
import Link from "next/link";
import FooterComponent from "@/component/Footer-component";
import NavigationBarComponent from "@/component/Navigation-bar-component";

export default function MainLayout({children} : {children: React.ReactNode}) {
    return (
        <div className="w-full min-h-screen grid grid-rows-[auto_1fr_auto]">
            <NavigationBarComponent/>
            {children}
            <FooterComponent/>
        </div>
    );
}
