// import type { Frame } from 'react-native-vision-camera';
import { NativeModules, Platform } from 'react-native';

/**
 * Scans Faces.
 */

// type Point = { x: number; y: number };
// export interface Face {
//   leftEyeOpenProbability: number;
//   rollAngle: number;
//   pitchAngle: number;
//   yawAngle: number;
//   rightEyeOpenProbability: number;
//   smilingProbability: number;
//   bounds: {
//     y: number;
//     x: number;
//     height: number;
//     width: number;
//   };
//   contours: {
//     FACE: Point[];
//     NOSE_BOTTOM: Point[];
//     LOWER_LIP_TOP: Point[];
//     RIGHT_EYEBROW_BOTTOM: Point[];
//     LOWER_LIP_BOTTOM: Point[];
//     NOSE_BRIDGE: Point[];
//     RIGHT_CHEEK: Point[];
//     RIGHT_EYEBROW_TOP: Point[];
//     LEFT_EYEBROW_TOP: Point[];
//     UPPER_LIP_BOTTOM: Point[];
//     LEFT_EYEBROW_BOTTOM: Point[];
//     UPPER_LIP_TOP: Point[];
//     LEFT_EYE: Point[];
//     RIGHT_EYE: Point[];
//     LEFT_CHEEK: Point[];
//   };
// }

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

export function tensorImage(imagePath?: string): Promise<string> {
  return TfliteModule.tensorImage(imagePath);
}
