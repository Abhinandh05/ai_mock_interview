import React, {ReactNode} from 'react'
import Link from "next/link";
import Image from "next/image";
import {isAuthenticated} from "@/lib/action/auth.action";
import { redirect } from "next/navigation";



const RootLayout = async ({children}:{children:ReactNode}) => {
    const isUserAuthenticated = await isAuthenticated();

    if (!isUserAuthenticated) redirect('/sign-in');
    return (
        <div className="root-layout">
            <nav>
                <Link href="/" className="flex items-center gap-2" >
                    <Image src="/logo.svg"
                           alt="logo"
                           width={50}
                           height={50} />

                    <h2 className='text-primary-100 '>VOCAL HIRE</h2>
                </Link>
                {children}
            </nav>

        </div>
    )
}
export default RootLayout
