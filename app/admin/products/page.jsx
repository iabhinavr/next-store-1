import Link from "next/link";
import Navigation from "../components/Navigation";
import ProductList from "../components/ProductList";
import { listProducts, getProductsCount } from "../lib/product";
import { DateReadable } from "../lib/utils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Products() {

    const limit = 10;
    const products = await listProducts(limit, 0);
    const productsCount = await getProductsCount();

    let currentPageNo = 1;
    let totalPages = parseInt(productsCount) % limit === 0 ? 
                        productsCount / limit : 
                        Math.ceil(parseInt(productsCount) / limit);
    

    const productsSimple = products.map((p) => (
        {
            _id: p._id.toString(),
            title: p.title,
            slug: p.slug,
            description: p.description,
            category: p.category,
            createdAt: DateReadable(p.createdAt.toString()),
        }
    ));

    return (
        <section className="flex">
            <aside>
                <Navigation page="products" />
            </aside>
            <ProductList productList={productsSimple} currentPageNo={currentPageNo} totalPages={totalPages} itemStartCount={1} />
        </section>
    )
}