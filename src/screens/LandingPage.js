import * as React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import ButtonText from '../components/ButtonText';
import Title from '../components/Title';
import theme from '../theme';
import {normalize} from '../utils';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'flex-end',
  },
  wrapper: {
    backgroundColor: theme.colors.red,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  txtTitle: {
    color: theme.colors.white,
  },
  txtContent: {
    color: theme.colors.white,
    width: SCREEN_WIDTH * 0.7,
    fontSize: normalize(18),
    lineHeight: 25,
    marginBottom: 20,
  },
  txtButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  btnWrapper: {
    backgroundColor: theme.colors.white,
    padding: 8,
    width: 150,
    borderRadius: 15,
  },
});

function LandingPage({navigation}) {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.backgroundImg}
        source={require('../assets/landing-page.jpg')}>
        <View style={styles.wrapper}>
          <Title txtStyle={styles.txtTitle} text="Welcome to Food Planet" />
          <Text style={styles.txtContent}>
            Discover the best restaurant from over 1,000 food courts
          </Text>
          <ButtonText
            title="Get Started"
            txtStyle={styles.txtButton}
            wrapperStyle={styles.btnWrapper}
            onPress={() => navigation.navigate('AuthLandingPage')}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

export default LandingPage;
