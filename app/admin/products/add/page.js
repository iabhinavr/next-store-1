import Navigation from "../../components/Navigation";
import ProductForm from "../../components/ProductForm";

export default function Products() {
    return (
        <>
        <section className="flex">
            <aside>
                <Navigation page="products" />
            </aside>
            <main className="p-4 flex-1 bg-slate-700 rounded-xl">
                <h1 className="text-2xl py-2 mb-3 border-b border-b-slate-500">Add new product</h1>
                <ProductForm />
            </main>
        </section>
        </>
    )
}