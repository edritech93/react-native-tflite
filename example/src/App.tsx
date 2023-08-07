import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, LogBox } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { initTensor, tensorImage } from 'react-native-tflite';
import { getPermissionReadStorage } from './permission';

LogBox.ignoreAllLogs();

export default function App() {
  const [arrayTensor, setArrayTensor] = useState([]);

  useEffect(() => {
    initTensor('mobile_face_net', 1)
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
  }, []);

  const _onOpenImage = async () => {
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

  return (
    <View style={styles.container}>
      <Text
        style={styles.textResult}
        numberOfLines={1}
      >{`Result: ${JSON.stringify(arrayTensor)}`}</Text>
      <View style={styles.wrapBottom}>
        <Button title={'Open Image'} onPress={_onOpenImage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  textResult: {
    flex: 1,
    color: 'black',
  },
  wrapBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
