import { S3, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const bucket = process.env.AWS_BUCKET;
const endpoint = process.env.SPACES_ENDPOINT;
const spaces_access_key = process.env.SPACES_ACCESS_KEY;
const spaces_secret_key = process.env.SPACES_SECRET_KEY;
const aws_access_key = process.env.AWS_ACCESS_KEY;
const aws_secret_key = process.env.AWS_SECRET_KEY;

const S3Client = new S3({
    region: "ap-south-1",
    credentials: {
        accessKeyId: aws_access_key,
        secretAccessKey: aws_secret_key
    }
});

export async function S3PutObject(fileName, fileType, buffer) {

    const bucketParams = {
        Bucket: bucket,
        Key: fileName,
        Body: buffer,
        ContentType: fileType,
    };

    try {
        const data = await S3Client.send(new PutObjectCommand(bucketParams));
        return { data: data };
    } catch (err) {
        console.log("Error", err);
        return false;
    }

}

export async function S3DeleteObject(key) {

    const bucketParams = {
        Bucket: bucket,
        Key: key
    }
    
    try {
        const data = await S3Client.send(new DeleteObjectCommand(bucketParams));
        return { data };
    }
    catch(error) {
        console.log("Error", error);
        return false;
    }
}