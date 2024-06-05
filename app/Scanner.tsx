'use client';

import { FormEvent, useState } from "react";

async function scanWebsite(scanUrl: string) {
    let result = await fetch("/api/scan", {
        method: "POST",
        body: scanUrl
    });

    return result;
}

export default function Scanner() {
    let [canScan, setCanScan] = useState(false);
    let [isScanning, setIsScanning] = useState(false);
    let [scanUrl, setScanUrl] = useState("");

    let [scanComplete, setScanComplete] = useState(false);
    let [scanResults, setScanResults] = useState({xFrameTest: false, hstsTest: false, referrerTest: false});

    let scanSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if(isScanning) {
            return;
        }

        setScanComplete(false);
        setIsScanning(true);
        setCanScan(false);

        console.log(`Scanning site: ${scanUrl}`);

        scanWebsite(scanUrl)
        .then((result) => result.json())
        .then(json => {
            setScanResults(JSON.parse(json.message));
        });

        setScanComplete(true);
        setIsScanning(false);

        if(scanUrl !== "") {
            setCanScan(true);
        }
    };

    let urlChanged = (event:any) => {
        let url = event.target.value;

        if(isScanning) {
            return;
        }

        if(url === "") {
            setCanScan(false);
        }
        else {
            setCanScan(true);
            setScanUrl(url);
        }
    };

    return <>
    <div className="flex-1">
        <form onSubmit={scanSubmit} className="flex flex-col gap-1">
            <div className="flex flex-col gap-0.5">
                <label htmlFor="url">Url</label>
                <input type="text" name="url" onChange={urlChanged} className="nice-field"/>
            </div>

            <button type="submit" className="nice-button" disabled={!canScan}>Scan</button>
        </form>
        {isScanning ? <div>Scanning website..</div> : ""}
        {scanComplete ? 
            <div className="flex flex-col">
                <p>Scan complete, here are your results:</p>
                <p>X-Frame-Options: {scanResults.xFrameTest ? "Configured" : "Unconfigured"}</p>
                <p>HSTS Policy: {scanResults.hstsTest ? "Configured" : "Unconfigured"}</p>
                <p>Referrer Policy: {scanResults.referrerTest ? "Configured" : "Unconfigured"}</p>
            </div> : ""}
    </div>
    </>
}