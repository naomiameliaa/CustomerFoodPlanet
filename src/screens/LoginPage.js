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
import {AuthContext} from '../../context';
import {storeData, alertMessage, getUserId, saveFcmToken} from '../utils';

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
  forgotPasswordTxt: {
    color: theme.colors.red,
  },
  forgotPasswordWrapper: {
    alignSelf: 'flex-start',
    marginBottom: 15,
    marginHorizontal: 30,
  },
  loginTxt: {
    color: theme.colors.white,
    fontSize: 18,
  },
  loginWrapper: {
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

function LoginPage({navigation}) {
  const {signIn} = React.useContext(AuthContext);
  const [usernameEmail, onChangeUsernameEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const validationLogin = () => {
    if (usernameEmail.length === 0 || password.length === 0) {
      alertMessage({
        titleMessage: 'Warning !',
        bodyMessage: 'all data must be filled',
        btnText: 'Try Again',
        btnCancel: false,
      });
    } else {
      login();
    }
  };

  async function login() {
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://food-planet.herokuapp.com/users/login',
        {
          params: {
            role: 'customer',
          },
          auth: {
            username: usernameEmail.toLowerCase(),
            password: password,
          },
        },
      );
      if (response.data.msg === 'Login success') {
        storeData('userData', response.data.object);
        saveFcmToken();
        signIn();
      }
    } catch (error) {
      console.log(error);
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Incorrect password or email',
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
        <Title txtStyle={styles.txtTitle} text="Log in to your account" />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputStyle}
            onChangeText={(text) => onChangeUsernameEmail(text)}
            value={usernameEmail}
            textContentType="emailAddress"
            autoCapitalize="none"
            placeholder="Email"
          />
          <TextInput
            style={styles.inputStyle}
            onChangeText={(text) => onChangePassword(text)}
            value={password}
            textContentType="password"
            autoCapitalize="none"
            placeholder="Password"
            secureTextEntry={true}
          />
          <ButtonText
            title="Forgot Password ?"
            txtStyle={styles.forgotPasswordTxt}
            wrapperStyle={styles.forgotPasswordWrapper}
            onPress={() => navigation.navigate('ForgotPasswordPage')}
          />
          <ButtonText
            title="Log in"
            txtStyle={styles.loginTxt}
            wrapperStyle={styles.loginWrapper}
            onPress={validationLogin}
            isLoading={isLoading}
          />
          <View style={styles.signUpWrapper}>
            <Text style={styles.signUpTxt}>Don't have an account?</Text>
            <ButtonText
              title="Sign up"
              txtStyle={styles.signUpBtn}
              onPress={() => {
                navigation.navigate('RegisterPage');
              }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default LoginPage;
