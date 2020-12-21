import * as React from 'react';
import {
  Text,
  View,
  TextInput,
  SafeAreaView,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import Title from '../components/Title';
import SpinnerKit from '../components/SpinnerKit';
import {normalize, getData, alertMessage, storeData} from '../utils';
import ButtonText from '../components/ButtonText';
import RadioButton from '../components/RadioButton';
import theme from '../theme';
import {AuthContext} from '../../context';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: normalize(20),
    marginVertical: normalize(30),
  },
  title: {
    fontSize: normalize(26),
  },
  subTitleStyle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginTop: normalize(10),
    marginRight: 8,
  },
  menuDetailContainer: {
    width: '100%',
    marginVertical: normalize(5),
  },
  menuDetailWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  menuQtyStyle: {
    width: 0.12 * SCREEN_WIDTH,
    fontSize: normalize(14),
  },
  menuNameStyle: {
    width: 0.6 * SCREEN_WIDTH,
    fontSize: normalize(14),
  },
  menuPriceStyle: {
    width: 0.33 * SCREEN_WIDTH,
    fontSize: normalize(14),
  },
  editButton: {
    marginLeft: 0.12 * SCREEN_WIDTH,
    color: theme.colors.dark_grey,
    alignSelf: 'flex-start',
  },
  inputStyle: {
    borderColor: theme.colors.black,
    borderWidth: 1,
    width: 0.12 * SCREEN_WIDTH,
    height: normalize(20),
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: normalize(14),
  },
  horizontalWrapper: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  buttonOrderStyle: {
    fontSize: 18,
    color: theme.colors.off_white,
    fontWeight: 'bold',
  },
  orderWrapperStyle: {
    padding: 16,
    backgroundColor: theme.colors.red,
    width: '70%',
    borderRadius: 30,
    marginTop: normalize(60),
    alignSelf: 'center',
  },
  cartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartStyle: {
    width: normalize(220),
    height: normalize(220),
    marginTop: 0.15 * SCREEN_HEIGHT,
  },
  titleEmptyCart: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    marginVertical: 10,
  },
  contentEmptyCart: {
    width: 0.5 * SCREEN_WIDTH,
    textAlign: 'center',
  },
  seatWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});

const options = [
  {
    key: 'digitalPay',
    text: 'Digital Payment',
  },
];

