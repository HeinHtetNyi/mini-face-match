import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

type Props = {
  isLoading: boolean;
  onPress: (action: string) => void;
};

export default function MainButtons({isLoading, onPress}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        disabled={isLoading}
        onPress={() => onPress('upload')}>
        <Text style={styles.text}>Upload your photo</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        disabled={isLoading}
        onPress={() => onPress('take')}>
        <Text style={styles.text}>Take your photo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
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
  text: {
    color: '#000',
    fontSize: 16,
  },
});
