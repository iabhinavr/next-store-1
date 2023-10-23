import { NextResponse } from "next/server";
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import { insertImage, findImage } from "@/app/admin/lib/media";

export async function POST(request) {

    const formData = await request.formData();
    
    const file = formData.get('product-images');

    const fileName = file.name;
    const fileType = file.type;

    const existingFile = await findImage(fileName);

    if(existingFile) {
        return NextResponse.json({ uploadStatus: 'exists' });
    }

    const binaryFile = await file.arrayBuffer();
    const buffer = Buffer.from(binaryFile);

    const upload = await S3PutObject(fileName, fileType, buffer);
    
    if(upload) {
        if(upload?.data?.$metadata?.httpStatusCode === 200) {
            console.log('upload successful');

            await insertImage(fileName);
            
            return NextResponse.json({uploadStatus: 'success', fileName: fileName, url: process.env.SPACES_CDN_URL + "/" + fileName});
        }
        return NextResponse.json({ uploadStatus: 'error', message: 'some error occurred' }, {status: 400});
    }
    return NextResponse.json({ uploadStatus: 'error', message: 'some error occurred' }, { status: 500 });
}

async function S3PutObject(fileName, fileType, buffer) {

    const bucket = process.env.SPACES_BUCKET;
    const endpoint = process.env.SPACES_ENDPOINT;
    const spaces_access_key = process.env.SPACES_ACCESS_KEY;
    const spaces_secret_key = process.env.SPACES_SECRET_KEY;

    const s3Client = new S3({
        forcePathStyle: false, // Configures to use subdomain/virtual calling format.
        endpoint: endpoint,
        region: "us-east-1",
        credentials: {
            accessKeyId: spaces_access_key,
            secretAccessKey: spaces_secret_key
        }
    });

    const bucketParams = {
        Bucket: bucket,
        Key: fileName,
        Body: buffer,
        ContentType: fileType,
        ACL: "public-read"
    };

    try {
        const data = await s3Client.send(new PutObjectCommand(bucketParams));
        return {data: data};
    } catch (err) {
        console.log("Error", err);
        return false;
    }

}