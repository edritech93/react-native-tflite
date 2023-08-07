import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  initTensor(modelPath: string, count: number): Promise<string>;
  tensorImage(imagePath: string): Promise<string>;
  tensorBase64(imageString: string): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Tflite');
