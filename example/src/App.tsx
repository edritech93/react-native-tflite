import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import {
  useCameraDevices,
  Camera,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import { initTensor, tensorImage } from 'react-native-tflite';
import { getPermissionCamera, getPermissionReadStorage } from './permission';

export default function App() {
  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.front;

  const [arrayTensor, setArrayTensor] = useState([]);
  const [isCamera, setIsCamera] = useState(false);

  useEffect(() => {
    initTensor('mobile_face_net')
      .then((response) => {
        console.log('success initTensor => ', response);
      })
      .catch((error) => {
        console.log('error initTensor => ', error);
      });
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
        .then((response) => {
          console.log('success tensorImage =>', response);
          setArrayTensor(response);
        })
        .catch((error) => {
          console.log('error tensorImage =>', error);
        });
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
    // const scannedFaces = scanFaces(frame);
    // runOnJS(setFaces)(scannedFaces);

    console.log('frame => ', frame);
  }, []);

  return (
    <View style={styles.container}>
      {device ? (
        <Camera
          style={styles.wrapCamera}
          device={device}
          isActive={isCamera}
          frameProcessorFps={5}
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
