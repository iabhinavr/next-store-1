import Navigation from "../components/Navigation";
import Link from "next/link";

export default function Products() {
    return (
        <>
        <section className="flex">
            <aside>
                <Navigation page="products" />
            </aside>
            <main className="p-4 flex-1 bg-slate-700 rounded-xl">
                <div className="flex justify-start items-center border-b border-b-slate-500 py-2 mb-3">
                    <h1 className="text-2xl mr-3">Products</h1>
                    <Link href="/admin/products/add" className="btn-primary">Add New Product</Link>
                </div>
            </main>
        </section>
        </>
    )
}