import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

interface CameraProps {
  onCapture: (imageData: string) => void;
  onBarcodeDetected?: (barcode: string) => void;
  onOCRResult?: (text: string) => void;
  onOCRError?: (error: string) => void;
}

export const Camera = ({
  onCapture,
  onBarcodeDetected,
  onOCRResult,
  onOCRError,
}: CameraProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const scanInterval = useRef<NodeJS.Timeout | null>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // Initialize barcode reader
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.QR_CODE,
    ]);
    codeReader.current = new BrowserMultiFormatReader(hints);

    return () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
    };
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    scanInterval.current = setInterval(async () => {
      if (webcamRef.current && codeReader.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          try {
            const result = await codeReader.current.decodeFromImageUrl(
              imageSrc
            );
            if (result) {
              const barcode = result.getText();
              setScanResult(barcode);
              if (onBarcodeDetected) {
                onBarcodeDetected(barcode);
              }
            }
          } catch (error) {
            // Ignore errors when no barcode is found
          }
        }
      }
    }, 500); // Scan every 500ms
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }
  };

  const handleCaptureAndOCR = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setIsProcessing(true);
        setCapturedImage(imageSrc);
        onCapture(imageSrc);

        try {
          // Convert base64 to blob
          const base64Data = imageSrc.split(",")[1];
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

          console.log("开始发送OCR请求...");

          // Send to OCR service
          const response = await fetch("/api/OCR/recognize", {
            method: "POST",
            body: formData,
          });

          console.log("OCR请求响应状态:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("OCR服务请求失败:", errorText);
            throw new Error(`OCR服务请求失败: ${errorText}`);
          }

          const result = await response.json();
          console.log("OCR识别结果:", result);

          if (result && result.text) {
            if (onOCRResult) {
              onOCRResult(result.text);
            }
            setScanResult(result.text);
          } else {
            setScanResult("未识别到文字");
            if (onOCRError) {
              onOCRError("未识别到文字");
            }
          }
        } catch (error) {
          console.error("OCR处理错误:", error);
          setScanResult(error instanceof Error ? error.message : "处理失败");
          if (onOCRError) {
            onOCRError(error instanceof Error ? error.message : "处理失败");
          }
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };

  const closeModal = () => {
    setScanResult(null);
    setCapturedImage(null); // 只在关闭弹窗时清除拍摄的图片
    stopScanning();
  };

  useEffect(() => {
    const checkBrowserSupport = () => {
      const isSecureContext = window.isSecureContext;
      const hasMediaDevices = !!navigator.mediaDevices;
      const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia;

      if (!isSecureContext) {
        setError("需要在安全上下文中运行（HTTPS 或 localhost）");
        setIsSupported(false);
        return;
      }

      if (!hasMediaDevices || !hasGetUserMedia) {
        setError("浏览器不支持必要的媒体设备 API");
        setIsSupported(false);
        return;
      }
    };

    checkBrowserSupport();
  }, []);

  if (!isSupported) {
    return (
      <div className="camera-container">
        <div className="error-message">
          {error ||
            "您的浏览器不支持摄像头访问，请使用现代浏览器（如 Chrome、Firefox、Safari）访问此页面。"}
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      {capturedImage ? (
        <div className="captured-image-container">
          <img src={capturedImage} alt="已拍摄" className="captured-image" />
          {isProcessing && (
            <div className="processing-overlay">
              <div className="processing-spinner"></div>
              <div className="processing-text">正在识别中...</div>
            </div>
          )}
        </div>
      ) : (
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }}
        />
      )}
      <div className="button-group bottom">
        <button
          onClick={isScanning ? stopScanning : startScanning}
          className={`scan-button ${isScanning ? "scanning" : ""}`}
        >
          {isScanning ? "停止扫描" : "开始扫描"}
        </button>
        <button
          onClick={handleCaptureAndOCR}
          className="capture-button"
          disabled={isProcessing}
        >
          {isProcessing ? "识别中..." : "OCR识别"}
        </button>
      </div>
      {scanResult && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>扫描结果</h3>
            <div className="scan-result">{scanResult}</div>
            <button onClick={closeModal} className="modal-button">
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
