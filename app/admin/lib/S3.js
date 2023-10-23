import { S3, PutObjectCommand } from "@aws-sdk/client-s3";

export async function S3PutObject(fileName, fileType, buffer) {

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