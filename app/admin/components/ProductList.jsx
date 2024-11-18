"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductList({ paramFilters = null }) {

    const [productList, setProductList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState(paramFilters);
    const router = useRouter();

    useEffect(() => {
        async function fetchProducts() {

            const filterParams = new URLSearchParams(filters);

            const res = await fetch(`/api/admin/products?${filterParams.toString()}`);

            const result = await res.json();

            const limit = parseInt(filterParams?.get("limit")) || 10;

            let totalPages = 0;

            if (result?.count > 0) {
                totalPages = parseInt(result?.count) % limit === 0 ?
                    parseInt(result?.count) / limit :
                    Math.ceil(parseInt(result?.count) / limit);
            }


            setProductList(result?.products);
            setTotalPages(totalPages);
        }

        fetchProducts();

    }, [filters])

    function getNavParams(params) {

        let merged = { ...filters, ...params };
        return new URLSearchParams(merged).toString();
    }

    function prevOnClick(e) {
        if ((parseInt(filters?.page) || 1) > 1) {
            setFilters({ ...filters, ...{ page: (parseInt(filters?.page) || 1) - 1 } });
        }
    }

    function nextOnClick(e) {
        if ((parseInt(filters?.page) || 1) < totalPages) {
            setFilters({ ...filters, ...{ page: (parseInt(filters?.page) || 1) + 1 } });
        }

    }

    function onSortClick(e) {
        let sortField = e.currentTarget.getAttribute("data-sort-field");
        let sortOrder = 'ASC';
        let page = 1;

        // if it is repeating click on the same field, toggle sortBy

        if(sortField == filters?.sortField) {
            console.log('clicking same field');
            sortOrder = filters?.sortOrder === 'ASC' ? 'DESC' : 'ASC';
        }

        setFilters({...filters, ...{page, sortField, sortOrder}});

        let searchParams = new URLSearchParams({...filters, ...{page, sortField, sortOrder}}).toString();
        router.push(`/admin/products?${searchParams}`);
    }





    return (
        <>
            <main className="p-4 flex-1 bg-slate-700 rounded-xl">

                <div className="flex justify-start items-center border-b border-b-slate-500 py-2 mb-3">
                    <h1 className="text-2xl mr-3">Products</h1>
                    <Link href="/admin/products/add" className="btn-primary">Add New Product</Link>
                </div>

                {
                    (parseInt(filters?.page) > 1 || filters?.category || filters?.sortField) &&
                    <div className="font-mono">
                        <span>{`{`}</span>
                        {
                            Object.entries(filters).map((entry, index) => {
                                return (
                                    <span key={index}>
                                        <span>{entry[0]}: </span>
                                        <span className="text-green-500">{entry[1]}</span>
                                        {
                                            index < Object.keys(filters).length - 1 &&
                                            <span>, </span>
                                        }
                                    </span>
                                )
                            })
                        }
                        <span>{`}`}</span>
                        <button className="p-1 bg-slate-200 text-slate-900 text-sm rounded-xl ml-4" onClick={() => (setFilters({}))}>X close filters</button>
                    </div>
                }

                <table className="my-3">

                    <thead>
                        <tr>
                            <th>No</th>
                            <th 
                            data-sort-field="title" 
                            onClick={onSortClick}
                            className={`flex justify-between items-center ${filters?.sortField == 'title' ? 'bg-slate-800' : ''}`}
                            >
                                Title
                                <span 
                                className={`sort-arrow ${filters?.sortField == 'title' ? 'block' : 'hidden'} ${filters?.sortOrder == 'ASC' ? 'rotate-0' : 'rotate-180'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
                                        <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                                    </svg>
                                </span>
                            </th>
                            <th>Category</th>
                            <th>Slug</th>
                            <th 
                            data-sort-field="date"  
                            onClick={onSortClick}
                            className={`flex justify-between items-center ${filters?.sortField == 'date' ? 'bg-slate-800' : ''}`}
                            >
                                Date Created
                                <span 
                                className={`sort-arrow ${filters?.sortField == 'date' ? 'block' : 'hidden'} ${filters?.sortOrder == 'ASC' ? 'rotate-0' : 'rotate-180'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
                                        <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                                    </svg>
                                </span>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            productList.map((p, index) => {

                                return (
                                    <tr key={p._id}>
                                        <td>{((parseInt(filters?.page) || 1) - 1) * (filters?.limit || 10) + index + 1}</td>
                                        <td>
                                            <Link className="text-blue-400 hover:underline" href={`/admin/products/${p._id}`}>
                                                {p.title}
                                            </Link>
                                        </td>
                                        <td>
                                            <Link className="text-blue-400 hover:underline" href={`/admin/products?category=${p.category?.slug}`} onClick={() => setFilters({ category: p.category?.slug })}>{p.category?.title}</Link>

                                        </td>
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
                <ul className="list-nav flex items-center justify-end gap-2 [&>li>a]:px-3 [&>li>a]:py-2 [&>li>a]:text-blue-300 [&>li>a]:border [&>li>a]:border-blue-500 [&>li>a]:disabled:text-blue-100 ">
                    <li className="mr-2">Showing page {parseInt(filters?.page) || 1} of {totalPages}</li>
                    <li>
                        <Link
                            href={(parseInt(filters?.page) || 1) > 1 ? ((parseInt(filters?.page) || 1) === 2 ? `/admin/products` : `/admin/products?${getNavParams({ page: filters?.page - 1 })}`) : "#"}
                            onClick={prevOnClick}
                            disabled={(parseInt(filters?.page) || 1) === 1}
                        >
                            Previous
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={parseInt(totalPages) > (filters?.page || 1) ? `/admin/products?${getNavParams({ page: (parseInt(filters?.page) || 1) + 1 })}` : `#`}
                            onClick={nextOnClick}
                            disabled={(parseInt(filters?.page) || 1) === totalPages}
                        >
                            Next
                        </Link>
                    </li>
                </ul>
            </main>
        </>
    )
}