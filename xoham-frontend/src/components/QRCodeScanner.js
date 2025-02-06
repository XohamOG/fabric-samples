import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";

const QRCodeScanner = ({ onScan }) => {
    const [scannedId, setScannedId] = useState("");
    const [useCamera, setUseCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const webcamRef = useRef(null);

    // Function to capture an image from the webcam
    const captureImage = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);
            scanQRCodeFromImage(imageSrc);
        }
    };

    // Function to scan QR code from an image (captured or uploaded)
    const scanQRCodeFromImage = (imageSrc) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
                setScannedId(code.data);
                onScan(code.data);
            } else {
                alert("No QR code detected. Try again.");
            }
        };
    };

    // Function to scan QR code from an uploaded file
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => scanQRCodeFromImage(e.target.result);
        reader.readAsDataURL(file);
    };

    return (
        <div className="qr-scanner-container">
            {/* Webcam QR Scanner */}
            {useCamera ? (
                <>
                    <Webcam ref={webcamRef} screenshotFormat="image/png" />
                    <button className="btn capture-btn" onClick={captureImage}>Capture Photo</button>
                    <button className="btn stop-btn" onClick={() => setUseCamera(false)}>Close Camera</button>
                </>
            ) : (
                <button className="btn scan-btn" onClick={() => setUseCamera(true)}>Open Camera</button>
            )}

            {/* Display Captured Image */}
            {capturedImage && <img src={capturedImage} alt="Captured" style={{ width: "300px", marginTop: "10px" }} />}

            {/* File Upload QR Scanner */}
            <input type="file" accept="image/*" onChange={handleFileUpload} />

            {/* Manual ID Entry */}
            <input
                type="text"
                placeholder="Enter Patient ID"
                value={scannedId}
                onChange={(e) => setScannedId(e.target.value)}
            />

            {/* Display Scanned ID */}
            {scannedId && <p>Scanned ID: <strong>{scannedId}</strong></p>}
        </div>
    );
};

export default QRCodeScanner;
