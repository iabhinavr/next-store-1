import Navigation from "../components/Navigation";
import CategoryForm from "../components/CategoryForm";
import { listCategories } from "../lib/category";

export default async function Categories() {

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
        <section className="flex">
            <aside>
                <Navigation page="categories" />
            </aside>
            <main className="p-4 flex-1 bg-slate-700 rounded-xl">
                <h1 className="text-2xl py-2 mb-3 border-b border-b-slate-500">Categories</h1>     
                <CategoryForm initialCategories={categoriesSimple} />          
            </main>
        </section>
    )
}