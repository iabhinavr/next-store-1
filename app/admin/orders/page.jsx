import Navigation from "../components/Navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Media() {

    return (
        <section className="flex">
            <aside>
                <Navigation page="orders" />
            </aside>
            <main>
                Orders
            </main>
        </section>
    )
}