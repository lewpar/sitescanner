import { NextRequest, NextResponse } from "next/server";

async function scanUrl(url:string):Promise<Response> {
    return await fetch(url);
}

export async function POST(req:NextRequest) {
    let url = await req.text();

    if(url === "") {
        return NextResponse.json({ message: "You must supply a URL to scan." }, { status:400 });
    }

    if(!url.startsWith("http://") && !url.startsWith("https://")) {
        return NextResponse.json({ message: "URL must have a scheme: http(s)://" }, { status:400 });
    }

    console.log(url);

    let response:Response;

    try {
        response = await scanUrl(url);
    }
    catch(_) {
        return NextResponse.json({ message: "An internal error occured." }, { status:500 });
    }

    if(!response.ok) {
        return NextResponse.json({ message: "An internal error occured." }, { status:500 });
    }

    // Tests
    let xframe = response.headers.get('x-frame-options') == null ? false : true;
    let hsts = response.headers.get('strict-transport-security') == null ? false : true;
    let referrer = response.headers.get('referrer-policy') == null ? false : true;

    console.log("Tests complete!");

    return NextResponse.json({ tests: { xFrameTest:xframe, hstsTest: hsts, referrerTest: referrer } }, { status:200 });
}