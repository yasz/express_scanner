import { useState } from "react";
import { createWorker } from "tesseract.js";

interface OCRProps {
  imageData: string;
  onResult: (text: string) => void;
  onError: (error: string) => void;
}

export const OCR = ({ imageData, onResult, onError }: OCRProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async () => {
    let worker: any = null;
    try {
      setIsProcessing(true);

      worker = await createWorker("eng+chi_sim");

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          if (worker) {
            worker.terminate();
          }
          reject(new Error("处理超时"));
        }, 3000);
      });

      const result = await Promise.race([
        worker.recognize(imageData),
        timeoutPromise,
      ]);

      if (result && typeof result === "object" && "data" in result) {
        const text = (result as { data: { text: string } }).data.text;
        if (text.trim()) {
          onResult(text);
        } else {
          onError("未识别到文字");
        }
      } else {
        onError("处理超时");
      }
    } catch (error) {
      console.error("处理错误:", error);
      onError(
        error instanceof Error && error.message === "处理超时"
          ? "处理超时，请重试"
          : "处理失败"
      );
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch (e) {
          console.error("清理 worker 失败:", e);
        }
      }
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
