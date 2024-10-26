import { NextResponse } from "next/server";
import { insertCategory, findCategory, listCategories, findCategoryById, updateCategory, deleteCategory } from "@/app/lib/category";
import { S3PutObject } from "@/app/lib/S3";

export async function POST(request) {

    const formData = await request.formData();

    const categoryDetails = {
        title: formData.get('category-title'),
        slug: formData.get('category-slug'),
        description: formData.get('category-description'),
        attributes: formData.get('category-attributes') ? JSON.parse(formData.get('category-attributes')) : []
    }

    if(!categoryDetails.title || !categoryDetails.slug) {
        return NextResponse.json({ status: 'error', message: "Required fields missing" }, { status: 400 });
    }

    try {
        const category = await insertCategory(categoryDetails);

        console.log(category);

        if(!category) {
            return NextResponse.json({ status: 'error', category: false, message: 'could not add category' });
        }
        return NextResponse.json({ status: 'success', category: category, message: 'category added' });
    }
    catch(error) {
        return NextResponse.json({ status: 'error', message: 'error adding category' });
    }

}

export async function PUT(request) {

    const formData = await request.formData();

    const _id = formData.get('category-id');

    const categoryDetails = {
        title: formData.get('category-title'),
        slug: formData.get('category-slug'),
        description: formData.get('category-description'),
        attributes: formData.get('category-attributes') ? JSON.parse(formData.get('category-attributes')) : []
    }

    if(!_id || !categoryDetails.title || !categoryDetails.slug) {
        return NextResponse.json({ status: 'error', message: "Required fields missing" }, { status: 400 });
    }

    console.log(categoryDetails);

    try {
        const category = await updateCategory(_id, categoryDetails);
        return NextResponse.json({ status: 'success', category: category, message: 'category updated' });
    }
    catch(error) {
        return NextResponse.json({ status: 'error', message: 'error adding category' });
    }

}

export async function GET(request) {
    const slug = request.nextUrl.searchParams.get('slug') || null;
    const _id = request.nextUrl.searchParams.get('_id') || null;

    const limit = request.nextUrl.searchParams.get('limit') || 25;
    const skip = request.nextUrl.searchParams.get('skip') || 0;

    let category = null;

    if(slug) {
        category = await findCategory(slug);

        if(category) {
            return NextResponse.json({ category: category });
        }
        return NextResponse.json({ category: null });
    }

    if(_id) {
        category = await findCategoryById(_id);

        if(category) {
            return NextResponse.json({ category: category });
        }
        return NextResponse.json({ category: null });
    }

    const categories = await listCategories(limit, skip);

    return NextResponse.json({ categories: categories });
}

export async function DELETE(request) {

    const formData = await request.formData();

    const _id = formData.get('category-id');

    if(!_id) {
        return NextResponse.json({ status: 'error', message: 'Invalid request' }, { status: 400 });
    }

    const deleteReq = await deleteCategory(_id);

    if(deleteReq?.deletedCount === 1) {
        return NextResponse.json({ status: 'success', message: 'Category deleted' });
    }
    return NextResponse.json({ status: 'error', message: 'Error deleting category' });
}