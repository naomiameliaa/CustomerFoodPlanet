import React from 'react';
import {TouchableOpacity, Image, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  btnWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  btnImage: {
    width: '100%',
    height: '100%',
  },
});

function ButtonKit({source, onPress, btnStyle, wrapperStyle, disabled}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btnWrapper, wrapperStyle]}
      disabled={disabled ? true : false}>
      <Image
        style={[styles.btnImage, btnStyle]}
        source={source}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

export default ButtonKit;
