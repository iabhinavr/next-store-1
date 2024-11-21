import { NextResponse } from "next/server";
import { generateSignedUrl } from "@/app/lib/S3";

export async function POST(request) {

    // don't forget to perform authentication first

    const fileData = await request.json();

    if(!fileData?.name || !fileData?.type) {
        return NextResponse.json({message: "invalid request"});
    }

    const signedUrl = await generateSignedUrl(fileData);

    return NextResponse.json({signedUrl});
}