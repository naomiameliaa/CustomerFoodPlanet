import * as React from 'react';
import {
  FlatList,
  ScrollView,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {AirbnbRating} from 'react-native-ratings';
import axios from 'axios';
import {
  getData,
  storeData,
  removeData,
  alertMessage,
  normalize,
} from '../utils';
import theme from '../theme';
import ButtonText from '../components/ButtonText';
import {AuthContext} from '../../context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 20,
  },
  tenantName: {
    fontWeight: 'bold',
    color: theme.colors.black,
    fontSize: normalize(22),
  },
  submitTxt: {
    fontWeight: 'bold',
    color: theme.colors.white,
    fontSize: normalize(20),
  },
  submitBtn: {
    backgroundColor: theme.colors.red,
    paddingVertical: 10,
    marginTop: 40,
    borderRadius: 15,
    width: '30%',
    alignSelf: 'center',
  },
});

function RatingOrder({navigation, route}) {
  const {orderId, orderList, getPastOrder} = route.params;
  const [ratings, setRatings] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
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
  };

  async function ratingOrder() {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://food-planet.herokuapp.com/orders/rate',
        {
          orderId: orderId,
          ratings: ratings,
        },
      );
      if (response.data.msg === 'Rate order success') {
        alertMessage({
          titleMessage: 'Success',
          bodyMessage: 'Thank you for your feedback !',
          btnText: 'OK',
          onPressOK: () => navigation.goBack(),
          btnCancel: false,
        });
      }
    } catch (error) {
      if (error.response.status === 401) {
        await sessionTimedOut();
      } else {
        alertMessage({
          titleMessage: 'Error',
          bodyMessage: 'Failed, Please try again!',
          btnText: 'Try Again',
          onPressOK: () => {
            navigation.goBack();
            getPastOrder();
          },
          btnCancel: false,
        });
      }
    }
    setIsLoading(false);
  }

  const renderItem = ({item, index}) => {
    return (
      <View>
        <Text style={styles.tenantName}>{item.tenantName} :</Text>
        <AirbnbRating
          count={5}
          defaultRating={1}
          reviewColor={theme.colors.red}
          reviewSize={normalize(22)}
          onFinishRating={(number) => {
            if (ratings[index].tenantId === item.tenantId) {
              ratings[index].rating = number;
            }
          }}
        />
      </View>
    );
  };

  React.useEffect(() => {
    let objects = [...ratings];
    for (let i = 0; i < orderList.length; i++) {
      objects.push({
        tenantId: orderList[i].tenantId,
        rating: 1,
      });
    }
    setRatings(objects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.innerContainer}>
        <FlatList
          data={orderList}
          renderItem={({item, index}) => renderItem({item, index})}
          keyExtractor={(index) => index.toString()}
        />
        <ButtonText
          title="Submit"
          txtStyle={styles.submitTxt}
          wrapperStyle={styles.submitBtn}
          onPress={() => ratingOrder()}
          isLoading={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default RatingOrder;
