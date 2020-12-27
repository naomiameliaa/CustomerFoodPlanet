import * as React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import ButtonKit from '../components/ButtonKit';
import {
  normalize,
  removeData,
  getData,
  alertMessage,
  storeData,
} from '../utils';
import theme from '../theme';
import ButtonText from '../components/ButtonText';
import SpinnerKit from '../components/SpinnerKit';
import {AuthContext} from '../../context';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: normalize(25),
    paddingHorizontal: normalize(25),
  },
  profileWrapper: {
    flexDirection: 'row',
    padding: 20,
    height: normalize(100),
  },
  profileImg: {
    width: 80,
    height: 80,
    marginRight: normalize(25),
  },
  identityWrapper: {
    flex: 1,
    flexDirection: 'column',
    marginVertical: normalize(4),
    marginHorizontal: normalize(2),
  },
  identityName: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: 2,
  },
  numEmailIdentity: {
    fontSize: normalize(14),
  },
  editButton: {
    width: '80%',
    height: '80%',
  },
  editBtnWrapper: {
    marginVertical: 20,
  },
  walletPointContainer: {
    flexDirection: 'row',
  },
  walletWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '55%',
    height: 60,
    borderRightColor: theme.colors.grey,
    borderRightWidth: 1,
  },
  walletStyle: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  txtWalletWrapper: {
    flexDirection: 'row',
  },
  txtWallet: {
    fontSize: normalize(15),
    marginRight: 5,
  },
  nominalWallet: {
    fontSize: normalize(15),
    fontWeight: 'bold',
  },
  pointWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
  },
  nominalPoint: {
    marginRight: 5,
    fontSize: normalize(15),
    fontWeight: 'bold',
  },
  txtPoint: {
    fontSize: normalize(15),
  },
  btnContainer: {
    paddingVertical: normalize(30),
    alignItems: 'center',
  },
  btnWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    height: 50,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  nextButton: {
    width: 15,
    height: 15,
  },
  buttonTxt: {
    fontWeight: 'bold',
    fontSize: normalize(15),
  },
  logoutBtnWrapper: {
    backgroundColor: theme.colors.red,
    width: SCREEN_WIDTH * 0.7,
    borderRadius: 20,
    paddingVertical: 12,
    marginTop: normalize(12),
  },
  logoutBtn: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: theme.colors.white,
  },
});

