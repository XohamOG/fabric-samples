import { useState } from "react";
import jsQR from "jsqr";

const QRCodeScanner = ({ onScan }) => {
    const [scannedId, setScannedId] = useState("");

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                // Extract QR code
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);
                
                if (code) {
                    setScannedId(code.data); // Set extracted ID
                    onScan(code.data); // Pass ID to parent form
                } else {
                    alert("No QR code detected. Try again.");
                }
            };
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
            {scannedId && <p>Scanned ID: <strong>{scannedId}</strong></p>}
        </div>
    );
};

export default QRCodeScanner;
