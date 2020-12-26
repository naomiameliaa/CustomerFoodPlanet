import * as React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import ButtonKit from '../components/ButtonKit';
import ButtonText from '../components/ButtonText';
import theme from '../theme';
import {normalize, getData, alertMessage, storeData, removeData} from '../utils';
import {AuthContext} from '../../context';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginHorizontal: 10,
    marginVertical: 25,
  },
  imageStyle: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  contentWrapper: {
    paddingHorizontal: 20,
  },
  namePriceWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameStyle: {
    fontSize: normalize(20),
    marginTop: 6,
    fontWeight: 'bold',
    width: SCREEN_WIDTH * 0.6,
  },
  priceStyle: {
    fontSize: normalize(20),
    marginTop: 6,
    fontWeight: 'bold',
  },
  descStyle: {
    fontSize: normalize(14),
    marginVertical: 6,
    color: theme.colors.dark_grey,
  },
  instructOptionalWrapper: {
    flexDirection: 'row',
    marginHorizontal: 2,
    marginVertical: 6,
    alignItems: 'center',
  },
  instructionStyle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginRight: normalize(16),
  },
  optionalStyle: {
    fontSize: normalize(14),
  },
  inputStyle: {
    backgroundColor: theme.colors.white,
    fontSize: normalize(16),
    height: 40,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusMinWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: normalize(20),
  },
  plusMinStyle: {
    width: 30,
    height: 30,
    marginHorizontal: 15,
    padding: 8,
    borderWidth: 0.5,
    borderRadius: 8,
    borderColor: theme.colors.grey,
  },
  quantityStyle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
  },
  buttonTxtStyle: {
    fontSize: 18,
    color: theme.colors.off_white,
    fontWeight: 'bold',
  },
  btnWrapperStyle: {
    padding: 16,
    backgroundColor: theme.colors.red,
    width: '70%',
    borderRadius: 30,
    marginBottom: 20,
    alignSelf: 'center',
  },
});

