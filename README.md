# 运单扫描系统

一个基于 React 和 TypeScript 的运单扫描系统，支持后置摄像头拍照和 OCR 文字识别。

## 功能特点

- 后置摄像头拍照
- 图片 OCR 文字识别
- 响应式设计，适配移动设备
- 简洁的用户界面

## 技术栈

- React
- TypeScript
- Tesseract.js (OCR)
- React Webcam

## 安装

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 使用说明

1. 打开应用后，允许摄像头访问权限
2. 点击"拍照"按钮拍摄运单
3. 点击"开始识别"进行 OCR 处理
4. 查看识别结果，可以点击"重新扫描"继续

## 注意事项

- 需要在 HTTPS 或 localhost 环境下运行
- 建议使用现代浏览器（Chrome、Firefox、Safari）
- 移动设备访问时确保使用后置摄像头
