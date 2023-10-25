import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-tflite' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Tflite = NativeModules.Tflite
  ? NativeModules.Tflite
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function initTensor(modelPath: string, count?: number): Promise<string> {
  return Tflite.initTensor(modelPath, count);
}

export function tensorBase64(imageString: string): Promise<any> {
  return Tflite.tensorBase64(imageString);
}
