import * as React from 'react';
import {
  View,
  TextInput,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import ButtonKit from '../components/ButtonKit';
import ButtonText from '../components/ButtonText';
import Title from '../components/Title';
import theme from '../theme';
import {
  normalize,
  getData,
  removeData,
  storeData,
  alertMessage,
} from '../utils';
import {AuthContext} from '../../context';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: normalize(20),
  },
  backButton: {
    marginHorizontal: 10,
    marginVertical: 25,
  },
  txtTitle: {
    marginHorizontal: 20,
    marginBottom: 10,
    color: theme.colors.red,
  },
  content: {
    width: SCREEN_WIDTH * 0.8,
    fontSize: 16,
    color: theme.colors.grey,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  inputContainer: {
    alignItems: 'center',
  },
  inputStyle: {
    width: '90%',
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    fontSize: 18,
    paddingHorizontal: 20,
    marginVertical: 10,
    justifyContent: 'center',
  },
  inputStyleError: {
    width: '90%',
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.white,
    fontSize: 18,
    paddingHorizontal: 20,
    marginVertical: 10,
    justifyContent: 'center',
    borderColor: theme.colors.red,
    borderWidth: 1,
  },
  btnText: {
    color: theme.colors.white,
    fontSize: 18,
  },
  btnWrapper: {
    backgroundColor: theme.colors.red,
    width: '90%',
    borderRadius: 20,
    paddingVertical: 12,
    marginVertical: 10,
  },
});

function ChangePassword({navigation}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [oldPassword, onChangeOldPassword] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [confirmPassword, onChangeConfirmPassword] = React.useState('');
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

  const getUserGuestData = async () => {
    const dataUser = await getDataUser();
    const dataGuest = await getDataGuest();
    if (dataUser !== null) {
      return dataUser.userId;
    } else {
      return dataGuest.userId;
    }
  };

  async function validationPassword() {
    if (confirmPassword !== password) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Password does not match',
        btnText: 'Try Again',
        btnCancel: true,
      });
    }
    await changePassword();
  }

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

  async function changePassword() {
    setIsLoading(true);
    try {
      const userId = await getUserGuestData();
      const response = await axios.post(
        `https://food-planet.herokuapp.com/users/changePassword?userId=${userId}&oldPassword=${oldPassword}&newPassword=${confirmPassword}`,
      );
      if (response.data.msg === 'Change password success') {
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Password changed successfully, Please re-login!',
          btnText: 'OK',
          onPressOK: () => logout(),
          btnCancel: false,
        });
      }
    } catch (error) {
      if (error.response.status === 401) {
        sessionTimedOut();
      } else {
        alertMessage({
          titleMessage: 'Failed',
          bodyMessage: 'Please try again later',
          btnText: 'Try Again',
          btnCancel: true,
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
        <Title text="Change Password" txtStyle={styles.txtTitle} />
        <Text style={styles.content}>
          Please enter your old password and then your new password.
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputStyle}
            onChangeText={(text) => onChangeOldPassword(text)}
            value={oldPassword}
            textContentType="password"
            secureTextEntry={true}
            autoCapitalize="none"
            placeholder="Old Password"
          />
          <TextInput
            style={
              confirmPassword !== password
                ? styles.inputStyleError
                : styles.inputStyle
            }
            onChangeText={(text) => onChangePassword(text)}
            value={password}
            textContentType="password"
            secureTextEntry={true}
            autoCapitalize="none"
            placeholder="New Password"
          />
          <TextInput
            style={
              confirmPassword !== password
                ? styles.inputStyleError
                : styles.inputStyle
            }
            onChangeText={(text) => onChangeConfirmPassword(text)}
            value={confirmPassword}
            textContentType="password"
            secureTextEntry={true}
            autoCapitalize="none"
            placeholder="Confirm New Password"
          />
          <ButtonText
            title="Submit"
            txtStyle={styles.btnText}
            wrapperStyle={styles.btnWrapper}
            onPress={validationPassword}
            isLoading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ChangePassword;
