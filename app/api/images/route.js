import { NextResponse } from "next/server";
import { insertImage, findImage, findImageById, listImages, deleteMedia } from "@/app/lib/media";
import sharp from "sharp";
import { S3PutObject, S3DeleteObject } from "@/app/lib/S3";

export async function POST(request) {

    // perform authentication

    const {origPath, webpPath} = await request.json();

    let image = await insertImage(origPath, webpPath);
            
    return NextResponse.json({message: "image inserted", image});
}

export async function GET(request) {

   const limit = request.nextUrl.searchParams.get('limit') || 10;
   const skip = request.nextUrl.searchParams.get('skip') || 0;

    if(limit) {
        const images = await listImages(limit, skip);
        return NextResponse.json({images: images});
    }

    return NextResponse.json({message: "hello"});
    
}

export async function DELETE(request) {

    const data = await request.json();

    const image = await findImageById(data.mediaId);

    console.log(image);

    if(!image) {
        return NextResponse.json({ status: 'error', message: 'Invalid request' }, { status: 400 });
    }

    try {
        const origFullDelete = await S3DeleteObject(image.origPath);
        const origThumbDelete = await S3DeleteObject('thumbnails/' + image.origPath);
        const webpFullDelete = await S3DeleteObject(image.webpPath);
        const webpThumbDelete = await S3DeleteObject('thumbnails/' + image.webpPath);

        console.log(origFullDelete);
    
        const deleteReq = await deleteMedia(image._id.toString());

        if(deleteReq?.deletedCount === 1) {
            return NextResponse.json({ status: 'success', message: 'Media item deleted' });
        }
        return NextResponse.json({ status: 'error', message: 'Error deleting media item' });
    }
    catch(error) {
        return NextResponse.json({ status: 'error', message: error.message });
    }

}