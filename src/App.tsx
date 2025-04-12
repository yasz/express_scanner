import { useState } from "react";
import { Camera } from "./Camera";
import "./App.css";

function App() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
  };

  const handleOCRResult = (text: string) => {
    setOcrResult(text);
    setOcrError(null);
  };

  const handleOCRError = (error: string) => {
    setOcrError(error);
    setOcrResult(null);
  };

  const handleBarcodeDetected = (barcode: string) => {
    console.log("Barcode detected:", barcode);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Express Scanner</h1>
      </header>
      <main>
        <Camera
          onCapture={handleCapture}
          onBarcodeDetected={handleBarcodeDetected}
          onOCRResult={handleOCRResult}
          onOCRError={handleOCRError}
        />
        {capturedImage && (
          <div className="result-container">
            <h2>拍摄结果</h2>
            <img
              src={capturedImage}
              alt="Captured"
              className="captured-image"
            />
            {ocrResult && (
              <div className="ocr-result">
                <h3>OCR识别结果</h3>
                <p>{ocrResult}</p>
              </div>
            )}
            {ocrError && (
              <div className="ocr-error">
                <h3>识别错误</h3>
                <p>{ocrError}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
