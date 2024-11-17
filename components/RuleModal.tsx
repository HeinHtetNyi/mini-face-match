import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';

type Props = {
  ruleModal: boolean;
  onPressYes: () => void;
  onPressNo: () => void;
  onRequestClose: () => void;
};

export default function RuleModal({
  ruleModal,
  onPressYes,
  onPressNo,
  onRequestClose,
}: Props) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={ruleModal}
      onRequestClose={onRequestClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            A face must be appeared clearly in the photo
          </Text>
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={onPressNo}>
              <Text style={styles.textStyle}>I won't</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={onPressYes}>
              <Text style={styles.textStyle}>I know, I will</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
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
  primaryButton: {
    backgroundColor: 'red',
    borderWidth: 0,
    shadowColor: 'darkred',
    shadowOffset: {width: 3, height: 5},
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
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
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    color: 'black',
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
});
