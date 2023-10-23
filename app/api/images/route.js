import { NextResponse } from "next/server";
import { insertImage, findImage, listImages } from "@/app/admin/lib/media";
import sharp from "sharp";
import { S3PutObject } from "@/app/admin/lib/S3";

export async function POST(request) {

    const formData = await request.formData();
    
    const file = formData.get('product-images');

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

            await insertImage(origPath, webpPath);
            
            return NextResponse.json({uploadStatus: 'success', fileName: fileName, url: process.env.SPACES_CDN_URL + "/" + fileName});
        }

        return NextResponse.json({ uploadStatus: 'error', message: 'some error occurred' }, {status: 400});
    }
    catch(error) {
        return NextResponse.json({ uploadStatus: 'error', message: error.message }, { status: 500 });
    }
    
}

export async function GET(request) {

   const limit = request.nextUrl.searchParams.get('limit');

    if(limit) {
        const images = await listImages(limit);
        return NextResponse.json({images: images})
    }

    return NextResponse.json({message: "hello"})
    
}