import Navigation from "../components/Navigation";
import ProductList from "../components/ProductList";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Products({ searchParams }) {

    const paramFilters = (await searchParams);

    return (
        <section className="flex">
            <aside>
                <Navigation page="products" />
            </aside>
            <ProductList paramFilters={paramFilters} />
        </section>
    )
}