import Navigation from "../../../components/Navigation";
import ProductList from "@/app/admin/components/ProductList";
import { listProducts, getProductsCount } from "@/app/lib/product";
import { DateReadable } from "@/app/lib/utils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Products({ params }) {

    const limit = 10;
    const skip = limit*(params.pageNo - 1);

    const products = await listProducts(limit, skip);
    const productsCount = await getProductsCount();

    let currentPageNo = params.pageNo;
    let totalPages = parseInt(productsCount) % limit === 0 ? 
                        productsCount / limit : 
                        Math.ceil(parseInt(productsCount) / limit);

    const productsSimple = products?.map((p) => (
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
            <ProductList productList={productsSimple} currentPageNo={currentPageNo} totalPages={totalPages} itemStartCount={((currentPageNo-1)*limit)+1} />
        </section>
    )
}