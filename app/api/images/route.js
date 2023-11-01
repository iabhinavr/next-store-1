import { NextResponse } from "next/server";
import { insertImage, findImage, findImageById, listImages, deleteMedia } from "@/app/admin/lib/media";
import sharp from "sharp";
import { S3PutObject, S3DeleteObject } from "@/app/admin/lib/S3";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { allowedEmails } from "../auth/[...nextauth]/options";

export async function POST(request) {

    const session = await getServerSession(options);

    if(!session || !allowedEmails.includes(session?.user?.email)) {
        return NextResponse.json({ message: 'Access denied' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const file = formData.get('product-images');

    console.log(file)

    const fileName = file?.name;
    const fileType = file?.type;

    if(!fileName || !fileType) {
        return NextResponse.json({ uploadStatus: 'error', message: 'invalid data' }, {status: 400});
    }

    const fileNameNoExt = fileName.slice(0, fileName.lastIndexOf("."));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const folderPath = currentYear + "/" + currentMonth;

    const origPath = folderPath + "/" + fileName;
    const webpPath = folderPath + "/" + fileNameNoExt + ".webp";

    const existingFile = await findImage(origPath);

    if(existingFile) {
        return NextResponse.json({ uploadStatus: 'exists' });
    }

    try {
        const binaryFile = await file.arrayBuffer();

        const origFullBuffer = Buffer.from(binaryFile);
        const origThumbBuffer = await sharp(origFullBuffer).resize({width: 600}).toBuffer();
        const webpFullBuffer = await sharp(origFullBuffer).webp().toBuffer();
        const webpThumbBuffer = await sharp(origThumbBuffer).webp().toBuffer();
    
        const origFullUpload = await S3PutObject(origPath, fileType, origFullBuffer);
        const origThumbUpload = await S3PutObject('thumbnails/' + origPath, fileType, origThumbBuffer);
        const webpFullUpload = await S3PutObject(webpPath, 'image/webp', webpFullBuffer);
        const webpThumbUpload = await S3PutObject('thumbnails/' + webpPath, 'image/webp', webpThumbBuffer);

        if(origFullUpload?.data?.$metadata?.httpStatusCode === 200 &&
            origThumbUpload?.data?.$metadata?.httpStatusCode === 200 &&
            webpFullUpload?.data?.$metadata?.httpStatusCode === 200 &&
            webpThumbUpload?.data?.$metadata?.httpStatusCode === 200) {
            
            console.log('upload successful');

            let image = await insertImage(origPath, webpPath);
            
            return NextResponse.json({uploadStatus: 'success', fileName: fileName, url: process.env.SPACES_CDN_URL + "/" + fileName, image: image});
        }

        return NextResponse.json({ uploadStatus: 'error', message: 'some error occurred' }, {status: 400});
    }
    catch(error) {
        return NextResponse.json({ uploadStatus: 'error', message: error.message }, { status: 500 });
    }
    
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
    const session = await getServerSession(options);

    if(!session || !allowedEmails.includes(session?.user?.email)) {
        return NextResponse.json({ message: 'Access denied' }, { status: 401 });
    }

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