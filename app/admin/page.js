import Navigation from "./components/Navigation";

export default async function AdminHome() {
  return (
    <>
      <section className="flex">
            <aside>
                <Navigation page="home" />
            </aside>
            <main>
                Admin Home
            </main>
        </section>
    </>
  )
}
