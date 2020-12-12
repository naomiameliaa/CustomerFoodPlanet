import * as React from 'react';
import {Image, StyleSheet, Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LandingPage from './src/screens/LandingPage';
import AuthLandingPage from './src/screens/AuthLandingPage';
import LoginPage from './src/screens/LoginPage';
import RegisterPage from './src/screens/RegisterPage';
import ForgotPassword from './src/screens/ForgotPassword';
import HomePage from './src/screens/HomePage';
import CartPage from './src/screens/CartPage';
import OrderPage from './src/screens/OrderPage';
import ProfilePage from './src/screens/ProfilePage';
import ListTenant from './src/screens/ListTenant';
import ListMenu from './src/screens/ListMenu';
import theme from './src/theme';
import {AuthContext} from './context';
import {getData} from './src/utils';
import DetailMenuPage from './src/screens/DetailMenu';
import DetailFoodcourtPage from './src/screens/DetailFoodcourt';
import OrderDetailPage from './src/screens/OrderDetailPage';
import QRCodeScanner from './src/screens/QRCodeScanner';
import messaging from '@react-native-firebase/messaging';

const styles = StyleSheet.create({
  iconStyle: {
    width: 20,
    height: 20,
  },
});

const AuthStack = createStackNavigator();

const AuthStackScreen = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen
      name="LandingPage"
      component={LandingPage}
      options={{headerShown: false}}
    />
    <AuthStack.Screen
      name="LoginPage"
      component={LoginPage}
      options={{headerShown: false}}
    />
    <AuthStack.Screen
      name="AuthLandingPage"
      component={AuthLandingPage}
      options={{headerShown: false}}
    />
    <AuthStack.Screen
      name="RegisterPage"
      component={RegisterPage}
      options={{headerShown: false}}
    />
    <AuthStack.Screen
      name="ForgotPasswordPage"
      component={ForgotPassword}
      options={{headerShown: false}}
    />
  </AuthStack.Navigator>
);

const HomeStack = createStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        options={{headerShown: false}}
        component={HomePage}
      />
      <HomeStack.Screen
        name="List Tenant"
        options={{headerShown: false}}
        component={ListTenant}
      />
      <HomeStack.Screen
        name="List Menu"
        options={{headerShown: false}}
        component={ListMenu}
      />
      <HomeStack.Screen
        name="Detail Menu"
        options={{headerShown: false}}
        component={DetailMenuPage}
      />
      <HomeStack.Screen
        name="Detail Foodcourt"
        options={{headerShown: false}}
        component={DetailFoodcourtPage}
      />
    </HomeStack.Navigator>
  );
}
const OrderStack = createStackNavigator();
function OrderStackScreen() {
  return (
    <OrderStack.Navigator>
      <OrderStack.Screen
        name="Order"
        options={{headerShown: false}}
        component={OrderPage}
      />
      <OrderStack.Screen
        name="Order Detail"
        options={{headerShown: false}}
        component={OrderDetailPage}
      />
      <OrderStack.Screen name="QR Code Scanner" component={QRCodeScanner} />
    </OrderStack.Navigator>
  );
}
const CartStack = createStackNavigator();
function CartStackScreen() {
  return (
    <CartStack.Navigator>
      <CartStack.Screen
        name="Cart"
        options={{headerShown: false}}
        component={CartPage}
      />
    </CartStack.Navigator>
  );
}
const ProfileStack = createStackNavigator();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="Profile"
        options={{headerShown: false}}
        component={ProfilePage}
      />
    </ProfileStack.Navigator>
  );
}

// const ListTenantStack = createStackNavigator();
// function ListTenantScreen() {
//   return (
//     <ListTenantStack.Navigator>
//       <ListTenantStack.Screen
//         name="List Tenant"
//         options={{headerShown: false}}
//         component={ListTenant}
//       />
//     </ListTenantStack.Navigator>
//   );
// }

const Tab = createBottomTabNavigator();
function TabScreen() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: theme.colors.red,
        keyboardHidesTabBar: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({focused}) => {
            const image = focused
              ? require('./src/assets/home-active.png')
              : require('./src/assets/home-inactive.png');
            return <Image style={styles.iconStyle} source={image} />;
          },
        }}
      />
      <Tab.Screen
        name="Order"
        component={OrderStackScreen}
        options={{
          tabBarIcon: ({focused}) => {
            const image = focused
              ? require('./src/assets/order-active.png')
              : require('./src/assets/order-inactive.png');
            return <Image style={styles.iconStyle} source={image} />;
          },
        }}
        tabBarOption
      />
      <Tab.Screen
        name="Cart"
        component={CartStackScreen}
        options={{
          tabBarIcon: ({focused}) => {
            const image = focused
              ? require('./src/assets/cart-active.png')
              : require('./src/assets/cart-inactive.png');
            return <Image style={styles.iconStyle} source={image} />;
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          tabBarIcon: ({focused}) => {
            const image = focused
              ? require('./src/assets/profile-active.png')
              : require('./src/assets/profile-inactive.png');
            return <Image style={styles.iconStyle} source={image} />;
          },
        }}
      />
    </Tab.Navigator>
  );
}

const RootStack = createStackNavigator();
const RootStackScreen = ({userData, isGuest}) => (
  <RootStack.Navigator headerMode="none">
    {userData || (isGuest && isGuest.isLogin) ? (
      <RootStack.Screen
        name="TabScreen"
        component={TabScreen}
        options={{
          headerShown: false,
        }}
      />
    ) : (
      <RootStack.Screen
        name="AuthStackScreen"
        component={AuthStackScreen}
        options={{
          animationEnabled: false,
        }}
      />
    )}
  </RootStack.Navigator>
);

export default function App() {
  // check if asynstorage has data called 'userdata', then the user is still logged in and immediately redirect to the home screen
  const getDataUser = async (key) => {
    if (key === 'userData') {
      const dataUser = await getData(key);
      if (dataUser !== null) {
        setUserData(dataUser);
      } else {
        setUserData(null);
      }
    } else {
      const dataGuest = await getData(key);
      if (dataGuest !== null) {
        setIsGuest(dataGuest);
      } else {
        setIsGuest(false);
      }
    }
  };

  const [isLoading, setIsLoading] = React.useState(true);
  const [userData, setUserData] = React.useState(null);
  const [isGuest, setIsGuest] = React.useState(false);

  React.useEffect(() => {
    getDataUser('userData');
    getDataUser('guestData');
  }, []);

  const authContext = React.useMemo(() => {
    return {
      guestIn: () => {
        setIsLoading(false);
        setIsGuest(getDataUser('guestData'));
      },
      signIn: () => {
        setIsLoading(false);
        setUserData(getDataUser('userData'));
      },
      signUp: () => {
        setIsLoading(false);
      },
      signOutGuest: (isGuestData) => {
        setIsLoading(false);
        setIsGuest(isGuestData);
      },
      signOut: () => {
        setIsLoading(false);
        setUserData(null);
      },
    };
  }, []);

  React.useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  // if (isLoading) {
  //   return <Splash />;
  // }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <RootStackScreen userData={userData} isGuest={isGuest} />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