function DetailMenu({route, navigation}) {
  const [notes, onChangeNotes] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [qty, setQty] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const {signOutGuest, signOut} = React.useContext(AuthContext);
  const {
    menuId,
    menuName,
    menuPrice,
    menuDescription,
    menuImage,
    tenantId,
  } = route.params;

  function checkMinus() {
    if (qty > 0) {
      setQty(qty - 1);
    }
  }

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

  async function getCartData() {
    setIsLoading(true);
    const userId = await checkUserGuest();
    try {
      const response = await axios.get(
        'https://food-planet.herokuapp.com/cart',
        {
          params: {
            userId: userId,
          },
        },
      );
      if (response.data.msg === 'Get Cart Success') {
        const cartFilter = response.data.object.orderList.filter(
          (item) => item.tenantId === tenantId,
        );
        const menuListFilter = cartFilter[0].menuList.filter(
          (item) => item.menu.menuId === menuId,
        );
        if (menuListFilter.length !== 0) {
          setQty(menuListFilter[0].quantity);
          if (menuListFilter[0].notes !== 'null') {
            onChangeNotes(menuListFilter[0].notes);
          }
          setIsEdit(true);
        }
      }
    } catch (error) {
      setErrorMessage('Something went wrong');
      if(error.response.status === 401) {
        sessionTimedOut();
      }
    }
    setIsLoading(false);
  }

  async function editCart() {
    setIsLoading(true);
    const userId = await checkUserGuest();
    try {
      const response = await axios.put(
        `https://food-planet.herokuapp.com/cart/edit?userId=${userId}&menuId=${menuId}&quantity=${qty}&notes=${notes}`,
      );
      if (response.data.msg === 'Edit Cart Success') {
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Success edit cart',
          btnText: 'OK',
          onPressOK: () => navigation.goBack(),
          btnCancel: false,
        });
      }
    } catch (error) {
      if(error.response.status === 401) {
        sessionTimedOut();
      }else {
        alertMessage({
          titleMessage: 'Error',
          bodyMessage: 'Failed edit cart',
          btnText: 'Try Again',
          btnCancel: false,
        });
      }
    }
    setIsLoading(false);
  }

  async function addToCart() {
    setIsLoading(true);
    const userId = await checkUserGuest();
    try {
      const response = await axios.post(
        `https://food-planet.herokuapp.com/cart/add?userId=${userId}&menuId=${menuId}&quantity=${qty}&notes=${notes}`,
      );
      if (response.data.msg === 'Add to Cart Success') {
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Your order success add to cart',
          btnText: 'OK',
          onPressOK: () => navigation.goBack(),
          btnCancel: false,
        });
      }
    } catch (error) {
      if(error.response.status === 401) {
        sessionTimedOut();
      }else {
        alertMessage({
          titleMessage: 'Error',
          bodyMessage: 'Failed add to cart',
          btnText: 'Try Again',
          btnCancel: false,
        });
      }
    }
    setIsLoading(false);
  }

  function editOrAdd() {
    if (isEdit) {
      editCart();
    } else {
      addToCart();
    }
  }

  function checkEditAdd() {
    if (isEdit) {
      return 'Edit Cart';
    }
    return 'Add to Cart';
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

  async function removeFromCart() {
    setIsLoading(true);
    const userId = await checkUserGuest();

    try {
      const response = await axios.delete(
        'https://food-planet.herokuapp.com/cart/remove',
        {
          params: {
            userId: userId,
            menuId: menuId,
          },
        },
      );
      if (response.data.msg === 'Remove from Cart Success') {
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Your order success remove from cart',
          btnText: 'OK',
          onPressOK: () => navigation.goBack(),
          btnCancel: false,
        });
      }
    } catch (error) {
      if(error.response.status === 401) {
        sessionTimedOut();
      }else {
        alertMessage({
          titleMessage: 'Error',
          bodyMessage: 'Failed remove from cart',
          btnText: 'Try Again',
          btnCancel: false,
        });
      }
    }
    setIsLoading(false);
  }

  React.useEffect(() => {
    getCartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ButtonKit
        wrapperStyle={styles.backButton}
        source={require('../assets/back-button.png')}
        onPress={() => navigation.goBack()}
      />
      <Image
        source={{uri: `data:image/jpeg;base64,${menuImage}`}}
        style={styles.imageStyle}
        resizeMode="cover"
      />
      <View style={styles.contentWrapper}>
        <View style={styles.namePriceWrapper}>
          <Text style={styles.nameStyle} numberOfLines={1}>
            {menuName}
          </Text>
          <Text style={styles.priceStyle}>{renderPrice(menuPrice)}</Text>
        </View>
        <Text style={styles.descStyle} numberOfLines={3}>
          {menuDescription}
        </Text>
        <View style={styles.instructOptionalWrapper}>
          <Text style={styles.instructionStyle}>Special Instruction</Text>
          <Text style={styles.optionalStyle}>Optional</Text>
        </View>
        <TextInput
          style={styles.inputStyle}
          onChangeText={(text) => onChangeNotes(text)}
          value={notes}
          textContentType="none"
          placeholder="E.g. No Chili, please"
        />
        <View style={styles.plusMinWrapper}>
          <ButtonKit
            wrapperStyle={styles.plusMinStyle}
            source={require('../assets/minus-button.png')}
            onPress={checkMinus}
            disabled={qty === 0 ? true : false}
          />
          <Text style={styles.quantityStyle}>{qty}</Text>
          <ButtonKit
            wrapperStyle={styles.plusMinStyle}
            source={require('../assets/plus-button.png')}
            onPress={() => setQty(qty + 1)}
          />
        </View>
        <ButtonText
          title={qty > 0 ? checkEditAdd() : 'Remove'}
          txtStyle={styles.buttonTxtStyle}
          wrapperStyle={styles.btnWrapperStyle}
          onPress={qty > 0 ? editOrAdd : removeFromCart}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}
export default DetailMenu;
