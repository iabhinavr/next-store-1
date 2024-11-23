import { S3, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectAclCommand } from "@aws-sdk/client-s3";

const bucket = process.env.AWS_BUCKET;
const aws_access_key = process.env.AWS_ACCESS_KEY;
const aws_secret_key = process.env.AWS_SECRET_KEY;

const spaces_bucket = process.env.SPACES_BUCKET;
const endpoint = process.env.SPACES_ENDPOINT;
const spaces_access_key = process.env.SPACES_ACCESS_KEY;
const spaces_secret_key = process.env.SPACES_SECRET_KEY;

const S3Client = new S3({
    region: "ap-south-1",
    endpoint: endpoint,
    credentials: {
        accessKeyId: spaces_access_key,
        secretAccessKey: spaces_secret_key
    }
});

export async function generateSignedUrl({key, mimeType}) {

    const bucketParams = {
        Bucket: spaces_bucket,
        Key: key,
        ACL: "public-read",
        ContentType: mimeType
    }
    const command = new PutObjectCommand(bucketParams);

    try {
        const url = await getSignedUrl(S3Client, command, { expiresIn: 3600 });
        return url;
    }
    catch(error) {
        console.log(error);
        return {error: "cannot generate signed url"}
    }
}

export async function makeObjectPublic(key) {
    const bucketParams = {
        Bucket: spaces_bucket,
        Key: key,
        ACL: "public-read"
    }

    const command = new PutObjectAclCommand(bucketParams);

    try {
        const data = await S3Client.send(command);
        console.log(data);
    }
    catch(error) {
        console.log(error);
        return false;
    }
}

export async function S3PutObject(fileName, fileType, buffer) {

    const bucketParams = {
        Bucket: spaces_bucket,
        Key: fileName,
        Body: buffer,
        ACL: "public-read",
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
        Bucket: spaces_bucket,
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