import { NextRequest } from "next/server";

async function scanUrl(url:string) {
    let result = await fetch(url);

    return result;
}

export async function POST(req:NextRequest) {
    let url = await req.text();

    console.log(url);

    let result = await scanUrl(url)

    if(!result.ok) {
        return new Response(
            JSON.stringify({
                status: 500
            }),
        );
    }

    // Tests
    let xframe = result.headers.get('x-frame-options') == null ? false : true;
    let hsts = result.headers.get('strict-transport-security') == null ? false : true;
    let referrer = result.headers.get('referrer-policy') == null ? false : true;

    return new Response(
        JSON.stringify({
            status: 200,
            message: JSON.stringify({
            xFrameTest: xframe,
            hstsTest: hsts,
            referrerTest: referrer
           }) 
        }),
    );
}