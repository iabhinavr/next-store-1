import { NextResponse } from "next/server";
import { generateSignedUrl } from "@/app/lib/S3";

export async function POST(request) {

    // don't forget to perform authentication first

    const fileData = await request.json();

    if(!fileData?.key || !fileData?.mimeType) {
        return NextResponse.json({message: "invalid request"});
    }

    const signedUrl = await generateSignedUrl(fileData);

    return NextResponse.json({signedUrl});
}