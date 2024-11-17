import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type Props = {
  deepfaceResponse: any;
};

export default function DeepFaceResponseBox({deepfaceResponse}: Props) {
  return (
    <View style={styles.responseBox}>
      <Text style={[styles.text, styles.title]}>Deep Face</Text>
      <Text style={styles.text}>
        Distance: {deepfaceResponse.distance?.toPrecision(3)}
      </Text>
      <Text style={styles.text}>
        Execution time: {deepfaceResponse.execution_time?.toPrecision(3)}{' '}
        seconds
      </Text>
      <View style={styles.badgeContainer}>
        <Text style={styles.text}>Result:</Text>
        <Text
          style={[
            styles.text,
            deepfaceResponse.matches ? styles.trueBadge : styles.falseBadge,
          ]}>
          {deepfaceResponse.matches ? 'True' : 'False'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  responseBox: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 15,
    marginTop: 10,
    padding: 20,
    gap: 10,
  },
  trueBadge: {
    backgroundColor: 'green',
    color: 'white', // Text color
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  falseBadge: {
    backgroundColor: 'red',
    color: 'white', // Text color
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    color: '#000',
    fontSize: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
