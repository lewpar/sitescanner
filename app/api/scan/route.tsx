import { ActionResult } from "@/app/common/ActionResult";
import { NextRequest, NextResponse } from "next/server";

async function scanUrl(url:string): Promise<Response> {
    return await fetch(url);
}

function validateUrl(url: string): ActionResult {
    if(url === "") {
        return ActionResult.error("You must supply a URL to scan.");
    }

    if(!url.startsWith("http://") && !url.startsWith("https://")) {
        return ActionResult.error("URL must have a valid scheme: http(s)://");
    }

    return ActionResult.ok();
}

function evalXFrameOptions(headers: Headers): ActionResult {
    let xFrameHeader: (string | null) = headers.get('x-frame-options');

    if(xFrameHeader == null) {
        return ActionResult.error("No X-Frame-Options were found.");
    }

    return ActionResult.ok(`You have X-Frame-Options with the value '${xFrameHeader}'.`);
}

function evalHSTSPolicy(headers: Headers): ActionResult {
    let hstsHeader: (string | null) = headers.get('strict-transport-security');

    if(hstsHeader == null) {
        return ActionResult.error("No Strict-Transport-Security Policy was found.");
    }

    return ActionResult.ok(`You have a Strict-Transport-Security Policy with the value '${hstsHeader}'.`);
}

function evalReferrerPolicy(headers: Headers): ActionResult {
    let referrerHeader: (string | null) = headers.get('referrer-policy');

    if(referrerHeader == null) {
        return ActionResult.error("No Referrer-Policy was found.");
    }

    return ActionResult.ok(`You have a Referrer-Policy with the value '${referrerHeader}'.`);
}

export async function POST(req:NextRequest) {
    let url = await req.text();

    let result = validateUrl(url);
    if(!result.ok) {
        return NextResponse.json({ message: result.message }, { status: 400 });
    }

    let response: Response;

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

    let xFrameTest = evalXFrameOptions(response.headers);
    let hstsTest = evalHSTSPolicy(response.headers);
    let referrerTest = evalReferrerPolicy(response.headers);

    return NextResponse.json(
        { 
            tests: { 
                xFrameTest: {
                    pass: xFrameTest.ok,
                    message: xFrameTest.message
                },
                hstsTest: {
                    pass: hstsTest.ok,
                    message: hstsTest.message
                }, 
                referrerTest: {
                    pass: referrerTest.ok,
                    message: referrerTest.message
                }
            } 
        }, { status: 200 });
}