import * as React from 'react';
import {View, TextInput, SafeAreaView, StyleSheet} from 'react-native';
import axios from 'axios';
import ButtonKit from '../components/ButtonKit';
import ButtonText from '../components/ButtonText';
import Title from '../components/Title';
import theme from '../theme';
import {
  getData,
  removeData,
  storeData,
  alertMessage,
  normalize,
} from '../utils';
import {AuthContext} from '../../context';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.light_grey,
    flex: 1,
  },
  innerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    marginVertical: 20,
  },
  txtTitle: {
    margin: 20,
    color: theme.colors.red,
  },
  inputContainer: {
    alignItems: 'center',
  },
  inputStyle: {
    width: '90%',
    height: normalize(42),
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 'auto',
    marginVertical: 10,
    justifyContent: 'center',
  },
  inputStyleError: {
    width: '90%',
    height: normalize(42),
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 'auto',
    marginVertical: 10,
    justifyContent: 'center',
    borderColor: theme.colors.red,
    borderWidth: 1,
  },
  signUpTxt: {
    color: theme.colors.white,
    fontSize: 18,
  },
  signUpWrapper: {
    backgroundColor: theme.colors.red,
    width: '90%',
    borderRadius: 20,
    paddingVertical: 12,
    marginVertical: 10,
  },
  loginTxt: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  loginBtn: {
    color: theme.colors.red,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 20,
  },
  TCTxt: {
    fontSize: 15,
    marginHorizontal: 5,
  },
  TCBtn: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  TCWrapper: {
    marginBottom: 100,
  },
});

function EditProfile({navigation, route}) {
  const {full_name, phone_num, getProfile} = route.params;
  const [fullName, onChangeFullName] = React.useState(full_name);
  const [phoneNum, onChangePhoneNum] = React.useState(phone_num);
  const [isLoading, setIsLoading] = React.useState(false);
  const {signOutGuest, signOut} = React.useContext(AuthContext);

  function checkInput() {
    if (fullName.length === 0 || phoneNum.length === 0) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'All data must be filled!',
        btnText: 'Try Again',
        btnCancel: true,
      });
    } else if (!validatePhoneNumber) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Phone Number is invalid!',
        btnText: 'Try Again',
        btnCancel: true,
      });
    } else {
      editProfile();
    }
  }

  function validatePhoneNumber() {
    var regExp = /\+?([ -]?\d+)+|\(\d+\)([ -]\d+)/g;
    return regExp.test(phoneNum);
  }

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

  const getUserGuestData = async () => {
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

  function sessionTimedOut() {
    alertMessage({
      titleMessage: 'Session Timeout',
      bodyMessage: 'Please re-login',
      btnText: 'OK',
      onPressOK: () => {
        logout();
      },
      btnCancel: false,
    });
  }

  async function editProfile() {
    setIsLoading(true);
    const userId = await getUserGuestData();
    try {
      const response = await axios.put(
        'https://food-planet.herokuapp.com/users/updateProfile',
        {
          userId: userId,
          phoneNumber: phoneNum,
          fullname: fullName,
        },
      );
      if (response.data.msg === 'Update profile success') {
        alertMessage({
          titleMessage: 'Update profile Succeed',
          bodyMessage: 'Profile changed successfully',
          btnText: 'OK',
          onPressOK: () => {
            navigation.goBack();
            getProfile();
          },
          btnCancel: false,
        });
      }
    } catch (error) {
      if (error.response.status === 401) {
        sessionTimedOut();
      } else {
        alertMessage({
          titleMessage: 'Error',
          bodyMessage: 'Failed to update your profile, Please try again!',
          btnText: 'Try Again',
          btnCancel: false,
        });
      }
    }
    setIsLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <ButtonKit
          wrapperStyle={styles.backButton}
          source={require('../assets/back-button.png')}
          onPress={() => navigation.goBack()}
        />
        <Title txtStyle={styles.txtTitle} text="Edit your Profile" />
        <View style={styles.inputContainer}>
          <TextInput
            style={
              fullName.length === 0 ? styles.inputStyleError : styles.inputStyle
            }
            onChangeText={(text) => onChangeFullName(text)}
            value={fullName}
            textContentType="name"
            placeholder="Full Name"
          />
          <TextInput
            style={
              !validatePhoneNumber || phoneNum.length === 0
                ? styles.inputStyleError
                : styles.inputStyle
            }
            onChangeText={(text) => onChangePhoneNum(text)}
            value={phoneNum}
            textContentType="telephoneNumber"
            keyboardType="phone-pad"
            placeholder="Phone Number"
          />
          <ButtonText
            title="Submit"
            txtStyle={styles.signUpTxt}
            wrapperStyle={styles.signUpWrapper}
            onPress={() => checkInput()}
            isLoading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default EditProfile;
