import Link from 'next/link'
import { headers } from 'next/headers'

export default async function NotFound() {

    const headersList = await headers()
    const domain = headersList.get('host')
    return (
        <div className="flex flex-col gap-4 justify-center h-screen text-center">
            <div className="text-9xl font-bold">404</div>
            <div className="text-3xl font-bold">Not Found</div>
            <p>Could not find requested resource</p>
            <p>Go back <Link className="hover:font-bold hover:p-2" href="/">Home <i className="bi bi-arrow-right"></i></Link></p>
        </div>
    )
}