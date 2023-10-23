import Navigation from "../components/Navigation";

export default function Products() {
    return (
        <>
        <section className="flex">
            <aside>
                <Navigation page="products" />
            </aside>
            <main>
                Products
            </main>
        </section>
        </>
    )
}