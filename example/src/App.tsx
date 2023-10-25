import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  LogBox,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { initTensor, tensorBase64 } from 'react-native-tflite';
import { launchImageLibrary } from 'react-native-image-picker';
import { getPermissionReadStorage } from './permission';

LogBox.ignoreAllLogs();

export default function App() {
  const [arrayTensor, setArrayTensor] = useState<number[]>([]);

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
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });
    if (
      result &&
      result.assets &&
      result.assets.length > 0 &&
      result.assets[0]?.uri
    ) {
      tensorBase64(result.assets[0].base64 || '')
        .then((response) => {
          const objRes: number[] =
            Platform.OS === 'android' ? JSON.parse(response) : response;
          const arrayRes: number[] = objRes.map((e: number) => {
            const stringFixed: string = e.toFixed(5);
            return parseFloat(stringFixed);
          });
          setArrayTensor(arrayRes);
        })
        .catch((error) => console.log('error tensorImage =>', error));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapBottom}>
        <Button title={'Open Image'} onPress={_onOpenImage} />
      </View>
      <ScrollView>
        <Text style={styles.textResult}>{`Result: ${JSON.stringify(
          arrayTensor
        )}`}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
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
