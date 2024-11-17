import React from 'react';
import {ActivityIndicator, Modal, StyleSheet, View} from 'react-native';

type Props = {
  loadingModal: boolean;
  onRequestClose: () => void;
};

export default function LoadingModal({loadingModal, onRequestClose}: Props) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={loadingModal}
      onRequestClose={onRequestClose}>
      <View style={styles.loadingModalView}>
        <ActivityIndicator size="large" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingModalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
    backfaceVisibility: 'visible',
    backgroundColor: 'black',
  },
});
