import * as React from 'react';
import {
  Text,
  View,
  Image,
  FlatList,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {RNCamera} from 'react-native-camera';
import axios from 'axios';
import theme from '../theme';
import SpinnerKit from '../components/SpinnerKit';
import {getData, normalize, alertMessage, storeData, removeData} from '../utils';
import ButtonKit from '../components/ButtonKit';
import {AuthContext} from '../../context';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scene: {
    flex: 1,
    paddingHorizontal: normalize(20),
    marginVertical: normalize(5),
  },
  tabBarStyle: {
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  labelStyle: {
    fontWeight: 'bold',
    fontSize: normalize(16),
    textAlign: 'center',
  },
  orderContainer: {
    backgroundColor: theme.colors.white,
    marginVertical: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  fcNameStyle: {
    fontWeight: 'bold',
    color: theme.colors.red,
    fontSize: normalize(15),
    width: '75%',
  },
  fcNameDateWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 7,
  },
  txtStyle: {
    fontWeight: 'bold',
    fontSize: normalize(13),
    marginVertical: 5,
  },
  totalPerTenant: {
    fontWeight: 'bold',
    fontSize: normalize(13),
    marginVertical: 5,
    alignSelf: 'flex-end',
  },
  spinnerKitStyle: {
    marginTop: normalize(80),
  },
  emptyOrderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyOrderStyle: {
    width: normalize(220),
    height: normalize(220),
    marginTop: 0.15 * SCREEN_HEIGHT,
  },
  titleEmptyOrder: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    marginVertical: 10,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  innerContainer: {
    height: '100%',
  },
  qrCodeScanner: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: theme.colors.red_20,
    opacity: 0.8,
    bottom: normalize(10),
    borderWidth: 4,
    borderRadius: 10,
    padding: 7,
    alignSelf: 'flex-end',
  },
});

