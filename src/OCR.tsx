import { useState } from "react";

interface OCRProps {
  imageData: string;
  onResult: (text: string) => void;
  onError: (error: string) => void;
}

export const OCR = ({ imageData, onResult, onError }: OCRProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async () => {
    try {
      setIsProcessing(true);

      // Convert base64 to blob
      const base64Data = imageData.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      const byteArray = new Uint8Array(byteArrays);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      // Create form data
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      // Send to OCR service
      const response = await fetch("http://localhost:5001/api/OCR/recognize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("OCR服务请求失败");
      }

      const result = await response.json();
      if (result && result.text) {
        onResult(result.text);
      } else {
        onError("未识别到文字");
      }
    } catch (error) {
      console.error("处理错误:", error);
      onError(error instanceof Error ? error.message : "处理失败");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="ocr-container">
      <img src={imageData} alt="待识别" className="preview-image" />
      <button
        onClick={processImage}
        className="process-button"
        disabled={isProcessing}
      >
        {isProcessing ? "处理中..." : "开始识别"}
      </button>
    </div>
  );
};
