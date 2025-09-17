import React from 'react'
import { Link } from 'react-router-dom'

export default function DashboardLayout(children: { children: React.ReactNode }) {
    const sideBarLinks = [
        {name: 'Home', path: '/'},
        {name:"Ivac Users", path:"/ivac-user"},
        {name: 'Profile', path: '/profile'},
        {name: 'Settings', path: '/settings'},
    ]
  return (
    <div className='min-h-screen flex w-full'>
        <div className='w-60 bg-gray-800 text-white p-2'>
            <h2 className='text-xl font-bold text-center py-2'>Dashboard</h2>
            <hr/>
            <ul className='flex flex-col gap-2 mt-4'>
                {
                    sideBarLinks.map((link, i)=>(<li className='bg-gray-200 hover:bg-gray-300 cursor-pointer py-2 px-4 text-green-900 rounded transition-all duration-500 ease-in-out' key={i}><Link className='w-full' to={link.path}>{link.name}</Link></li>))
                }
            </ul>
        </div>
        <div className='flex-1 p-4'>
            {children.children}
        </div>
    </div>
  )
}
