import * as React from 'react';
import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import axios from 'axios';
import Title from '../components/Title';
import {
  getData,
  normalize,
  storeData,
  alertMessage,
  removeData,
} from '../utils';
import theme from '../theme';
import SpinnerKit from '../components/SpinnerKit';
import ButtonKit from '../components/ButtonKit';
import ButtonText from '../components/ButtonText';
import {AuthContext} from '../../context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: normalize(30),
    marginBottom: normalize(80),
    paddingHorizontal: normalize(15),
  },
  boxContainer: {
    height: normalize(220),
    marginBottom: normalize(10),
  },
  scrollVertical: {
    width: '100%',
  },
  titleContainer: {
    width: '100%',
  },
  titleStyle1: {
    marginBottom: 0,
    fontWeight: 'normal',
  },
  imgStyle: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  titleFoodCourt: {
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
  hourWrapper: {
    flexDirection: 'row',
  },
  openTxt: {
    color: theme.colors.light_green,
    fontWeight: 'bold',
    fontSize: normalize(15),
  },
  closeTxt: {
    color: theme.colors.red,
    fontWeight: 'bold',
    fontSize: normalize(15),
  },
  hourStyle: {
    fontWeight: 'bold',
    fontSize: normalize(14),
    marginLeft: normalize(12),
  },
  spinnerKitStyle: {
    marginTop: normalize(80),
  },
  spinnerKitStyleModal: {
    margin: 0,
    flex: 0,
  },
  horizontalWrapper: {
    flexDirection: 'row',
  },
  detailContainer: {
    width: '90%',
  },
  infoIcon: {
    width: 20,
    height: 20,
  },
  buttonTxtStyle: {
    fontSize: 14,
    color: theme.colors.off_white,
    fontWeight: 'bold',
  },
  btnWrapperStyle: {
    padding: 5,
    backgroundColor: theme.colors.red,
    width: '45%',
    borderRadius: 10,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
});

const stylesModal = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '80%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  btnTextStyle: {
    color: theme.colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: normalize(18),
  },
  btnClose: {
    backgroundColor: theme.colors.red,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 25,
  },
  contentContainer: {
    marginBottom: 30,
  },
  horizontalWrapper: {
    flexDirection: 'row',
  },
  titleStyle: {
    width: '50%',
    fontWeight: 'bold',
    fontSize: normalize(18),
    textAlign: 'center',
    paddingVertical: 5,
  },
  textStyle: {
    width: '50%',
    fontSize: normalize(16),
    textAlign: 'center',
    paddingVertical: 2,
    borderWidth: 0.2,
    borderColor: theme.colors.black,
  },
});

