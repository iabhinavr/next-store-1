import Navigation from "../../components/Navigation";
import ProductForm from "../../components/ProductForm";
import { listCategories } from "@/app/lib/category";

export default async function AddProduct() {

    const limit = 25;

    const categories = await listCategories(limit, 0);
    
    const categoriesSimple = categories.map((c) => (
        {
            _id: c._id.toString(),
            title: c.title,
            slug: c.slug,
            description: c.description,
        }
    ));

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