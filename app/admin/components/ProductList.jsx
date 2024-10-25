import Link from "next/link";

export default function ProductList({ productList, currentPageNo, totalPages, itemStartCount = 1 }) {
    let slNo = itemStartCount;
    return (
        <>
            <main className="p-4 flex-1 bg-slate-700 rounded-xl">

                <div className="flex justify-start items-center border-b border-b-slate-500 py-2 mb-3">
                    <h1 className="text-2xl mr-3">Products</h1>
                    <Link href="/admin/products/add" className="btn-primary">Add New Product</Link>
                </div>

                <table className="my-3">

                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Slug</th>
                            <th>Date Created</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            productList.map((p) => {
                                slNo++;
                                return (
                                <tr key={p._id}>
                                    <td>{slNo-1}</td>
                                    <td>
                                        <Link className="text-blue-400 hover:underline" href={`/admin/products/${p._id}`}>
                                            {p.title}
                                        </Link>
                                    </td>
                                    <td>{p.category?.title}</td>
                                    <td>{p.slug}</td>
                                    <td>
                                        {p.createdAt}
                                    </td>
                                </tr>
                                )
 
                            })
                        }
                    </tbody>

                </table>
                <ul className="flex items-center justify-end gap-2 [&>li>a]:px-3 [&>li>a]:py-2 [&>li>a]:text-blue-300 [&>li>a]:border [&>li>a]:border-blue-500">
                    <li className="mr-2">Showing page {currentPageNo} of {totalPages}</li>
                    <li>
                        <Link href={parseInt(currentPageNo) > 1 ? (parseInt(currentPageNo) === 2 ? `/admin/products` : `/admin/products/page/${parseInt(currentPageNo) - 1}`) : "#"}>Previous</Link>
                    </li>
                    <li>
                        <Link href={parseInt(totalPages) > parseInt(currentPageNo) ? `/admin/products/page/${parseInt(currentPageNo) + 1}` : `#`}>Next</Link>
                    </li>
                </ul>
            </main>
        </>
    )
}