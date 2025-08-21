import React from 'react';
import DashboardSidebar from "@/app/dashboard/DashboardSidebar";

const Layout = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="flex h-screen w-7xl mx-auto">
            <DashboardSidebar/>
            <div className="w-full">
                {children}
            </div>
        </div>
    );
};

export default Layout;