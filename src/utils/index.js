import {Dimensions, Platform, PixelRatio, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
    console.log(e);
  }
};

export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (e) {
    // saving error
    console.log(e);
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    // error reading value
    console.log(e);
  }
};

export const alertMessage = ({
  titleMessage,
  bodyMessage,
  btnText,
  onPressOK,
  secondBtnText = false,
  secondOnPressOK = false,
  btnCancel,
}) => {
  const arrBtnAlert = [
    {
      text: btnText,
      onPress: () => (onPressOK ? onPressOK() : null),
    },
  ];

  if (secondBtnText) {
    arrBtnAlert.push({
      text: secondBtnText,
      onPress: () => (secondOnPressOK ? secondOnPressOK() : null),
    });
  }
  Alert.alert(titleMessage, bodyMessage, arrBtnAlert, {
    cancelable: btnCancel,
  });
};

export const getUserId = async () => {
  const dataUser = await getData('userData');
  const dataGuest = await getData('guestData');
  if (dataUser !== null) {
    return dataUser.userId;
  } else {
    return dataGuest.userId;
  }
};

export const saveFcmToken = async () => {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    const userId = await getUserId();
    try {
      const response = await axios.post(
        `https://food-planet.herokuapp.com/users/saveNotificationToken?userId=${userId}&token=${fcmToken}`,
      );
      if (response.data.status === true) {
      }
    } catch (error) {
      console.log(error.response);
    }
  } else {
    console.log('Failed', 'No token received');
  }
};

export const deleteFcmToken = async () => {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    const userId = await getUserId();
    try {
      const response = await axios.post(
        `https://food-planet.herokuapp.com/users/removeNotificationToken?userId=${userId}&token=${fcmToken}`,
      );
    } catch (error) {
      console.log(error.response);
    }
  } else {
    console.log('Failed', 'No token received');
  }
};
