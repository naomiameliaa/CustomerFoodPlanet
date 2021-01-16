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
  spinner: {
    marginTop: 80,
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
  editButtonDisabled: {
    width: '80%',
    height: '80%',
    opacity: 0.3,
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
    if (dataUser !== null) {
      return 'member';
    } else {
      return 'guest';
    }
  };

  const logoutUserGuest = async () => {
    const dataUser = await getDataUser();
    const dataGuest = await getDataGuest();
    if (dataUser !== null) {
      await removeData('userData');
      signOut();
    } else {
      const dataGuestUpdated = {
        ...dataGuest,
        isLogin: false,
      };
      await storeData('guestData', dataGuestUpdated);
      signOutGuest(dataGuest);
    }
  };

  const getUserId = async () => {
    const dataUser = await getDataUser();
    const dataGuest = await getDataGuest();
    if (dataUser !== null) {
      return dataUser.userId;
    } else {
      return dataGuest.userId;
    }
  };

  async function getUserGuestProfile() {
    setIsLoadingLogin(true);
    await getProfile();
    await getUserGuestData();
    setIsLoadingLogin(false);
  }

  async function getUserGuestData() {
    const userId = await getUserId();
    const typeUser = await checkUserGuest();
    try {
      const response = await axios.get(
        `https://food-planet.herokuapp.com/users/searchById?userId=${userId}`,
      );
      if (response.data.msg === 'Query success') {
        await storeData(
          typeUser === 'member' ? 'userData' : 'guestData',
          response.data.object,
        );
        setDataUserGuest(response.data.object);
      }
    } catch (error) {
      if (error.response.data.status === 401) {
        sessionTimedOut();
      }
    }
  }

  async function logout() {
    setisLoadingLogout(true);
    try {
      const response = await axios.post(
        'https://food-planet.herokuapp.com/users/logout',
      );
      if (response.data.object === 'Logout success') {
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Logout success!',
          btnText: 'OK',
          onPressOK: () => logoutUserGuest(),
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
      onPressOK: () => logoutUserGuest(),
      btnCancel: false,
    });
  }

  async function getProfile() {
    const userId = await getUserId();
    try {
      const response = await axios.get(
        `https://food-planet.herokuapp.com/users/profile?userId=${userId}`,
      );
      if (response.data.msg === 'Query success') {
        setDataProfile(response.data.object);
      }
    } catch (error) {
      if (error.response.data.status === 401) {
        sessionTimedOut();
      }
    }
  }

  const renderPrice = (price) => {
    if (price === undefined || price === null) {
      return;
    }
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

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getUserGuestProfile();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {isLoadingLogin ? (
          <SpinnerKit sizeSpinner="large" style={styles.spinner} />
        ) : (
          <>
            <View style={styles.profileWrapper}>
              <Image
                style={styles.profileImg}
                source={require('../assets/profile-user.png')}
              />
              <View style={styles.identityWrapper}>
                <Text style={styles.identityName} numberOfLines={1}>
                  {dataProfile.fullname ? dataProfile.fullname : 'Guest'}
                </Text>
                <Text style={styles.numEmailIdentity}>
                  {dataProfile.phoneNumber}
                </Text>
                <Text style={styles.numEmailIdentity} numberOfLines={1}>
                  {dataUserGuest.email}
                </Text>
              </View>
              <View style={styles.editBtnWrapper}>
                <ButtonKit
                  btnStyle={
                    dataUserGuest.isGuest
                      ? styles.editButtonDisabled
                      : styles.editButton
                  }
                  source={require('../assets/edit.png')}
                  onPress={() =>
                    navigation.navigate('Edit Profile', {
                      full_name: dataProfile.fullname,
                      phone_num: dataProfile.phoneNumber,
                      getProfile: getProfile,
                    })
                  }
                  disabled={dataUserGuest.isGuest ? true : false}
                />
              </View>
            </View>
            {dataUserGuest?.balance !== null && dataUserGuest?.point !== null && (
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
              {dataUserGuest.isGuest && (
                <TouchableOpacity
                  style={styles.btnWrapper}
                  onPress={() => navigation.navigate('Register Member')}>
                  <Text style={styles.buttonTxt}>Register as Member</Text>
                  <Image
                    style={styles.nextButton}
                    source={require('../assets/next-button.png')}
                  />
                </TouchableOpacity>
              )}
              {!dataUserGuest.isGuest && (
                <TouchableOpacity
                  style={styles.btnWrapper}
                  onPress={() => navigation.navigate('Change Email')}>
                  <Text style={styles.buttonTxt}>Change Email</Text>
                  <Image
                    style={styles.nextButton}
                    source={require('../assets/next-button.png')}
                  />
                </TouchableOpacity>
              )}
              {!dataUserGuest.isGuest && (
                <TouchableOpacity
                  style={styles.btnWrapper}
                  onPress={() => navigation.navigate('Change Password')}>
                  <Text style={styles.buttonTxt}>Change Password</Text>
                  <Image
                    style={styles.nextButton}
                    source={require('../assets/next-button.png')}
                  />
                </TouchableOpacity>
              )}
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
export default ProfilePage;
