import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Form, useActionData } from "@remix-run/react";
import styles from "~/styles/global.css";

export const links = () => [{ rel: "stylesheet", href: styles }];

export default function Index() {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const actionData = useActionData();
  const scanInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
    };
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    scanInterval.current = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          // 这里可以添加一个隐藏的表单来提交图片
          const form = document.createElement("form");
          form.method = "post";
          form.action = "/api/ocr";
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = "image";
          input.value = imageSrc;
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
        }
      }
    }, 1000); // 每秒扫描一次
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
    }
  };

  return (
    <div className="container">
      <h1>Document Scanner</h1>

      <div className="scanner-container">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: { exact: "environment" },
            width: 1280,
            height: 720,
          }}
          className="scanner-view"
        />

        <div className="scanner-form">
          <button
            type="button"
            className="capture-button"
            onClick={isScanning ? stopScanning : startScanning}
          >
            {isScanning ? "Stop Scanning" : "Start Scanning"}
          </button>
        </div>
      </div>

      {actionData?.code && (
        <div className="result-container">
          <h2>Scanned Code:</h2>
          <pre className="extracted-text">
            Code: {actionData.code}
            Format: {actionData.format}
          </pre>
        </div>
      )}

      {actionData?.error && (
        <div className="error-message">{actionData.error}</div>
      )}
    </div>
  );
}
