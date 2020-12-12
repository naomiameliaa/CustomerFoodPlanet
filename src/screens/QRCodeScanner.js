import * as React from 'react';
import {StyleSheet, Vibration} from 'react-native';
import {RNCamera} from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import {alertMessage} from '../utils';

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

function QRCodeScanner({navigation}) {
  const [scanning, setScanning] = React.useState(false);
  const scannerRead = (data) => {
    if (!scanning) {
      setScanning(true);
      Vibration.vibrate();
      // do something here
      alertMessage({
        titleMessage: 'Success',
        bodyMessage: data,
        btnText: 'OK',
        onPressOK: () => navigation.goBack(),
        btnCancel: false,
      });
    }
  };

  return (
    <RNCamera
      style={styles.preview}
      type={RNCamera.Constants.Type.back}
      flashMode={RNCamera.Constants.FlashMode.on}
      androidCameraPermissionOptions={{
        title: 'Permission to use camera',
        message: 'We need your permission to use your camera',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      }}
      onBarCodeRead={({data}) => scannerRead(data)}>
      <BarcodeMask width={160} height={160} outerMaskOpacity={0.8} />
    </RNCamera>
  );
}

export default QRCodeScanner;
