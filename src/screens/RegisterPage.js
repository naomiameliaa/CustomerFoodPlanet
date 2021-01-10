import * as React from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import ButtonKit from '../components/ButtonKit';
import ButtonText from '../components/ButtonText';
import Title from '../components/Title';
import theme from '../theme';
import {alertMessage, normalize} from '../utils';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.light_grey,
    flex: 1,
  },
  innerContainer: {
    padding: 20,
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
    fontWeight: 'bold',
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
    fontSize: normalize(14),
    textAlign: 'center',
  },
  TCBtn: {
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
  TCWrapper: {
    marginBottom: 100,
  },
});

function RegisterPage({navigation}) {
  const [fullName, onChangeFullName] = React.useState('');
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [phoneNum, onChangePhoneNum] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  function checkSignUp() {
    if (
      fullName.length === 0 ||
      email.length === 0 ||
      password.length === 0 ||
      phoneNum.length === 0
    ) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'All data must be filled!',
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
    } else if (!validatePhoneNumber) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Phone Number is invalid!',
        btnText: 'Try Again',
        btnCancel: true,
      });
    } else {
      signUp();
    }
  }

  function validateEmail() {
    var regExp = /\S+@\S+\.\S+/;
    return regExp.test(email);
  }

  function validatePhoneNumber() {
    var regExp = /\+?([ -]?\d+)+|\(\d+\)([ -]\d+)/g;
    return regExp.test(phoneNum);
  }

  async function signUp() {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://food-planet.herokuapp.com/users/register',
        {
          email: email.toLowerCase(),
          password: password,
          fullName: fullName,
          phoneNumber: phoneNum,
        },
      );
      if (response.data.msg === 'Register success') {
        alertMessage({
          titleMessage: 'Register Succeed',
          bodyMessage:
            'Thank you for register! Please kindly check your email for activation your email',
          btnText: 'OK',
          onPressOK: () => navigation.navigate('AuthLandingPage'),
          btnCancel: false,
        });
      }
    } catch (error) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Failed to Register Account, Please try again!',
        btnText: 'Try Again',
        btnCancel: false,
      });
    }
    setIsLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.innerContainer}>
        <ButtonKit
          wrapperStyle={styles.backButton}
          source={require('../assets/back-button.png')}
          onPress={() => navigation.goBack()}
        />
        <Title txtStyle={styles.txtTitle} text="Create your account" />
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
              !validateEmail || email.length === 0
                ? styles.inputStyleError
                : styles.inputStyle
            }
            onChangeText={(text) => onChangeEmail(text)}
            value={email}
            textContentType="emailAddress"
            placeholder="Email"
          />
          <TextInput
            style={
              password.length === 0 ? styles.inputStyleError : styles.inputStyle
            }
            onChangeText={(text) => onChangePassword(text)}
            value={password}
            textContentType="password"
            placeholder="Password"
            secureTextEntry={true}
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
            title="Sign up"
            txtStyle={styles.signUpTxt}
            wrapperStyle={styles.signUpWrapper}
            onPress={() => checkSignUp()}
            isLoading={isLoading}
          />
          <View style={styles.TCWrapper}>
            <Text style={styles.TCTxt}>
              By clicking Sign up, you agree to our
            </Text>
            <ButtonText title="Terms and Conditions" txtStyle={styles.TCBtn} />
          </View>
          <View style={styles.loginWrapper}>
            <Text style={styles.loginTxt}>Already have an account?</Text>
            <ButtonText
              title="Log in"
              txtStyle={styles.loginBtn}
              onPress={() => {
                navigation.navigate('LoginPage');
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default RegisterPage;
