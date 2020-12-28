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
});

function RegisterMember({navigation}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [fullName, onChangeFullName] = React.useState('');
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [phoneNum, onChangePhoneNum] = React.useState('');
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

  const updateData = async () => {
    await removeData('guestData');
    await signOutGuest(null);
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

  async function registerAsMember() {
    setIsLoading(true);
    try {
      const userId = await getUserGuestData();
      const response = await axios.post(
        'https://food-planet.herokuapp.com/users/registerMember',
        {
          userId: userId,
          email: email.toLowerCase(),
          password: password,
          fullName: fullName,
          phoneNumber: phoneNum,
        },
      );
      if (response.data.msg === 'Register member success') {
        console.log(response.data);
        alertMessage({
          titleMessage: 'Register Succeed',
          bodyMessage:
            'Thank you for register! Please kindly check your email for activation your email',
          btnText: 'OK',
          onPressOK: () => updateData(),
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
        <Title text="Register as Member" txtStyle={styles.txtTitle} />
        <Text style={styles.content}>
          Please enter your email to register as member.
        </Text>
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
            onPress={registerAsMember}
            isLoading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default RegisterMember;
