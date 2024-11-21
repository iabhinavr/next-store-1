import { NextResponse } from "next/server";
import { makeObjectPublic } from "@/app/lib/S3";

export async function POST(request) {
    const data = await request.json();

    if(!data.key) {
        return NextResponse.json({message: "Invalid Request"});
    }

    const res = await makeObjectPublic(data.key);
    console.log(res);

    return NextResponse.json({message: "Object made public"});
}