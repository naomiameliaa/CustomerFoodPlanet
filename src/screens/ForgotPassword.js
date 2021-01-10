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
import {alertMessage, normalize} from '../utils';
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
    fontWeight: 'bold',
  },
  sendWrapper: {
    backgroundColor: theme.colors.red,
    width: '90%',
    borderRadius: 20,
    paddingVertical: 12,
    marginVertical: 10,
  },
});

function ForgotPassword({navigation}) {
  const [email, onChangeEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

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
      sendEmail();
    }
  }

  function validateEmail() {
    var regExp = /\S+@\S+\.\S+/;
    return regExp.test(email);
  }

  async function sendEmail() {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `https://food-planet.herokuapp.com/users/forgotPassword?email=${email.toLowerCase()}`,
      );
      if (response.data.msg === 'Forgot password success') {
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Please kindly check your email',
          btnText: 'OK',
          onPressOK: () => navigation.navigate('AuthLandingPage'),
          btnCancel: true,
        });
      }
    } catch (error) {
      alertMessage({
        titleMessage: 'Failed',
        bodyMessage: 'Please try again later',
        btnText: 'Try Again',
        btnCancel: true,
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
        <Title txtStyle={styles.txtTitle} text="Forgot Password" />
        <Text style={styles.content}>
          Please enter your email to receive a link to create a new password via
          email.
        </Text>
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
            title="Send"
            txtStyle={styles.sendTxt}
            wrapperStyle={styles.sendWrapper}
            onPress={() => checkInput()}
            isLoading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ForgotPassword;
