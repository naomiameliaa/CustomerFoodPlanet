import {Dimensions, Platform, PixelRatio, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

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
