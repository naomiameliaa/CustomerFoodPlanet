import * as React from 'react';
import {
  Text,
  View,
  FlatList,
  SafeAreaView,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import axios from 'axios';
import Title from '../components/Title';
import {getData, normalize} from '../utils';
import theme from '../theme';
import SpinnerKit from '../components/SpinnerKit';
import ButtonKit from '../components/ButtonKit';

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
});

function HomePage({navigation}) {
  const [listFoodCourt, setListFoodCourt] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

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
      setErrorMessage('Something went wrong');
      console.log('error:', error);
    }
    setIsLoading(false);
  }

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
        }}>
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
          />
        </View>
      </TouchableOpacity>
    );
  };

  React.useEffect(() => {
    getListFoodCourt();
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
      {/* <Button title="Test" onPress={getListFoodCourt} /> */}
    </SafeAreaView>
  );
}
export default HomePage;
