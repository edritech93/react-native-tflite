import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { initTensor, tensorImage } from 'react-native-tflite';

// enum MobileNet {
//   static let modelInfo: FileInfo = (name: "mobile_face_net", extension: "tflite")
//   static let labelsInfo: FileInfo = (name: "labelmap", extension: "txt")
// }

export default function App() {
  const [result, setResult] = React.useState<string | undefined>();

  // React.useEffect(() => {
  //   tensorImage('image path here...').then(setResult);
  // }, []);

  React.useEffect(() => {
    console.log('start init')
    initTensor("mobile_face_net", 'labelmap').then(response => {
      console.log('initTensor => ', response)
    })
    .catch(error => {
      console.log('initTensor => ', error)
    })
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'cyan'
  },
});
