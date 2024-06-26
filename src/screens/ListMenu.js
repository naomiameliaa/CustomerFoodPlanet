import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import ButtonKit from '../components/ButtonKit';
import theme from '../theme';
import {
  normalize,
  alertMessage,
  getData,
  storeData,
  removeData,
  deleteFcmToken,
} from '../utils';
import SpinnerKit from '../components/SpinnerKit';
import {AuthContext} from '../../context';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    justifyContent: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    marginHorizontal: normalize(20),
  },
  iconSearch: {
    height: 20,
    width: 20,
    marginVertical: normalize(10),
    marginRight: -normalize(35),
    zIndex: 1,
  },
  inputStyle: {
    width: SCREEN_WIDTH * 0.8,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    fontSize: normalize(18),
    left: 0,
    paddingHorizontal: normalize(50),
    paddingVertical: 'auto',
    height: normalize(42),
  },
  contentWrapper: {
    paddingHorizontal: 20,
  },
  imageStyle: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.3,
  },
  titleStyle: {
    fontSize: normalize(24),
    marginTop: 10,
    fontWeight: 'bold',
  },
  spinnerKitStyle: {
    marginTop: normalize(80),
  },
  categoryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  notFoundWrapper: {
    height: 0.38 * SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoNotFound: {
    width: 100,
    height: 100,
  },
  notFound: {
    color: theme.colors.red,
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginTop: 20,
  },
  categoryTenant: {
    fontSize: normalize(16),
  },
  boxContainer: {
    marginBottom: normalize(10),
    flexDirection: 'row',
    borderRadius: 10,
    paddingBottom: 10,
    borderBottomColor: theme.colors.grey,
    borderBottomWidth: 1,
  },
  imgMenuStyle: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 10,
  },
  titleMenu: {
    fontWeight: 'bold',
    marginBottom: normalize(4),
    width: '58%',
  },
  descMenu: {
    color: theme.colors.dark_grey,
  },
  menuContent: {
    flex: 1,
    flexDirection: 'column',
    paddingVertical: 5,
    justifyContent: 'space-between',
  },
  namePriceWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceStyle: {
    marginHorizontal: 5,
    fontWeight: 'bold',
  },
});

function ListMenu({route, navigation}) {
  const [searchWord, onChangeSearchWord] = React.useState('');
  const {tenantId, tenantName, tenantImg, tenantCategory} = route.params;
  const [listMenu, setListMenu] = React.useState([]);
  const [listMenuSearch, setListMenuSearch] = React.useState([]);
  const [isSearchResultEmpty, setSearchResultEmpty] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const {signOutGuest, signOut} = React.useContext(AuthContext);

  const logout = async () => {
    await deleteFcmToken();
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

  const renderBullet = (key, length) => {
    if (key < length - 1) {
      return <Text>&#8226;</Text>;
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

  async function getListMenu() {
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://food-planet.herokuapp.com/menu/tenant',
        {
          params: {
            tenantId: tenantId,
          },
        },
      );
      if (response.data.msg === 'Query success') {
        setListMenu(response.data.object);
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 401) {
        sessionTimedOut();
      }
    }
    setIsLoading(false);
  }

  async function searching() {
    try {
      const response = await axios.get(
        `https://food-planet.herokuapp.com/menu/searchByName?name=${searchWord}`,
      );
      if (response.data.msg === 'Query success') {
        setListMenuSearch(response.data.object);
      }
    } catch (error) {
      setSearchResultEmpty(true);
    }
    setIsLoading(false);
  }

  const renderItem = ({item, index}) => {
    const price = parseInt(item.price, 10);
    return (
      <TouchableOpacity
        style={styles.boxContainer}
        onPress={() =>
          navigation.navigate('Detail Menu', {
            menuId: item.menuId,
            menuName: item.name,
            menuPrice: item.price,
            menuDescription: item.description,
            menuImage: item.image,
            tenantId: tenantId,
          })
        }>
        <Image
          style={styles.imgMenuStyle}
          source={{uri: `data:image/jpeg;base64,${item.image}`}}
          resizeMode="cover"
        />
        <View style={styles.menuContent}>
          <View style={styles.namePriceWrapper}>
            <Text style={styles.titleMenu} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.priceStyle}>{`Rp ${renderPrice(price)}`}</Text>
          </View>
          <Text style={styles.descMenu} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  React.useEffect(() => {
    getListMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (searchWord.length > 0) {
      const delayDebounceFn = setTimeout(() => {
        setIsLoading(true);
        searching();
      }, 1000);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResultEmpty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchWord]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ButtonKit
          wrapperStyle={styles.backButton}
          source={require('../assets/back-button.png')}
          onPress={() => navigation.navigate('List Tenant')}
        />
        <View style={styles.searchWrapper}>
          <Image
            style={styles.iconSearch}
            source={require('../assets/search.png')}
            resizeMode="contain"
          />
          <TextInput
            style={styles.inputStyle}
            onChangeText={(text) => onChangeSearchWord(text)}
            value={searchWord}
            placeholder="Search"
          />
        </View>
      </View>
      <ScrollView>
        <Image
          source={{uri: `data:image/jpeg;base64,${tenantImg}`}}
          style={styles.imageStyle}
          resizeMode="cover"
        />
        <View style={styles.contentWrapper}>
          <Text style={styles.titleStyle}>{tenantName}</Text>
          <View style={styles.categoryWrapper}>
            {tenantCategory.map((item, key) => (
              <Text style={styles.categoryTenant} key={key}>
                {item}
                {renderBullet(key, tenantCategory.length)}
              </Text>
            ))}
          </View>
          {isLoading ? (
            <SpinnerKit sizeSpinner="large" style={styles.spinnerKitStyle} />
          ) : (
            <View>
              {isSearchResultEmpty ? (
                <View style={styles.notFoundWrapper}>
                  <Image
                    source={require('../assets/page-not-found.png')}
                    style={styles.logoNotFound}
                  />
                  <Text style={styles.notFound}>Menu not found</Text>
                </View>
              ) : (
                <FlatList
                  data={searchWord.length > 0 ? listMenuSearch : listMenu}
                  renderItem={({item, index}) => renderItem({item, index})}
                  keyExtractor={(item) => item.menuId.toString()}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default ListMenu;
