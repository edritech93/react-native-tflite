import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, LogBox } from 'react-native';
import {
  useCameraDevices,
  Camera,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { getPermissionCamera, getPermissionReadStorage } from './permission';
import { initTensor, tensorImage, tflite } from 'react-native-tflite';
import { launchImageLibrary } from 'react-native-image-picker';
import { runOnJS } from 'react-native-reanimated';

LogBox.ignoreAllLogs();

export default function App() {
  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.front;

  const [arrayTensor, setArrayTensor] = useState([]);
  const [isCamera, setIsCamera] = useState(false);

  useEffect(() => {
    initTensor('mobile_face_net', 1)
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
  }, []);

  const _onOpenImage = async () => {
    setIsCamera(false);
    await getPermissionReadStorage().catch((error: Error) => {
      console.log(error);
      return;
    });
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (
      result &&
      result.assets &&
      result.assets.length > 0 &&
      result.assets[0]?.uri
    ) {
      const imageUri = result.assets[0]?.uri.substring(7);
      console.log('imageUri => ', imageUri);
      tensorImage(imageUri || '')
        .then((response) => setArrayTensor(response))
        .catch((error) => console.log('error tensorImage =>', error));
    }
  };

  const _onOpenCamera = async () => {
    await getPermissionCamera().catch((error: Error) => {
      console.log(error);
      return;
    });
    setIsCamera(true);
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const result = tflite(frame);
    runOnJS(setArrayTensor)(result?.data);
  }, []);

  return (
    <View style={styles.container}>
      {device ? (
        <Camera
          style={styles.wrapCamera}
          device={device}
          isActive={isCamera}
          frameProcessor={frameProcessor}
        />
      ) : (
        <View style={styles.wrapCamera} />
      )}
      <Text
        style={styles.textResult}
        numberOfLines={1}
      >{`Result: ${arrayTensor}`}</Text>
      <View style={styles.wrapBottom}>
        <Button title={'Open Image'} onPress={_onOpenImage} />
        <Button title={'Open Camera'} onPress={_onOpenCamera} />
        <Button title={'Close Camera'} onPress={() => setIsCamera(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  wrapCamera: {
    flex: 1,
  },
  textResult: {
    color: 'black',
  },
  wrapBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
});
