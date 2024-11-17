import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type Props = {
  errorMessage: string;
};

export default function ErrorResponseBox({errorMessage}: Props) {
  return (
    <View style={[styles.responseBox]}>
      <Text style={styles.errorText}>{errorMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  responseBox: {
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 15,
    marginTop: 10,
    padding: 20,
    gap: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 17,
  },
});
