import { useState } from "react";
import { Camera } from "./Camera";
import { OCR } from "./OCR";
import "./App.css";

function App() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setOcrResult(null);
    setError(null);
  };

  const handleOCRResult = (text: string) => {
    setOcrResult(text);
  };

  const handleOCRError = (error: string) => {
    setError(error);
  };

  const handleBarcodeDetected = (barcode: string) => {
    setBarcodeResult(barcode);
  };

  const handleReset = () => {
    setCapturedImage(null);
    setOcrResult(null);
    setError(null);
    setBarcodeResult(null);
  };

  return (
    <div className="app">
      <h4>运单扫描系统</h4>

      {!capturedImage ? (
        <Camera
          onCapture={handleCapture}
          onBarcodeDetected={handleBarcodeDetected}
        />
      ) : (
        <OCR
          imageData={capturedImage}
          onResult={handleOCRResult}
          onError={handleOCRError}
        />
      )}

      {error && <div className="error">{error}</div>}

      {barcodeResult && (
        <div className="result-container">
          <h3>条码识别结果：</h3>
          <div className="result-text">{barcodeResult}</div>
          <button onClick={handleReset} className="reset-button">
            重新扫描
          </button>
        </div>
      )}

      {ocrResult && (
        <div className="result-container">
          <h3>OCR识别结果：</h3>
          <div className="result-text">{ocrResult}</div>
          <button onClick={handleReset} className="reset-button">
            重新扫描
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
