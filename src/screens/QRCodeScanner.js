import * as React from 'react';
import {StyleSheet, Vibration} from 'react-native';
import {RNCamera} from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import axios from 'axios';
import {
  getData,
  storeData,
  removeData,
  alertMessage,
  normalize,
} from '../utils';
import {AuthContext} from '../../context';
import SpinnerKit from '../components/SpinnerKit';

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  spinnerKitStyle: {
    marginTop: normalize(80),
  },
});

function QRCodeScanner({navigation}) {
  const [scanning, setScanning] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const {signOutGuest, signOut} = React.useContext(AuthContext);

  const getDataUser = async () => {
    const dataUser = await getData('userData');
    if (dataUser !== null) {
      return dataUser;
    } else {
      return null;
    }
  };

  const getDataGuest = async () => {
    const dataGuest = await getData('guestData');
    if (dataGuest !== null) {
      return dataGuest;
    } else {
      return null;
    }
  };

  const checkUserGuest = async () => {
    const dataUser = await getDataUser();
    const dataGuest = await getDataGuest();
    if (dataUser !== null) {
      return dataUser.userId;
    } else {
      return dataGuest.userId;
    }
  };

  const logout = async () => {
    const dataUser = await getData('userData');
    const dataGuest = await getData('guestData');
    if (dataUser !== null) {
      await removeData('userData');
      await signOut();
    } else {
      const dataGuestUpdated = {
        ...dataGuest,
        isLogin: false,
      };
      await storeData('guestData', dataGuestUpdated);
      await signOutGuest(dataGuestUpdated);
    }
  };

  const sessionTimedOut = async () => {
    alertMessage({
      titleMessage: 'Session Timeout',
      bodyMessage: 'Please re-login',
      btnText: 'OK',
      onPressOK: () => {
        logout();
      },
      btnCancel: false,
    });
  };

  async function setSeatAvailable(seatId) {
    setIsLoading(true);
    const userId = await checkUserGuest();
    console.log(userId);
    try {
      const response = await axios.post(
        `https://food-planet.herokuapp.com/orders/setSeatAvailable?userId=${userId}&seatId=${seatId}`,
      );
      console.log(response.data);
      if (response.data.msg === 'Success set seat available') {
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Thank you for your visit !',
          btnText: 'OK',
          onPressOK: () => navigation.goBack(),
          btnCancel: false,
        });
      }
    } catch (error) {
      console.log(error.response.data);
      if (error.response.status === 401) {
        await sessionTimedOut();
      } else {
        alertMessage({
          titleMessage: 'Error',
          bodyMessage: 'Failed, Please try again!',
          btnText: 'Try Again',
          onPressOK: () => navigation.goBack(),
          btnCancel: false,
        });
      }
    }
    setIsLoading(false);
  }

  const scannerRead = (data) => {
    if (!scanning) {
      setScanning(true);
      Vibration.vibrate();
      setSeatAvailable(data);
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
      {isLoading ? (
        <SpinnerKit sizeSpinner="large" style={styles.spinnerKitStyle} />
      ) : (
        <BarcodeMask width={160} height={160} outerMaskOpacity={0.8} />
      )}
    </RNCamera>
  );
}

export default QRCodeScanner;
