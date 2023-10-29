import { NextResponse } from "next/server";
import { insertProduct, findProduct, findProductById, listProducts, updateProduct, deleteProduct } from "@/app/admin/lib/product";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { allowedEmails } from "../auth/[...nextauth]/options";

export async function POST(request) {
    const session = await getServerSession(options);

    if(!session || !allowedEmails.includes(session?.user?.email)) {
        return NextResponse.json({ message: 'Access denied' }, { status: 401 });
    }

    const formData = await request.formData();

    console.log(formData);

    const productDetails = {
        category: formData.get('product-category'),
        title: formData.get('product-title'),
        slug: formData.get('product-slug') || '',
        images: formData.get('product-images') ? JSON.parse(formData.get('product-images')) : [],
        price: formData.get('product-price') || 0,
        offerPrice: formData.get('product-offer-price') || 0,
        description: formData.get('product-description') || '',
        mainAttributes: formData.get('main-attributes') ? JSON.parse(formData.get('main-attributes')) : [{}],
        extraAttributes: formData.get('extra-attributes') ? JSON.parse(formData.get('extra-attributes')) : [{}]
    }

    console.log(productDetails);

    if(!productDetails.title || !productDetails.category) {
        return NextResponse.json({ status: 'error', message: "Required fields missing" }, { status: 400 });
    }

    try {
        const product = await insertProduct(productDetails);

        console.log(product);

        if(!product) {
            return NextResponse.json({ status: 'error', product: false, message: 'could not add product' });
        }
        return NextResponse.json({ status: 'success', product: product, message: 'product added' });
    }
    catch(error) {
        return NextResponse.json({ status: 'error', message: 'error adding product' });
    }

}

export async function PUT(request) {
    const session = await getServerSession(options);

    if(!session || !allowedEmails.includes(session?.user?.email)) {
        return NextResponse.json({ message: 'Access denied' }, { status: 401 });
    }

    const formData = await request.formData();

    console.log(formData);

    const _id = formData.get('product-id') || '';

    const productDetails = {
        _id: _id,
        category: formData.get('product-category'),
        title: formData.get('product-title'),
        slug: formData.get('product-slug') || '',
        images: formData.get('product-images') ? JSON.parse(formData.get('product-images')) : [],
        price: formData.get('product-price') || 0,
        offerPrice: formData.get('product-offer-price') || 0,
        description: formData.get('product-description') || '',
        mainAttributes: formData.get('main-attributes') ? JSON.parse(formData.get('main-attributes')) : [{}],
        extraAttributes: formData.get('extra-attributes') ? JSON.parse(formData.get('extra-attributes')) : [{}]
    }

    console.log(productDetails);

    if(!productDetails.title || !productDetails.category) {
        return NextResponse.json({ status: 'error', message: "Required fields missing" }, { status: 400 });
    }

    try {
        const product = await updateProduct(_id, productDetails);

        console.log(product);

        if(!product) {
            return NextResponse.json({ status: 'error', product: false, message: 'could not updated product' });
        }
        return NextResponse.json({ status: 'success', product: product, message: 'product updated' });
    }
    catch(error) {
        return NextResponse.json({ status: 'error', message: error.message });
    }

}

export async function GET(request) {
    const slug = request.nextUrl.searchParams.get('slug') || null;
    const _id = request.nextUrl.searchParams.get('_id') || null;

    const limit = request.nextUrl.searchParams.get('limit') || 25;
    const skip = request.nextUrl.searchParams.get('skip') || 0;

    let product = null;

    if(slug) {
        product = await findProduct(slug);

        if(product) {
            return NextResponse.json({ product: product });
        }
        return NextResponse.json({ product: null });
    }

    if(_id) {
        product = await findProductById(_id);

        if(product) {
            return NextResponse.json({ product: product });
        }
        return NextResponse.json({ product: null });
    }

    const products = await listProducts(limit, skip);

    return NextResponse.json({ products: products });
}