import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

type Props = {
  onPressCancel: () => void;
  takePicture: () => void;
};

export default function ShootButtons({onPressCancel, takePicture}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, styles.secondaryButton]}
        onPress={onPressCancel}>
        <Text>Cancel</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.scanButton]}
        onPress={takePicture}>
        <Text>Shoot Picture</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  button: {
    padding: 10,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  secondaryButton: {
    backgroundColor: 'grey',
    borderWidth: 0,
    shadowColor: 'darkgrey',
    shadowOffset: {width: 3, height: 5},
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
  },
  scanButton: {
    backgroundColor: 'red',
    borderWidth: 0,
    shadowColor: 'darkred',
    shadowOffset: {width: 3, height: 5},
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
  },
});
