import * as React from 'react';
import {Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import theme from '../theme';
import {normalize} from '../utils';

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },

  circle: {
    height: 14,
    width: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: theme.colors.dark_grey,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },

  checkedCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.red,
  },

  txtStyle: {
    fontSize: normalize(14),
  },
});

export default function RadioButton({options, onClick, value}) {
  return (
    <View>
      {options.map((item) => {
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.buttonContainer}
            onPress={() => onClick(item.key)}>
            <View style={styles.circle}>
              {value === item.key && <View style={styles.checkedCircle} />}
            </View>
            <Text style={styles.txtStyle}>{item.text}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
