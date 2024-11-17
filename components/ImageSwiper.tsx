import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import Swiper from 'react-native-swiper';

type Props = {
  uploadPhotoUri: string | null;
  registerPhotoUri: string | null;
  showIndex: number;
  isLoading: boolean;
  removeImage: (type: string) => void;
};

export default function ImageSwiper({
  uploadPhotoUri,
  registerPhotoUri,
  showIndex,
  isLoading,
  removeImage,
}: Props) {
  return (
    <View style={styles.container}>
      <Swiper showsPagination={false} loop={false} index={showIndex}>
        {uploadPhotoUri && (
          <View style={styles.imageContainer}>
            <Image src={uploadPhotoUri || ''} style={styles.image} />
            <View style={styles.bottomContainer}>
              <Text style={styles.imageText}>Image From Gallery</Text>
              <Pressable
                style={[styles.button, styles.deleteButton]}
                disabled={isLoading}
                onPress={() => removeImage('upload')}>
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        {registerPhotoUri && (
          <View style={styles.imageContainer}>
            <Image src={registerPhotoUri || ''} style={styles.image} />
            <View style={styles.bottomContainer}>
              <Text style={styles.imageText}>Image From Camera</Text>
              <Pressable
                style={[styles.button, styles.deleteButton]}
                disabled={isLoading}
                onPress={() => removeImage('take')}>
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Swiper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    paddingHorizontal: 10,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
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
  deleteButton: {
    backgroundColor: 'black',
    borderWidth: 0,
    paddingVertical: 5,
  },
  image: {
    width: '100%',
    height: 450,
    borderRadius: 15,
    objectFit: 'cover',
  },
  imageText: {
    color: '#6482AD',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
  },
});
