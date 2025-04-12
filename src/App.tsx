import { useState } from "react";
import { Camera } from "./Camera";
import { OCR } from "./OCR";
import "./App.css";

function App() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleReset = () => {
    setCapturedImage(null);
    setOcrResult(null);
    setError(null);
  };

  return (
    <div className="app">
      <h1>运单扫描系统</h1>

      {!capturedImage ? (
        <Camera onCapture={handleCapture} />
      ) : (
        <OCR
          imageData={capturedImage}
          onResult={handleOCRResult}
          onError={handleOCRError}
        />
      )}

      {error && <div className="error">{error}</div>}

      {ocrResult && (
        <div className="result-container">
          <h3>识别结果：</h3>
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