function CartPage({navigation}) {
  const [cartData, setCartData] = React.useState(null);
  const [value, setValue] = React.useState(null);
  const [seatCapacity, onChangeSeatCapacity] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const {signOutGuest, signOut} = React.useContext(AuthContext);

  const logout = async () => {
    const dataGuest = await getData('guestData');
    const dataGuestUpdated = {
      ...dataGuest,
      isLogin: false,
    };
    storeData('guestData', dataGuestUpdated);
    await signOutGuest(dataGuestUpdated);
  };

  const sessionTimedOut = async () => {
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

  async function getCartData() {
    setIsLoading(true);
    const userId = await checkUserGuest();
    try {
      const response = await axios.get(
        `https://food-planet.herokuapp.com/cart?userId=${userId}`,
      );
      if (response.data.msg === 'Get Cart Success') {
        setCartData(response.data.object);
      }
    } catch (error) {
      setErrorMessage('Something went wrong');
      if(error.response.status === 401) {
        await sessionTimedOut();
      }
    }
    setIsLoading(false);
  }

  const validationOrder = () => {
    if (seatCapacity.length === 0 || seatCapacity === 0 || value === null) {
      alertMessage({
        titleMessage: 'Warning !',
        bodyMessage: 'Seat Capacity & Payment must be filled',
        btnText: 'Try Again',
        btnCancel: false,
      });
    } else if (seatCapacity > 10) {
      alertMessage({
        titleMessage: 'Warning !',
        bodyMessage: 'Max Seat Capacity 10',
        btnText: 'OK',
        btnCancel: false,
      });
    } else {
      order();
      setCartData(null);
    }
  };

  const onClickRadio = (id) => {
    setValue(id);
  };

  async function order() {
    setIsLoading(true);
    const userId = await checkUserGuest();
    try {
      const response = await axios.post(
        `https://food-planet.herokuapp.com/orders/generate?userId=${userId}&totalSeat=${seatCapacity}`,
      );
      if (response.data.msg === 'Create order success') {
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Your order is being processed',
          btnText: 'OK',
          onPressOK: () => navigation.navigate('Order'),
          btnCancel: false,
        });
      }
    } catch (error) {
      if(error.response.status === 401) {
        await sessionTimedOut();
      }else {
        alertMessage({
          titleMessage: 'Error',
          bodyMessage: 'Failed create order, Please try again!',
          btnText: 'Try Again',
          btnCancel: false,
        });
      }
    }
    setIsLoading(false);
  }

  const renderItem = ({item, index}) => {
    return (
      <View>
        <Text style={styles.subTitleStyle}>{item.tenantName}</Text>
        <View style={styles.menuDetailContainer}>
          {item.menuList.map((itm, key) => {
            return (
              <View key={key}>
                <View style={styles.menuDetailWrapper}>
                  <Text style={styles.menuQtyStyle}>{`${itm.quantity}x`}</Text>
                  <Text style={styles.menuNameStyle} numberOfLines={1}>
                    {itm.menu.name}
                  </Text>
                  <Text style={styles.menuPriceStyle}>
                    {renderPrice(itm.menu.price)}
                  </Text>
                </View>
                <ButtonText
                  title="Edit"
                  txtStyle={styles.editButton}
                  onPress={() => {
                    navigation.navigate('Home', {
                      screen: 'Detail Menu',
                      params: {
                        menuId: itm.menu.menuId,
                        menuName: itm.menu.name,
                        menuPrice: itm.menu.price,
                        menuDescription: itm.menu.description,
                        menuImage: itm.menu.image,
                        tenantId: itm.menu.tenantId,
                      },
                    });
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  React.useEffect(
    () => {
      getCartData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <SpinnerKit sizeSpinner="large" />
      ) : (
        <View>
          {cartData === null ? (
            <View style={styles.cartContainer}>
              <Image
                source={require('../assets/empty-cart.png')}
                style={styles.emptyCartStyle}
              />
              <Text style={styles.titleEmptyCart}>Your cart is empty</Text>
              <Text style={styles.contentEmptyCart}>
                Make your cart happy and make some order
              </Text>
            </View>
          ) : (
            <View>
              <Title text="My Cart" txtStyle={styles.title} />
              <FlatList
                data={cartData.orderList}
                renderItem={({item, index}) => renderItem({item, index})}
                keyExtractor={(item) => item.tenantId.toString()}
              />
              <View style={styles.horizontalWrapper}>
                <View style={styles.seatWrapper}>
                  <Text style={styles.subTitleStyle}>Seat Capacity</Text>
                  <Text>(max. 10)</Text>
                </View>
                <TextInput
                  style={styles.inputStyle}
                  onChangeText={(text) => onChangeSeatCapacity(text)}
                  value={seatCapacity}
                  textContentType="none"
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="right"
                />
              </View>
              <Text style={styles.subTitleStyle}>Payment Method</Text>
              <RadioButton
                options={options}
                onClick={onClickRadio}
                value={value}
              />
              <View style={styles.horizontalWrapper}>
                <Text style={styles.subTitleStyle}>Total Pay (incl. tax)</Text>
                <Text style={styles.subTitleStyle}>
                  {renderPrice(cartData.totalPrice)}
                </Text>
              </View>
              <ButtonText
                title="Place Order"
                txtStyle={styles.buttonOrderStyle}
                wrapperStyle={styles.orderWrapperStyle}
                isLoading={isLoading}
                onPress={validationOrder}
              />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
export default CartPage;