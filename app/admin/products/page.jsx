import Navigation from "../components/Navigation";
import Link from "next/link";
import { listProducts } from "../lib/product";
import { DateReadable } from "../lib/utils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Products() {

    const limit = 25;

    const products = await listProducts(limit, 0);

    const productsSimple = products.map((p) => (
        {
            _id: p._id.toString(),
            title: p.title,
            slug: p.slug,
            description: p.description,
            createdAt: DateReadable(p.createdAt.toString())
        }
    ));

    return (
        <section className="flex">
            <aside>
                <Navigation page="products" />
            </aside>
            <main className="p-4 flex-1 bg-slate-700 rounded-xl">
                
                <div className="flex justify-start items-center border-b border-b-slate-500 py-2 mb-3">
                    <h1 className="text-2xl mr-3">Products</h1>
                    <Link href="/admin/products/add" className="btn-primary">Add New Product</Link>
                </div>
                
                <table className="my-3">

                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Slug</th>
                            <th>Date Created</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            productsSimple.map((p) => (
                                <tr key={p._id}>
                                    <td>
                                        <Link className="text-blue-400 hover:underline" href={`/admin/products/${p._id}`}>
                                            {p.title}
                                        </Link>
                                    </td>
                                    <td>{p.slug}</td>
                                    <td>
                                        {p.createdAt}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>

                </table>
            </main>
        </section>
    )
}