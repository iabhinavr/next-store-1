import Header from "./components/Header";
import Footer from "./components/Footer";

import { auth } from "@/auth";

import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
    const session = await auth()
console.log(session)
    if(!session) {
        redirect('/api/auth/signin')
    }
    return (
        <>
        <Header />

        { children }
        
        <Footer />
        </>
        
    )
}