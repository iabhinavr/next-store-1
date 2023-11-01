import Navigation from "../components/Navigation";
import MediaList from "../components/MediaList";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Media() {

    return (
        <section className="flex">
            <aside>
                <Navigation page="media" />
            </aside>
            <MediaList />
        </section>
    )
}