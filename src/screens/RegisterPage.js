import * as React from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import axios from 'axios';
import ButtonKit from '../components/ButtonKit';
import ButtonText from '../components/ButtonText';
import Title from '../components/Title';
import theme from '../theme';
import {alertMessage} from '../utils';

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

function RegisterPage({navigation}) {
  const [fullName, onChangeFullName] = React.useState('');
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [phoneNum, onChangePhoneNum] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  async function signUp() {
    setIsLoading(true);
    console.log('masuk signup', email, password, fullName, phoneNum);
    try {
      const response = await axios.post(
        'https://food-planet.herokuapp.com/users/register',
        {
          email: email,
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
      <View style={styles.innerContainer}>
        <ButtonKit
          wrapperStyle={styles.backButton}
          source={require('../assets/back-button.png')}
          onPress={() => navigation.goBack()}
        />
        <Title txtStyle={styles.txtTitle} text="Create your account" />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputStyle}
            onChangeText={(text) => onChangeFullName(text)}
            value={fullName}
            textContentType="name"
            placeholder="Full Name"
          />
          <TextInput
            style={styles.inputStyle}
            onChangeText={(text) => onChangeEmail(text)}
            value={email}
            textContentType="emailAddress"
            placeholder="Email"
          />
          <TextInput
            style={styles.inputStyle}
            onChangeText={(text) => onChangePassword(text)}
            value={password}
            textContentType="password"
            placeholder="Password"
            secureTextEntry={true}
          />
          <TextInput
            style={styles.inputStyle}
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
            onPress={signUp}
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
      </View>
    </SafeAreaView>
  );
}

export default RegisterPage;
