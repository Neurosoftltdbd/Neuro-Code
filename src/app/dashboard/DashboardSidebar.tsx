import React from 'react';
import Link from "next/link";

const DashboardSidebar = () => {

    const sidebarItems = [
        {name: 'IVAC panel', link: '/dashboard/ivac', icon:'bi bi-grid-3x3-gap-fill'},
        {name: 'Dashboard', link: '/dashboard', icon:' bi bi-grid-3x3-gap-fill'},
        {name: 'Dashboard', link: '/dashboard' , icon:'bi bi-grid-3x3-gap-fill'},
        {name: 'Settings', link: '/dashboard/settings' , icon:'bi bi-gear-fill'},
        {name: 'User', link: '/dashboard/user' , icon:'bi bi-people-fill'},
    ];
    return (
        <div className="flex flex-col justify-between gap-4 p-4 bg-gray-200 w-[200px] md:w-[300px] border-r border-gray-300 h-screen transition-all duration-500 ease-in-out">
            <div>
                <h2 className="font-bold"><Link href="/" ><i className="bi bi-house-fill me-2"></i></Link>Neuro Code Dashboard</h2>
                <hr className="my-4"/>
                <ul className="flex flex-col gap-2">
                    {
                        sidebarItems.map((item, index) => (
                            <li key={index} className="cursor-pointer bg-gray-300 p-2 rounded hover:bg-green-300 transition-all duration-300 ease-in-out">
                                <Link href={item.link} className="flex items-center gap-2">
                                    <i className={item.icon}></i>
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        ))
                    }
                </ul>
            </div>

            <div>
                <hr/>
                <div>user profile</div>
                <button>Logout</button>
            </div>

        </div>
    );
};

export default DashboardSidebar;