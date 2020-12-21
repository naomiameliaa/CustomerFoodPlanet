import * as React from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import ButtonKit from '../components/ButtonKit';
import ButtonText from '../components/ButtonText';
import Title from '../components/Title';
import theme from '../theme';
import {alertMessage, getData, storeData} from '../utils';
import {AuthContext} from '../../context';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

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
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    fontSize: 18,
    paddingHorizontal: 20,
    marginVertical: 10,
    justifyContent: 'center',
  },
  content: {
    width: SCREEN_WIDTH * 0.8,
    fontSize: 16,
    color: theme.colors.grey,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sendTxt: {
    color: theme.colors.white,
    fontSize: 18,
  },
  sendWrapper: {
    backgroundColor: theme.colors.red,
    width: '90%',
    borderRadius: 20,
    paddingVertical: 12,
    marginVertical: 10,
  },
  signUpTxt: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  signUpBtn: {
    color: theme.colors.red,
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 20,
  },
});

function ForgotPassword({navigation}) {
  const [email, onChangeEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const {signOutGuest, signOut} = React.useContext(AuthContext);

  const logout = async () => {
    const dataGuest = await getData('guestData');
    const dataGuestUpdated = {
      ...dataGuest,
      isLogin: false,
    };
    storeData('guestData', dataGuestUpdated);
    await signOutGuest(dataGuestUpdated);
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
  }

  async function sendEmail() {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `https://food-planet.herokuapp.com/users/forgotPassword?email=${email}`,
      );
      if (response.data.msg === 'Forgot password success') {
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Please kindly check your email',
          btnText: 'OK',
          btnCancel: true,
        });
      }
    } catch (error) {
      if(error.response.status === 401) {
        await sessionTimedOut();
      }else {
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

  function validationEmail() {
    if (email === '') {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Email field is required',
        btnText: 'OK',
        btnCancel: true,
      });
    }
    sendEmail();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <ButtonKit
          wrapperStyle={styles.backButton}
          source={require('../assets/back-button.png')}
          onPress={() => navigation.goBack()}
        />
        <Title txtStyle={styles.txtTitle} text="Forgot Password" />
        <Text style={styles.content}>
          Please enter your email to receive a link to create a new password via
          email.
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputStyle}
            onChangeText={(text) => onChangeEmail(text)}
            value={email}
            textContentType="emailAddress"
            placeholder="Email"
          />
          <ButtonText
            title="Send"
            txtStyle={styles.sendTxt}
            wrapperStyle={styles.sendWrapper}
            onPress={() => validationEmail()}
            isLoading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ForgotPassword;
