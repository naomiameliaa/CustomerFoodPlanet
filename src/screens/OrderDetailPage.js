import * as React from 'react';
import {
  Text,
  View,
  FlatList,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import ButtonKit from '../components/ButtonKit';
import Title from '../components/Title';
import theme from '../theme';
import {normalize} from '../utils';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginHorizontal: 10,
    marginVertical: 25,
  },
  contentContainer: {
    paddingHorizontal: normalize(25),
    paddingVertical: normalize(10),
  },
  title: {
    marginHorizontal: normalize(25),
    fontSize: normalize(26),
    color: theme.colors.red,
  },
  titleFoodcourt: {
    fontWeight: 'bold',
    fontSize: normalize(16),
    marginBottom: 10,
    color: theme.colors.red,
  },
  subTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  detailTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: theme.colors.red,
  },
  detailContent: {
    marginBottom: 10,
  },
  menuDetailWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 3,
  },
  menuQtyStyle: {
    width: 0.1 * SCREEN_WIDTH,
  },
  menuNameStyle: {
    width: 0.6 * SCREEN_WIDTH,
  },
  menuPriceStyle: {
    width: 0.35 * SCREEN_WIDTH,
  },
  subTotal: {
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 15,
    marginRight: 0.05 * SCREEN_WIDTH,
    alignSelf: 'flex-end',
  },
  totalPriceWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalPrice: {
    fontWeight: 'bold',
    color: theme.colors.red,
    marginRight: 0.05 * SCREEN_WIDTH,
  },
});

function OrderDetailPage({route, navigation}) {
  const {
    foodcourtName,
    transactionDate,
    seatNum,
    totalSeat,
    totalPrice,
    orderList,
  } = route.params;

  const renderDate = (dateTime) => {
    let i = 0;
    let dates = '';
    let spaces = 0;
    for (; i < dateTime.length; i++) {
      dates += dateTime[i];
      if (dateTime[i] === ' ') {
        spaces++;
        if (spaces === 3) {
          return dates;
        }
      }
    }
  };

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

  const renderItem = ({item, idx}) => {
    return (
      <View>
        <Text style={styles.detailTitle}>
          {`${item.tenantName} (Order Number: ${item.orderNum})`}
        </Text>
        <Text style={styles.detailContent}>
          {`${item.items} items . ${renderStatus(item.status)}`}
        </Text>
        {item.menuList.map((itm, key) => {
          return (
            <View style={styles.menuDetailWrapper} key={key}>
              <Text style={styles.menuQtyStyle}>{`${itm.quantity}x`}</Text>
              <Text style={styles.menuNameStyle} numberOfLines={1}>
                {itm.menu.name}
              </Text>
              <Text style={styles.menuPriceStyle}>
                {renderPrice(itm.menu.price)}
              </Text>
            </View>
          );
        })}
        <Text style={styles.subTotal}>
          {`Total: Rp ${renderPrice(item.subtotal)}`}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ButtonKit
        wrapperStyle={styles.backButton}
        source={require('../assets/back-button.png')}
        onPress={() => navigation.goBack()}
      />
      <Title text="Order Details" txtStyle={styles.title} />
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.titleFoodcourt} numberOfLines={1}>
          {foodcourtName}
        </Text>
        <Text style={styles.subTitle}>
          {`Transaction Date: ${renderDate(transactionDate)}`}
        </Text>
        <Text style={styles.subTitle}>
          {`Seat Number: ${seatNum} (${totalSeat} person)`}
        </Text>
        <FlatList
          data={orderList}
          renderItem={({item, idx}) => renderItem({item, idx})}
          keyExtractor={(item) => item.tenantId.toString()}
        />
        <View style={styles.totalPriceWrapper}>
          <Text style={styles.totalPrice}>Total Pay</Text>
          <Text style={styles.totalPrice}>
            {`Rp ${renderPrice(totalPrice)}`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default OrderDetailPage;
