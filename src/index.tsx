import { NativeModules, Platform } from 'react-native';

const MSG_ERROR =
  `The package 'react-native-tflite' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const Tflite = NativeModules.Tflite
  ? NativeModules.Tflite
  : new Proxy(
      {},
      {
        get() {
          throw new Error(MSG_ERROR);
        },
      }
    );

export function initTensor(
  modelName: string,
  modelLabel: string,
  count: number = 1
): Promise<any> {
  return Tflite.initTensor(modelName, modelLabel, count);
}

export function tensorImage(imagePath: string): Promise<any> {
  return Tflite.tensorImage(imagePath);
}
