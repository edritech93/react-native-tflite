const Tflite = require('./NativeTflite').default;

export function initTensor(
  modelPath?: string,
  count?: number
): Promise<string> {
  return Tflite.initTensor(modelPath, count);
}

export function tensorImage(imagePath?: string): Promise<any> {
  return Tflite.tensorImage(imagePath);
}

export function tensorBase64(imageString: string): Promise<any> {
  return Tflite.tensorBase64(imageString);
}
