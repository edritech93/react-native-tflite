import * as React from 'react';
import { StyleSheet, View, Text, Platform, Button } from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import { PERMISSIONS, request } from 'react-native-permissions';
import { initTensor, tensorImage } from 'react-native-tflite';

export default function App() {
  const [arrayTensor, setArrayTensor] = React.useState<string | undefined>();

  React.useEffect(() => {
    initTensor('mobile_face_net')
      .then((response) => {
        console.log('success initTensor => ', response);
      })
      .catch((error) => {
        console.log('error initTensor => ', error);
      });
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.PHOTO_LIBRARY)
        .then(() => {})
        .catch(() => {});
    } else if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
        .then(() => {})
        .catch(() => {});
    }
  }, []);

  const _onPressPick = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };
    const result = await launchImageLibrary(options);
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

  return (
    <View style={styles.container}>
      <Text
        style={styles.textResult}
        numberOfLines={20}
      >{`Result: ${arrayTensor}`}</Text>
      <Button title={'Pick Here'} onPress={_onPressPick} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'cyan',
    padding: 16,
  },
  textResult: {
    color: 'black',
  },
});