function ProfilePage({navigation}) {
  const [dataProfile, setDataProfile] = React.useState([]);
  const [dataUserGuest, setDataUserGuest] = React.useState([]);
  const [isLoadingLogin, setIsLoadingLogin] = React.useState(false);
  const [isLoadingLogout, setisLoadingLogout] = React.useState(false);
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

  const checkUserGuest = async () => {
    const dataUser = await getDataUser();
    const dataGuest = await getDataGuest();
    if (dataUser !== null) {
      await removeData('userData');
      return 'member';
    } else {
      const dataGuestUpdated = {
        ...dataGuest,
        isLogin: false,
      };
      storeData('guestData', dataGuestUpdated);
      return 'guest';
    }
  };

  const getUserGuestData = async () => {
    const dataUser = await getDataUser();
    const dataGuest = await getDataGuest();
    if (dataUser !== null) {
      setDataUserGuest(dataUser);
      return dataUser.userId;
    } else {
      setDataUserGuest(dataGuest);
      return dataGuest.userId;
    }
  };

  const signOutMember = async () => {
    const removeLocalData = await removeData('userData');
    if (removeLocalData) {
      signOut();
    }
  };

  async function logout() {
    setisLoadingLogout(true);
    try {
      const response = await axios.post(
        'https://food-planet.herokuapp.com/users/logout',
      );
      if (response.data.object === 'Logout success') {
        const checkUSER = await checkUserGuest();
        const checkGUEST = await getDataGuest();
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Logout success!',
          btnText: 'OK',
          onPressOK: () =>
            checkUSER === 'member' ? signOutMember() : signOutGuest(checkGUEST),
          btnCancel: false,
        });
      }
    } catch (error) {
      alertMessage({
        titleMessage: 'Error',
        bodyMessage: 'Please try again later',
        btnText: 'Try Again',
        btnCancel: false,
      });
    }
    setisLoadingLogout(false);
  }

  function sessionTimedOut() {
    alertMessage({
      titleMessage: 'Session Timeout',
      bodyMessage: 'Please re-login',
      btnText: 'OK',
      onPressOK: () => {
        checkUserGuest() === 'member'
          ? signOutMember()
          : signOutGuest(checkUserGuest());
      },
      btnCancel: false,
    });
  }

  async function getProfile() {
    setIsLoadingLogin(true);
    const userId = await getUserGuestData();
    try {
      const response = await axios.get(
        `https://food-planet.herokuapp.com/users/profile?userId=${userId}`,
      );
      if (response.data.msg === 'Query success') {
        console.log(response.data);
        setDataProfile(response.data.object);
      }
    } catch (error) {
      if (error.response.data.status === 401) {
        sessionTimedOut();
      }
    }
    setIsLoadingLogin(false);
  }

  const renderPrice = (price) => {
    let i;
    let tempPrice = '';
    let ctr = 0;
    let stringPrice = price.toString();
    for (i = stringPrice.length - 1; i >= 0; i--) {
      tempPrice += stringPrice[i];
      ctr++;
      if (ctr === 3) {
        if (i >= 1) {
          tempPrice += '.';
          ctr = 0;
        }
      }
    }
    let resPrice = '';
    for (i = tempPrice.length - 1; i >= 0; i--) {
      resPrice += tempPrice[i];
    }
    return resPrice;
  };

  console.log(dataProfile.fullname);

  React.useEffect(() => {
    getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileWrapper}>
          <Image
            style={styles.profileImg}
            source={require('../assets/profile-user.png')}
          />
          {isLoadingLogin ? (
            <SpinnerKit sizeSpinner="large" />
          ) : (
            <View style={styles.identityWrapper}>
              <Text style={styles.identityName} numberOfLines={1}>
                {dataProfile.fullname ? dataProfile.fullname : 'Guest'}
              </Text>
              <Text style={styles.numEmailIdentity}>
                {dataProfile.phoneNumber}
              </Text>
              <Text style={styles.numEmailIdentity}>{dataUserGuest.email}</Text>
            </View>
          )}
          <View style={styles.editBtnWrapper}>
            <ButtonKit
              btnStyle={styles.editButton}
              source={require('../assets/edit.png')}
              onPress={() => navigation.navigate('Edit Profile')}
            />
          </View>
        </View>
        {dataUserGuest?.balance && dataUserGuest?.point && (
          <View style={styles.walletPointContainer}>
            <View style={styles.walletWrapper}>
              <Image
                style={styles.walletStyle}
                source={require('../assets/wallet.png')}
              />
              <View style={styles.txtWalletWrapper}>
                <Text style={styles.txtWallet}>Rp</Text>
                <Text style={styles.nominalWallet}>
                  {renderPrice(dataUserGuest.balance)}
                </Text>
              </View>
            </View>
            <View style={styles.pointWrapper}>
              <Text style={styles.nominalPoint}>
                {renderPrice(dataUserGuest.point)}
              </Text>
              <Text style={styles.txtPoint}>points</Text>
            </View>
          </View>
        )}
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.btnWrapper}>
            <Text style={styles.buttonTxt}>Change Password</Text>
            <Image
              style={styles.nextButton}
              source={require('../assets/next-button.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnWrapper}>
            <Text style={styles.buttonTxt}>Payment Method</Text>
            <Image
              style={styles.nextButton}
              source={require('../assets/next-button.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnWrapper}>
            <Text style={styles.buttonTxt}>About Us</Text>
            <Image
              style={styles.nextButton}
              source={require('../assets/next-button.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnWrapper}>
            <Text style={styles.buttonTxt}>Settings</Text>
            <Image
              style={styles.nextButton}
              source={require('../assets/next-button.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnWrapper}>
            <Text style={styles.buttonTxt}>Support Centre</Text>
            <Image
              style={styles.nextButton}
              source={require('../assets/next-button.png')}
            />
          </TouchableOpacity>
          <ButtonText
            title="Log out"
            onPress={() => logout()}
            txtStyle={styles.logoutBtn}
            wrapperStyle={styles.logoutBtnWrapper}
            isLoading={isLoadingLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default ProfilePage;
