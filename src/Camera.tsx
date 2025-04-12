import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

interface CameraProps {
  onCapture: (imageData: string) => void;
}

export const Camera = ({ onCapture }: CameraProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
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
      <button onClick={handleCapture} className="capture-button">
        拍照
      </button>
    </div>
  );
};
