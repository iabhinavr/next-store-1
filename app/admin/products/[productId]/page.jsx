import Navigation from "../../components/Navigation";
import ProductForm from "../../components/ProductForm";
import { listCategories } from "../../lib/category";
import { findProductById } from "../../lib/product";

export default async function EditProduct({ params }) {

    return (
        <>
        <section className="flex">
            <aside>
                <Navigation page="products" />
            </aside>
            <main className="p-4 flex-1 bg-slate-700 rounded-xl">
                <h1 className="text-2xl py-2 mb-3 border-b border-b-slate-500">Add new product</h1>
                <ProductForm productId={params.productId} />
            </main>
        </section>
        </>
    )
}