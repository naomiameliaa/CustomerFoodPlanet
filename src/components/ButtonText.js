import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import theme from '../theme';
import SpinnerKit from '../components/SpinnerKit';

const styles = StyleSheet.create({
  btnWrapper: {
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: theme.colors.black,
  },
});

function ButtonText({title, onPress, txtStyle, wrapperStyle, isLoading}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btnWrapper, wrapperStyle]}>
      {isLoading ? (
        <SpinnerKit colorSpinner={theme.colors.white} />
      ) : (
        <Text style={[styles.title, txtStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export default ButtonText;
