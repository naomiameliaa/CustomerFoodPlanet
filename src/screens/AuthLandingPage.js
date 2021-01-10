import * as React from 'react';
import ViewSlider from 'react-native-view-slider';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import ButtonText from '../components/ButtonText';
import Title from '../components/Title';
import theme from '../theme';
import {AuthContext} from '../../context';
import {
  getData,
  storeData,
  alertMessage,
  saveFcmToken,
  normalize,
} from '../utils';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.off_white,
    flex: 1,
  },
  innerContainer: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  btnContainer: {
    alignSelf: 'flex-end',
  },
  buttonTxtLogin: {
    color: theme.colors.red,
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
  contentWrapper: {
    alignItems: 'center',
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    padding: 10,
    justifyContent: 'center',
    height: SCREEN_HEIGHT * 0.55,
  },
  imgWrapper: {
    width: '80%',
    height: SCREEN_HEIGHT * 0.35,
    marginTop: normalize(10),
    alignItems: 'center',
  },
  imgStyle: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: theme.colors.red,
    marginBottom: 10,
  },
  txtContent: {
    width: '85%',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: normalize(16),
  },
  slider: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    height: SCREEN_HEIGHT * 0.62,
  },
  dotContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  buttonTxtStyle: {
    fontSize: normalize(18),
    color: theme.colors.off_white,
    fontWeight: 'bold',
  },
  btnWrapperStyle: {
    padding: 12,
    backgroundColor: theme.colors.red,
    width: '70%',
    borderRadius: 30,
    marginBottom: 20,
  },
});

function AuthLandingPage({navigation}) {
  const {guestIn} = React.useContext(AuthContext);
  const [guestData, setGuestData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const getDataGuest = async () => {
    const dataGuest = await getData('guestData');
    if (dataGuest !== null) {
      setGuestData(dataGuest);
    } else {
      setGuestData(null);
    }
  };

  const validationLogin = async () => {
    if (guestData !== null) {
      login();
    } else {
      loginAsGuest();
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
            username: guestData.email.toLowerCase(),
            password: guestData.password,
          },
        },
      );
      if (response.data.msg === 'Login success') {
        const responseData = response.data.object;
        const dataGuest = {
          ...responseData,
          isLogin: true,
        };
        storeData('guestData', dataGuest);
        saveFcmToken();
        guestIn();
      }
    } catch (error) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Login Error. Please try again later!',
        btnText: 'OK',
        btnCancel: false,
      });
    }
    setIsLoading(false);
  }

  async function loginAsGuest() {
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://food-planet.herokuapp.com/users/loginAsGuest',
      );
      if (response.data.msg === 'Login success') {
        const responseData = response.data.object;
        const dataGuest = {
          ...responseData,
          isLogin: true,
        };
        storeData('guestData', dataGuest);
        saveFcmToken();
        guestIn();
      }
    } catch (error) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Login Error. Please try again later!',
        btnText: 'OK',
        btnCancel: false,
      });
    }
    setIsLoading(false);
  }

  React.useEffect(() => {
    getDataGuest();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.btnContainer}>
          <ButtonText
            title="Log in"
            txtStyle={styles.buttonTxtLogin}
            onPress={() => {
              navigation.navigate('LoginPage');
            }}
          />
        </View>

        <ViewSlider
          renderSlides={
            <>
              <View style={styles.contentWrapper}>
                <View style={styles.imgWrapper}>
                  <Image
                    style={styles.imgStyle}
                    source={require('../assets/foodie-icon.png')}
                    resizeMode="contain"
                  />
                </View>
                <Title txtStyle={styles.title} text="Find foods you love" />
                <Text style={styles.txtContent}>
                  Discover the best foods from over 1,000 restaurants
                </Text>
              </View>
              <View style={styles.contentWrapper}>
                <View style={styles.imgWrapper}>
                  <Image
                    style={styles.imgStyle}
                    source={require('../assets/reserved-table.jpg')}
                    resizeMode="contain"
                  />
                </View>
                <Title txtStyle={styles.title} text="Reserve your table" />
                <Text style={styles.txtContent}>
                  No need to worry not getting table when you want to eat at
                  food court
                </Text>
              </View>
              <View style={styles.contentWrapper}>
                <View style={styles.imgWrapper}>
                  <Image
                    style={styles.imgStyle}
                    source={require('../assets/easy-payment.png')}
                    resizeMode="contain"
                  />
                </View>
                <Title txtStyle={styles.title} text="Easy Payment" />
                <Text style={styles.txtContent}>
                  Feel the easiness of making transactions with various payment
                  methods
                </Text>
              </View>
            </>
          }
          style={styles.slider}
          height={400}
          slideCount={3}
          dots={true}
          dotActiveColor={theme.colors.red}
          dotInactiveColor={theme.colors.red_20}
          dotsContainerStyle={styles.dotContainer}
          autoSlide={false}
        />
        <View style={styles.buttonContainer}>
          <ButtonText
            title="Create Account"
            txtStyle={styles.buttonTxtStyle}
            wrapperStyle={styles.btnWrapperStyle}
            onPress={() => {
              navigation.navigate('RegisterPage');
            }}
          />
          <ButtonText
            title="Log in as Guest"
            txtStyle={styles.buttonTxtStyle}
            wrapperStyle={styles.btnWrapperStyle}
            onPress={validationLogin}
            isLoading={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default AuthLandingPage;
