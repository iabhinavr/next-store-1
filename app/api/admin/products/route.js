import { NextResponse } from "next/server";
import { listProducts, getProductsCount } from "@/app/lib/product";
import { DateReadable } from "@/app/lib/utils";

export async function GET(request) {
    
    const filters = request.nextUrl.searchParams;

    const products = await listProducts(filters);
    const productsCount = await getProductsCount(filters);
    console.log(productsCount);

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

    return NextResponse.json({ products: productsSimple, count: productsCount });
}