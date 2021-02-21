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
  btnTxt: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnWrapper: {
    backgroundColor: theme.colors.red,
    width: '90%',
    borderRadius: 20,
    paddingVertical: 12,
    marginVertical: 10,
  },
});

function ChangeEmail({navigation}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, onChangeEmail] = React.useState('');
  const {signOutGuest, signOut} = React.useContext(AuthContext);

  function checkInput() {
    if (email.length === 0) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Email field is required!',
        btnText: 'Try Again',
        btnCancel: true,
      });
    } else if (!validateEmail) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Email is invalid!',
        btnText: 'Try Again',
        btnCancel: true,
      });
    } else {
      changeEmail();
    }
  }

  function validateEmail() {
    var regExp = /\S+@\S+\.\S+/;
    return regExp.test(email);
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

  async function logout() {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://food-planet.herokuapp.com/users/logout',
      );
      await signOutUser();
    } catch (error) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Please try again later',
        btnText: 'Try Again',
        btnCancel: false,
      });
    }
    setIsLoading(false);
  }

  const signOutUser = async () => {
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
        signOutUser();
      },
      btnCancel: false,
    });
  }

  async function changeEmail() {
    setIsLoading(true);
    try {
      const userId = await getUserGuestData();
      const response = await axios.post(
        `https://food-planet.herokuapp.com/users/changeEmail?userId=${userId}&email=${email.toLowerCase()}`,
      );
      if (response.data.msg === 'Change email success') {
        alertMessage({
          titleMessage: 'Change Email Succeed',
          bodyMessage: 'Email changed successfully, Please re-login!',
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
          titleMessage: 'Error',
          bodyMessage: 'Failed to Register as Member, Please try again!',
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
        <Title text="Change Email" txtStyle={styles.txtTitle} />
        <Text style={styles.content}>Please enter your new email.</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={
              !validateEmail || email.length === 0
                ? styles.inputStyleError
                : styles.inputStyle
            }
            onChangeText={(text) => onChangeEmail(text)}
            value={email}
            textContentType="emailAddress"
            placeholder="Email"
          />
          <ButtonText
            title="Submit"
            txtStyle={styles.btnTxt}
            wrapperStyle={styles.btnWrapper}
            onPress={() => checkInput()}
            isLoading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ChangeEmail;
