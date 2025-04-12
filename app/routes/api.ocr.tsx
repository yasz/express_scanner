import { ActionFunctionArgs, json } from "@remix-run/node";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const formData = await request.formData();
  const imageData = formData.get("image") as string;

  if (!imageData) {
    return json({ error: "No image provided" }, { status: 400 });
  }

  try {
    // 设置支持的条码格式
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

    // 创建解码器
    const codeReader = new BrowserMultiFormatReader(hints);

    // 解码图片
    const result = await codeReader.decodeFromImageUrl(imageData);

    return json({
      success: true,
      code: result.getText(),
      format: result.getBarcodeFormat().toString(),
    });
  } catch (error) {
    console.error("Barcode scanning error:", error);
    return json(
      {
        error:
          error instanceof Error ? error.message : "Barcode scanning failed",
      },
      { status: 500 }
    );
  }
}
