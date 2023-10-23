import Header from "./components/Header";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { options } from "../api/auth/[...nextauth]/options";

export default async function AdminLayout({ children }) {

    const session = await getServerSession(options);

    if(!session) {
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