function OrderPage({navigation}) {
  const [isLoadingOngoing, setIsLoadingOngoing] = React.useState(false);
  const [isLoadingPast, setIsLoadingPast] = React.useState(false);
  const [ongoingOrder, setOngoingOrder] = React.useState([]);
  const [pastOrder, setPastOrder] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [index, setIndex] = React.useState(0);
  const {signOutGuest, signOut} = React.useContext(AuthContext);
  const [routes] = React.useState([
    {key: 'ongoing', title: 'Ongoing Order'},
    {key: 'past', title: 'Past Order'},
  ]);
  const [barcodes, setBarcodes] = React.useState(null);
  let camera;

  const renderStatus = (status) => {
    if (status === 'PROCESSING') {
      return 'Status: Processing your order';
    } else if (status === 'READY') {
      return 'Status: Your order is ready';
    } else if (status === 'PICKED_UP') {
      return 'Status: Order already picked-up';
    } else {
      return 'Status: Your order is complete';
    }
  };

  const renderDate = (dateTime) => {
    let i = 0;
    let dates = '';
    let spaces = 0;
    for (; i < dateTime.length; i++) {
      dates += dateTime[i];
      if (dateTime[i] === ' ') {
        spaces++;
        if (spaces === 2) {
          return dates;
        }
      }
    }
  };

  const renderPrice = (price) => {
    let i;
    let tempPrice = '';
    let ctr = 0;
    let stringPrice = price.toString();
    for (i = stringPrice.length - 1; i >= 0; i--) {
      tempPrice += stringPrice[i];
      ctr++;
      if (ctr === 3) {
        if (i > 1) {
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

  const renderOngoingOrder = ({item, idx}) => {
    return (
      <TouchableOpacity
        style={styles.orderContainer}
        key={idx}
        onPress={() =>
          navigation.navigate('Order Detail', {
            foodcourtName: item.foodcourtName,
            transactionDate: item.date,
            seatNum: item.seatNum,
            totalSeat: item.totalSeat,
            totalPrice: item.totalPrice,
            orderList: item.orderList,
          })
        }>
        <View style={styles.fcNameDateWrapper}>
          <Text style={styles.fcNameStyle} numberOfLines={1}>
            {item.foodcourtName}
          </Text>
          <Text>{renderDate(item.date)}</Text>
        </View>
        {item.orderList.map((itm, key) => {
          return (
            <View key={key}>
              <Text style={styles.txtStyle}>
                {`${itm.tenantName} (Order Number: ${itm.orderNum})`}
              </Text>
              <Text style={styles.itemStatusStyle}>
                {`${itm.items} items   ${renderStatus(itm.status)}`}
              </Text>
              <Text style={styles.totalPerTenant}>
                {`Total: Rp ${renderPrice(itm.subtotal)}`}
              </Text>
            </View>
          );
        })}
        <Text style={styles.txtStyle}>{`Seat Number : ${item.seatNum}`}</Text>
      </TouchableOpacity>
    );
  };

  const renderPastOrder = ({item, idx}) => {
    return (
      <TouchableOpacity
        style={styles.orderContainer}
        key={idx}
        onPress={() =>
          navigation.navigate('Order Detail', {
            foodcourtName: item.foodcourtName,
            transactionDate: item.date,
            seatNum: item.seatNum,
            totalSeat: item.totalSeat,
            totalPrice: item.totalPrice,
            orderList: item.orderList,
          })
        }>
        <View style={styles.fcNameDateWrapper}>
          <Text style={styles.fcNameStyle} numberOfLines={1}>
            {item.foodcourtName}
          </Text>
          <Text>{renderDate(item.date)}</Text>
        </View>
        {item.orderList.map((itm, key) => {
          return (
            <View key={key}>
              <Text style={styles.txtStyle}>
                {`${itm.tenantName} (Order Number: ${itm.orderNum})`}
              </Text>
              <Text style={styles.itemStatusStyle}>
                {`${itm.items} items   ${renderStatus(itm.status)}`}
              </Text>
              <Text style={styles.totalPerTenant}>
                {`Total: Rp ${renderPrice(itm.subtotal)}`}
              </Text>
            </View>
          );
        })}
        <Text style={styles.txtStyle}>{`Seat Number : ${item.seatNum}`}</Text>
      </TouchableOpacity>
    );
  };

  const OngoingOrder = () => (
    <View style={styles.scene}>
      {isLoadingOngoing ? (
        <SpinnerKit sizeSpinner="large" style={styles.spinnerKitStyle} />
      ) : (
        <View>
          {ongoingOrder.length === 0 ? (
            <View style={styles.emptyOrderContainer}>
              <Image
                source={require('../assets/dinner.png')}
                style={styles.emptyOrderStyle}
              />
              <Text style={styles.titleEmptyOrder}>
                There is No Ongoing Order
              </Text>
            </View>
          ) : (
            <React.Fragment>
              <ScrollView style={styles.innerContainer}>
                <FlatList
                  data={ongoingOrder}
                  renderItem={({item, idx}) => renderOngoingOrder({item, idx})}
                  keyExtractor={(item) => item.orderId.toString()}
                />
              </ScrollView>
              <ButtonKit
                source={require('../assets/qrcode-scanner.png')}
                onPress={() => navigation.navigate('QR Code Scanner')}
                wrapperStyle={styles.qrCodeScanner}
              />
            </React.Fragment>
          )}
        </View>
      )}
    </View>
  );

  const PastOrder = () => (
    <View style={styles.scene}>
      {isLoadingPast ? (
        <SpinnerKit sizeSpinner="large" style={styles.spinnerKitStyle} />
      ) : (
        <View>
          {pastOrder.length === 0 ? (
            <View style={styles.emptyOrderContainer}>
              <Image
                source={require('../assets/dinner.png')}
                style={styles.emptyOrderStyle}
              />
              <Text style={styles.titleEmptyOrder}>There is No Past Order</Text>
            </View>
          ) : (
            <React.Fragment>
              <ScrollView style={styles.innerContainer}>
                <FlatList
                  data={pastOrder}
                  renderItem={({item, idx}) => renderPastOrder({item, idx})}
                  keyExtractor={(item) => item.orderId.toString()}
                />
              </ScrollView>
              <ButtonKit
                source={require('../assets/qrcode-scanner.png')}
                onPress={() => navigation.navigate('QR Code Scanner')}
                wrapperStyle={styles.qrCodeScanner}
              />
            </React.Fragment>
          )}
        </View>
      )}
    </View>
  );

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

  function sessionTimedOut () {
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
      return dataUser.userId;
    } else {
      return dataGuest.userId;
    }
  };

  const renderScene = SceneMap({
    ongoing: OngoingOrder,
    past: PastOrder,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      style={styles.tabBarStyle}
      activeColor={theme.colors.red}
      inactiveColor={theme.colors.black}
      indicatorStyle={styles.tabBarStyle}
      labelStyle={styles.labelStyle}
    />
  );

  async function getOngoingOrder() {
    setIsLoadingOngoing(true);
    const userId = await checkUserGuest();
    try {
      const response = await axios.get(
        `https://food-planet.herokuapp.com/orders/user?userId=${userId}&status=PROCESSING&status=READY&status=PICKED_UP`,
      );
      if (response.data.msg === 'Query success') {
        setOngoingOrder(response.data.object);
      }
    } catch (error) {
      setErrorMessage('Something went wrong');
      if(error.response.status === 401) {
        sessionTimedOut();
      }
    }
    setIsLoadingOngoing(false);
  }

  async function getPastOrder() {
    setIsLoadingPast(true);
    const userId = await checkUserGuest();
    try {
      const response = await axios.get(
        `https://food-planet.herokuapp.com/orders/user?userId=${userId}&status=FINISHED`,
      );
      if (response.data.msg === 'Query success') {
        setPastOrder(response.data.object);
      }
    } catch (error) {
      setErrorMessage('Something went wrong');
      if(error.response.status === 401) {
        sessionTimedOut();
      }
    }
    setIsLoadingPast(false);
  }

  React.useEffect(() => {
    getOngoingOrder();
    getPastOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TabView
        renderTabBar={renderTabBar}
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={SCREEN_WIDTH}
      />
    </SafeAreaView>
  );
}
export default OrderPage;
