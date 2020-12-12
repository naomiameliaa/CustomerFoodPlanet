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
import {normalize} from '../utils';
import SpinnerKit from '../components/SpinnerKit';

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
    fontSize: 18,
    left: 0,
    paddingHorizontal: normalize(50),
    height: 40,
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
    width: '65%',
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
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

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
      setErrorMessage('Something went wrong');
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
            <FlatList
              data={listMenu}
              renderItem={({item, index}) => renderItem({item, index})}
              keyExtractor={(item) => item.menuId.toString()}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default ListMenu;
