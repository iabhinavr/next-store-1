"use server";

import { listProducts, getProductsCount } from "@/app/lib/product";

export async function fetchProduct(filters) {
    const limit = filters?.limit || 10;
    const products = await listProducts(limit, 0, filters);
    const productsCount = await getProductsCount();

    let totalPages = parseInt(productsCount) % limit === 0 ?
        productsCount / limit :
        Math.ceil(parseInt(productsCount) / limit);

    const productsSimple = products.map((p) => (
        {
            _id: p._id.toString(),
            title: p.title,
            slug: p.slug,
            description: p.description,
            category: p.category ? p.category : null,
            createdAt: DateReadable(p.createdAt.toString()),
        }
    ));

    return productsSimple;
}