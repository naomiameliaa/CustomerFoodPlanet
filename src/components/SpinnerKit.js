import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import theme from '../theme';

const SpinnerKit = ({sizeSpinner, colorSpinner, style}) => (
  <View style={[styles.container, styles.horizontal, style]}>
    <ActivityIndicator
      size={sizeSpinner ? sizeSpinner : 'small'}
      color={colorSpinner ? colorSpinner : theme.colors.red}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default SpinnerKit;
