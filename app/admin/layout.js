import Header from "./components/Header";
import Footer from "./components/Footer";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { options } from "../api/auth/[...nextauth]/options";
import { allowedEmails } from "../api/auth/[...nextauth]/options";

export default async function AdminLayout({ children }) {

    const session = await getServerSession(options);

    if(!session || !allowedEmails.includes(session?.user?.email) ) {
        console.log(session);
        redirect('/api/auth/signin?callbackUrl=/admin');
    }

    return (
        <>
        <Header session={session} />

        { children }
        
        <Footer />
        </>
        
    )
}