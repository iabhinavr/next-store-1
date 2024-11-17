import Header from "./components/Header";
import Footer from "./components/Footer";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
    const session = await auth()
    
    // if not logged in, redirect to login page

    if(!session) {
        redirect('/api/auth/signin')
    }

    // if it is not me, it's normal user, redirect to shop page

    if(session?.user?.email !== "abhinav7r@gmail.com") {
        redirect('/')
    }

    // if it's me, return the admin layout

    return (
        <>
        <Header />

        { children }
        
        <Footer />
        </>
        
    )
}