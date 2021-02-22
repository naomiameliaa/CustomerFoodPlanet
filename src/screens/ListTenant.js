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
import Title from '../components/Title';
import theme from '../theme';
import {
  getData,
  normalize,
  alertMessage,
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
  contentContainer: {
    paddingHorizontal: normalize(30),
  },
  notFoundWrapper: {
    height: 0.55 * SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoNotFound: {
    width: 130,
    height: 130,
  },
  notFound: {
    color: theme.colors.red,
    fontSize: normalize(20),
    fontWeight: 'bold',
    marginTop: 20,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  category: {
    marginRight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgCategoryWrapper: {
    backgroundColor: theme.colors.white,
    borderRadius: 50,
    padding: 10,
  },
  imgCategory: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  categoryName: {
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  categoryNameChoose: {
    fontWeight: 'bold',
    color: theme.colors.red,
  },
  boxContainer: {
    marginBottom: normalize(20),
  },
  titleStyle: {
    fontSize: normalize(24),
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
  imgTenantStyle: {
    width: '100%',
    height: 180,
    marginBottom: 10,
  },
  titleTenant: {
    fontWeight: 'bold',
    fontSize: normalize(16),
    marginBottom: normalize(4),
  },
  spinnerKitStyle: {
    marginTop: normalize(80),
  },
  ratingIcon: {
    width: 14,
    height: 14,
    marginHorizontal: 2,
  },
  ratingNumber: {
    marginRight: 5,
  },
  ratingCategoryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

function ListTenant({route, navigation}) {
  const [listTenants, setListTenants] = React.useState([]);
  const [listTenantsSearch, setListTenantsSearch] = React.useState([]);
  const [listCategory, setListCategory] = React.useState([]);
  const [filterCategory, setFilterCategory] = React.useState('');
  const [searchWord, onChangeSearchWord] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSearchResultEmpty, setSearchResultEmpty] = React.useState(false);
  const {foodcourtId, foodcourtName} = route.params;
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

  const checkCategory = (category) => {
    if (filterCategory === category) {
      setFilterCategory('');
      getListTenants();
    } else {
      setFilterCategory(category);
      getListTenantsByCategory(category);
    }
  };

  async function getListTenantsByCategory(category) {
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://food-planet.herokuapp.com/tenants/foodcourt/category',
        {
          params: {
            foodcourtId: foodcourtId,
            category: category,
          },
        },
      );
      if (response.data.msg === 'Query success') {
        setListTenants(response.data.object);
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 401) {
        sessionTimedOut();
      }
    }
    setIsLoading(false);
  }

  async function getListTenants() {
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://food-planet.herokuapp.com/tenants/foodcourt',
        {
          params: {
            foodcourtId: foodcourtId,
          },
        },
      );
      if (response.data.msg === 'Query success') {
        setListTenants(response.data.object);
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 401) {
        sessionTimedOut();
      }
    }
    setIsLoading(false);
  }

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        style={styles.boxContainer}
        onPress={() => {
          navigation.navigate('List Menu', {
            tenantId: item.tenantId,
            tenantName: item.name,
            tenantImg: item.image,
            tenantCategory: item.category,
          });
        }}>
        <Image
          style={styles.imgTenantStyle}
          source={{uri: `data:image/jpeg;base64,${item.image}`}}
          resizeMode="cover"
        />
        <Text style={styles.titleTenant}>{item.name}</Text>
        <View style={styles.ratingCategoryWrapper}>
          <Image
            source={require('../assets/star.png')}
            style={styles.ratingIcon}
          />
          <Text style={styles.ratingNumber}>
            {parseFloat(item.rating).toFixed(1)}
          </Text>
          {item.category.map((value, key) => (
            <Text key={key}>
              {value}
              {renderBullet(key, item.category.length)}
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderItemCategory = ({item, index}) => {
    return (
      <TouchableOpacity
        style={styles.category}
        key={index}
        onPress={() => {
          checkCategory(item.categoryId);
        }}>
        <View style={styles.imgCategoryWrapper}>
          <Image
            source={{uri: `data:image/jpeg;base64,${item.image}`}}
            style={styles.imgCategory}
            resizeMode="contain"
          />
        </View>
        <Text
          style={
            filterCategory === item.categoryId
              ? styles.categoryNameChoose
              : styles.categoryName
          }>
          {item.categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  async function getListCategory() {
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://food-planet.herokuapp.com/foodcourts/allCategory',
        {
          params: {
            foodcourtId: foodcourtId,
          },
        },
      );
      if (response.data.msg === 'Query success') {
        setListCategory(response.data.object);
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
        `https://food-planet.herokuapp.com/tenants/searchByName?name=${searchWord}`,
      );
      if (response.data.msg === 'Query success') {
        setListTenantsSearch(response.data.object);
      }
    } catch (error) {
      setSearchResultEmpty(true);
    }
    setIsLoading(false);
  }

  React.useEffect(() => {
    getListCategory();
    getListTenants();
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
          onPress={() => navigation.navigate('Home')}
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
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Title
          text={`What would you like to eat at ${foodcourtName}?`}
          txtStyle={styles.titleStyle}
        />
        <FlatList
          data={listCategory}
          renderItem={({item, index}) => renderItemCategory({item, index})}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        />
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
                <Text style={styles.notFound}>Tenant not found</Text>
              </View>
            ) : (
              <FlatList
                data={searchWord.length > 0 ? listTenantsSearch : listTenants}
                renderItem={({item, index}) => renderItem({item, index})}
                keyExtractor={(item) => item.tenantId.toString()}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
export default ListTenant;
