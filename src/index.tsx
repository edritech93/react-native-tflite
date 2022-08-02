import { NativeModules, Platform } from 'react-native';

export function tflite(frame: any): any {
  'worklet';
  // @ts-ignore

  return __tflite(frame);
}

const MSG_ERROR =
  `The package 'react-native-tflite' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const TfliteModule = NativeModules.TfliteModule
  ? NativeModules.TfliteModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(MSG_ERROR);
        },
      }
    );

export function initTensor(
  modelPath?: string,
  count?: number
): Promise<string> {
  return TfliteModule.initTensor(modelPath, count);
}

export function tensorImage(imagePath?: string): Promise<any> {
  return TfliteModule.tensorImage(imagePath);
}

export function tensorBase64(imageString: string): Promise<any> {
  return TfliteModule.tensorBase64(imageString);
}
