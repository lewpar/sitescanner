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

    let [isScanComplete, setIsScanComplete] = useState(false);
    let [scanResults, setScanResults] = useState({xFrameTest: {pass:false,message:""}, hstsTest: {pass:false,message:""}, referrerTest: {pass:false,message:""}});

    let [hasScanError, setHasScanError] = useState(false);
    let [scanError, setScanError] = useState("");

    let scanSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if(isScanning) {
            return;
        }

        setHasScanError(false);
        setScanError("");

        setIsScanComplete(false);
        setIsScanning(true);
        setCanScan(false);

        console.log(`Scanning site: ${scanUrl}`);

        let status = 0;
        scanWebsite(scanUrl)
            .then(response => {
                status = response.status;
                return response.json();
            })
            .then(json => {
                if(status != 200) {
                    throw new Error(json.message);
                }

                console.log(json.tests);
                setScanResults(json.tests);

                setIsScanComplete(true);
                setIsScanning(false);
        
                if(scanUrl !== "") {
                    setCanScan(true);
                }
            })
            .catch(error => {
                setHasScanError(true);
                setScanError(error.message);

                setIsScanning(false);
                setIsScanComplete(false);

                if(scanUrl !== "") {
                    setCanScan(true);
                }
            });
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
        <form onSubmit={scanSubmit} method="POST" className="flex flex-col gap-1">
            <div className="flex flex-col gap-0.5">
                <label htmlFor="url">Url</label>
                <input type="text" name="url" onChange={urlChanged} className="nice-field"/>
            </div>

            <button type="submit" className="nice-button" disabled={!canScan}>Scan</button>
        </form>
        {isScanning ? <div>Scanning website..</div> : ""}
        {isScanComplete ? 
            <div className="flex flex-col gap-2">
                <p>Scan complete, here are your results:</p>

                <div>
                    <p>
                        X-Frame-Options: {scanResults.xFrameTest.pass ? 
                        <span className="text-green-500">{scanResults.xFrameTest.message}</span> : 
                        <span className="text-red-500">{scanResults.xFrameTest.message}</span>}
                    </p>
                    <p>
                        HSTS Policy: {scanResults.hstsTest.pass ? 
                        <span className="text-green-500">{scanResults.hstsTest.message}</span> : 
                        <span className="text-red-500">{scanResults.hstsTest.message}</span>}
                    </p>
                    <p>
                        Referrer Policy: {scanResults.referrerTest.pass ? 
                        <span className="text-green-500">{scanResults.referrerTest.message}</span> : 
                        <span className="text-red-500">{scanResults.referrerTest.message}</span>}
                    </p>
                </div>
            </div> : ""}
        {hasScanError ? <p className="text-red-500">{scanError}</p> : ""}
    </div>
    </>
}