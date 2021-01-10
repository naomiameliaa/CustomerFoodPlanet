import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import ButtonKit from '../components/ButtonKit';
import Title from '../components/Title';
import {normalize} from '../utils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginHorizontal: 10,
    marginVertical: 25,
  },
  contentContainer: {
    marginHorizontal: 12,
    marginVertical: 12,
  },
  imageStyle: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  nameStyle: {
    fontSize: normalize(22),
  },
  contentDetailContainer: {
    marginHorizontal: 10,
  },
  horizontalWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 20,
  },
  contentTitle: {
    fontWeight: 'bold',
    width: '33%',
  },
  contentDetail: {
    width: '60%',
  },
  dayStyle: {
    fontWeight: 'bold',
    width: '49%',
  },
});

function FoodcourtDetail({route, navigation}) {
  const {
    foodcourtImage,
    foodcourtName,
    foodcourtDesc,
    foodcourtLoc,
    foodcourtHourList,
  } = route.params;

  const checkDay = (day) => {
    switch (day) {
      case '1':
        return 'Monday';
      case '2':
        return 'Tuesday';
      case '3':
        return 'Wednesday';
      case '4':
        return 'Thursday';
      case '5':
        return 'Friday';
      case '6':
        return 'Saturday';
      case '7':
        return 'Sunday';
      default:
        return null;
    }
  };

  const renderItem = ({item, index}) => {
    return (
      <View style={styles.horizontalWrapper}>
        <Text style={styles.dayStyle}>{checkDay(item.day)}</Text>
        <Text>{`${item.openHour} - ${item.closeHour}`}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ButtonKit
        wrapperStyle={styles.backButton}
        source={require('../assets/back-button.png')}
        onPress={() => navigation.navigate('Home')}
      />
      <ScrollView>
        <Image
          source={{uri: `data:image/jpeg;base64,${foodcourtImage}`}}
          style={styles.imageStyle}
          resizeMode="cover"
        />
        <View style={styles.contentContainer}>
          <Title text={foodcourtName} txtStyle={styles.nameStyle} />
          <View style={styles.contentDetailContainer}>
            <View style={styles.horizontalWrapper}>
              <Text style={styles.contentTitle}>Description</Text>
              <Text style={styles.contentDetail}>{`"${foodcourtDesc}"`}</Text>
            </View>
            <View style={styles.horizontalWrapper}>
              <Text style={styles.contentTitle}>Location</Text>
              <Text style={styles.contentDetail}>{foodcourtLoc}</Text>
            </View>
            <View style={styles.horizontalWrapper}>
              <Text style={styles.contentTitle}>Opening Hours</Text>
              <FlatList
                style={styles.contentDetail}
                data={foodcourtHourList}
                renderItem={({item, index}) => renderItem({item, index})}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default FoodcourtDetail;