function HomePage({navigation}) {
  const [listFoodCourt, setListFoodCourt] = React.useState([]);
  const [seatAvailability, setSeatAvailability] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = React.useState(
    false,
  );
  const {signOutGuest, signOut} = React.useContext(AuthContext);

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

  async function getListFoodCourt() {
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://food-planet.herokuapp.com/foodcourts',
      );
      if (response.data.msg === 'Query success') {
        setListFoodCourt(response.data.object);
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 401) {
        sessionTimedOut();
      }
    }
    setIsLoading(false);
  }

  async function getAvailableSeat(foodcourtId) {
    setIsLoadingAvailability(true);
    try {
      const response = await axios.get(
        `https://food-planet.herokuapp.com/foodcourts/availableSeat?foodcourtId=${foodcourtId}`,
      );
      if (response.data.msg === 'Query success') {
        setSeatAvailability(response.data.object);
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 401) {
        sessionTimedOut();
      }
    }
    setIsLoadingAvailability(false);
  }

  const checkAvailableSeat = (foodcourtId) => {
    setModalVisible(true);
    getAvailableSeat(foodcourtId);
  };

  const renderItem = ({item, index}) => {
    const time = new Date();
    const day = time.getDay();
    const hour = time.getHours();
    const minute = time.getMinutes();

    const convertHourMinute = (dataHour, status) => {
      const splitDataHour = dataHour.split(':');
      if (status === 'hour') {
        return parseInt(splitDataHour[0], 10);
      } else if (status === 'minute') {
        return parseInt(splitDataHour[1], 10);
      }
    };
    const result = item.openingHourList.filter(
      (itm) =>
        parseInt(itm.day, 10) === day &&
        (hour === convertHourMinute(itm.openHour, 'hour') ||
          hour >= convertHourMinute(itm.openHour, 'hour')) &&
        (hour === convertHourMinute(itm.closeHour, 'hour') ||
          hour < convertHourMinute(itm.closeHour, 'hour')),
    );

    return (
      <TouchableOpacity
        style={styles.boxContainer}
        onPress={() => {
          navigation.navigate('List Tenant', {
            foodcourtId: item.foodcourtId,
            foodcourtName: item.name,
          });
        }}
        disabled={result.length > 0 ? false : true}>
        <Image
          style={styles.imgStyle}
          source={{uri: `data:image/jpeg;base64,${item.image}`}}
          resizeMode="cover"
        />
        <View style={styles.horizontalWrapper}>
          <View style={styles.detailContainer}>
            <Text style={styles.titleFoodCourt}>{item.name}</Text>
            <View style={styles.hourWrapper}>
              {result.length > 0 ? (
                <Text style={styles.openTxt}>Open Now</Text>
              ) : (
                <Text style={styles.closeTxt}>Closed</Text>
              )}

              <Text style={styles.hourStyle}>
                {item.openingHourList[0].openHour}
                {'-'}
                {item.openingHourList[0].closeHour}
              </Text>
            </View>
          </View>
          <ButtonKit
            wrapperStyle={styles.infoIcon}
            source={require('../assets/info.png')}
            onPress={() =>
              navigation.navigate('Detail Foodcourt', {
                foodcourtImage: item.image,
                foodcourtName: item.name,
                foodcourtDesc: item.description,
                foodcourtLoc: item.address,
                foodcourtHourList: item.openingHourList,
              })
            }
            disabled={result.length > 0 ? false : true}
          />
        </View>
        <ButtonText
          title="Check Availability Seats"
          txtStyle={styles.buttonTxtStyle}
          wrapperStyle={styles.btnWrapperStyle}
          onPress={() => checkAvailableSeat(item.foodcourtId)}
          disabled={result.length > 0 ? false : true}
        />
      </TouchableOpacity>
    );
  };

  React.useEffect(() => {
    getListFoodCourt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Title text="Find your" txtStyle={styles.titleStyle1} />
        <Title text="Food Court" txtStyle={styles.titleStyle2} />
      </View>
      <View style={styles.scrollVertical}>
        {isLoading ? (
          <SpinnerKit sizeSpinner="large" style={styles.spinnerKitStyle} />
        ) : (
          <FlatList
            data={listFoodCourt}
            renderItem={({item, index}) => renderItem({item, index})}
            keyExtractor={(item) => item.foodcourtId.toString()}
          />
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}>
        <View style={stylesModal.centeredView}>
          <View style={stylesModal.modalView}>
            {isLoadingAvailability ? (
              <SpinnerKit
                sizeSpinner="large"
                style={styles.spinnerKitStyleModal}
              />
            ) : (
              <View style={stylesModal.contentContainer}>
                <View style={stylesModal.horizontalWrapper}>
                  <Text style={stylesModal.titleStyle}>Type Seat</Text>
                  <Text style={stylesModal.titleStyle}>Total Seat</Text>
                </View>
                {Object.keys(seatAvailability).map(function (key, index) {
                  return (
                    <View style={stylesModal.horizontalWrapper} key={key}>
                      <Text style={stylesModal.textStyle}>{key} (person)</Text>
                      <Text style={stylesModal.textStyle}>
                        {seatAvailability[key]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
            <ButtonText
              title="Close"
              txtStyle={stylesModal.btnTextStyle}
              wrapperStyle={stylesModal.btnClose}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
export default HomePage;
