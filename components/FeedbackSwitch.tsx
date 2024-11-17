import React from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';

type Props = {
  isLoading: boolean;
  samePerson: boolean;
  onValueChange: () => void;
};

export default function FeedbackSwitch({
  isLoading,
  samePerson,
  onValueChange,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Are these photos same person?</Text>
      <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={samePerson ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={onValueChange}
        disabled={isLoading}
        value={samePerson}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'center',
  },
  text: {
    color: '#000',
    fontSize: 16,
  },
});
