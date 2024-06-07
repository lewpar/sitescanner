import { ActionResult } from "@/app/common/ActionResult";
import { NextRequest, NextResponse } from "next/server";

async function scanUrl(url:string):Promise<Response> {
    return await fetch(url);
}

function isUrlValid(url: string): ActionResult {
    if(url === "") {
        return new ActionResult(false, "You must supply a URL to scan.");
    }

    if(!url.startsWith("http://") && !url.startsWith("https://")) {
        return new ActionResult(false, "URL must have a scheme: http(s)://");
    }

    return new ActionResult(true, "");
}

export async function POST(req:NextRequest) {
    let url = await req.text();

    let result = isUrlValid(url);
    if(!result.ok) {
        return NextResponse.json({ message: result.message }, { status: 400 });
    }

    let response:Response;

    try {
        response = await scanUrl(url);

        if(!response.ok) {
            throw new Error(`Website returned ${response.status} status code.`);
        }
    }
    catch(error) {
        if(error instanceof TypeError && error.message === "fetch failed") {
            console.log(error.cause);
            return NextResponse.json({ message: "A network error occured or the URL was invalid." }, { status: 500 })
        }

        return NextResponse.json({ message: "Failed to scan URL." }, { status: 500 });
    }

    // Tests
    let xframe = response.headers.get('x-frame-options') == null ? false : true;
    let hsts = response.headers.get('strict-transport-security') == null ? false : true;
    let referrer = response.headers.get('referrer-policy') == null ? false : true;

    return NextResponse.json({ tests: { xFrameTest:xframe, hstsTest: hsts, referrerTest: referrer } }, { status: 200 });
}