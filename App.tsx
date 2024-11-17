import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as RNFS from 'react-native-fs';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import ImageSwiper from './components/ImageSwiper';
import MainButtons from './components/MainButtons';
import ShootButtons from './components/ShootButtons';
import RuleModal from './components/RuleModal';
import LoadingModal from './components/LoadingModal';
import FeedbackSwitch from './components/FeedbackSwitch';
import DeepFaceResponseBox from './components/DeepFaceResponseBox';
import DlibResponseBox from './components/DlibResponseBox';
import ErrorResponseBox from './components/ErrorResponseBox';

const convertToBase64 = async (filePath: string): Promise<string> => {
  try {
    const base64String = await RNFS.readFile(filePath, 'base64');
    return base64String;
  } catch (error) {
    console.error('Error converting file to base64:', error);
    return '';
  }
};

const compareFaces = async (
  uploadPhoto: string,
  registerPhoto: string,
  feedback: boolean,
): Promise<any> => {
  const url = 'http://103.94.54.195:3000/api/face-compare';

  const body = JSON.stringify({
    register_image: uploadPhoto,
    scan_image: registerPhoto,
    feedback: feedback ? 'Yes' : 'No',
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error;
  }
};

const detectFace = async (image: string) => {
  const url = 'http://103.94.54.195:3000/api/face-detect';
  const body = JSON.stringify({
    register_image: image,
  });
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error;
  }
};

export default function HomeScreen() {
  const [registerPhotoUri, setRegisterPhotoUri] = useState<string | null>(null);
  const [registerPhoto, setRegisterPhoto] = useState<string | null>(null);
  const [uploadPhotoUri, setUploadPhotoUri] = useState<string | null>(null);
  const [uploadPhoto, setUploadPhoto] = useState<string | null>(null);
  const [isTaking, setIsTaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deepfaceResponse, setDeepFaceResponse] = useState<{
    execution_time: number;
    distance: number;
    matches: boolean;
  } | null>(null);
  const [dlibResponse, setDlibResponse] = useState<{
    execution_time: number;
    distance: number;
    matches: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ruleModal, setRuleModal] = useState<boolean>(false);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [samePerson, setSamePerson] = useState<boolean>(false);
  const [buttonAction, setButtonAction] = useState('');
  const [showIndex, setShowIndex] = useState(0);

  const device = useCameraDevice('front');
  const {hasPermission, requestPermission} = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  });

  if (device == null) {
    return (
      <View>
        <Text>No Device</Text>
      </View>
    );
  }

  const cameraRef = useRef<Camera | null>(null);

  const successToast = (text1: string, text2: string) => {
    Toast.show({
      topOffset: 5,
      type: 'success',
      text1: text1,
      text2: text2,
    });
  };

  const errorToast = (text1: string, text2: string) => {
    Toast.show({
      topOffset: 5,
      type: 'error',
      text1: text1,
      text2: text2,
    });
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto();
        const based64Register = await convertToBase64(`file://${photo.path}`);
        setLoadingModal(true);
        setIsTaking(false);
        await detectFace(based64Register);
        successToast('Uploaded Successfully', "Right! That's a valid image!");
        setRegisterPhotoUri(`file://${photo.path}`);
        setRegisterPhoto(based64Register);
        setShowIndex(1);
      } catch (error) {
        errorToast('Error', 'Invalid Image. Face Not Detected');
        setErrorMessage('Invalid Image. Face Not Detected');
        console.error(error);
      } finally {
        setIsTaking(false);
        setLoadingModal(false);
      }
    }
  };

  const pickImage = async () => {
    setErrorMessage('');
    setDeepFaceResponse(null);
    setDlibResponse(null);
    setRuleModal(!ruleModal);
    let result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
      quality: 1,
    });
    setLoadingModal(true);
    setShowIndex(0);
    try {
      if (result && result.assets && result.assets.length > 0) {
        const based64Register = await convertToBase64(
          result.assets[0].uri || '',
        );
        await detectFace(based64Register);
        successToast('Uploaded Successfully', "Right! That's a valid image!");
        setUploadPhoto(based64Register);
        setUploadPhotoUri(result.assets[0].uri || '');
      }
    } catch (error) {
      errorToast('Error', 'Invalid Image. Face Not Detected');
      setErrorMessage('Invalid Image. Face Not Detected');
      console.error(error);
    } finally {
      setLoadingModal(false);
    }
  };

  const matchingFaces = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setDeepFaceResponse(null);
    setDlibResponse(null);
    try {
      const response = await compareFaces(
        uploadPhoto || '',
        registerPhoto || '',
        samePerson,
      );
      if (response) {
        const deepface = {
          execution_time: Number(response.deepface_execution_time),
          distance: response['deepface']['distance'],
          matches: response['deepface']['verified'],
        };
        const dlib = {
          execution_time: Number(response['dlib_execution_time']),
          distance: response['dlib']['distance'],
          matches: response['dlib']['matches'],
        };
        successToast('Submitted Successfully', 'You can now close the app!');
        setDeepFaceResponse(deepface);
        setDlibResponse(dlib);
      }
    } catch (error) {
      errorToast('Error', `${error}`);
      setErrorMessage(`${error}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressRegister = () => {
    setRuleModal(!ruleModal);
    setIsTaking(true);
    setErrorMessage('');
    setDeepFaceResponse(null);
    setDlibResponse(null);
  };

  const removeImage = (type: string) => {
    setDlibResponse(null);
    setDeepFaceResponse(null);
    if (type === 'take') {
      setRegisterPhoto(null);
      setRegisterPhotoUri(null);
      setShowIndex(0);
    } else {
      setUploadPhoto(null);
      setUploadPhotoUri(null);
      setShowIndex(1);
    }
    successToast('Removed Successfully', 'Your image is removed successfully');
  };

  const onPressMainButton = (action: string) => {
    setRuleModal(!ruleModal);
    setButtonAction(action);
  };

  const onPressShootCancel = () => {
    setIsTaking(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {!isTaking && !registerPhotoUri && !uploadPhotoUri && (
          <Text style={styles.title}>
            This app is aimed at collecting human images to train machine
            learning model.
          </Text>
        )}
        {isTaking ? (
          <Camera
            ref={cameraRef}
            style={[styles.camera]}
            device={device}
            isActive={true}
            photo={true}
          />
        ) : (
          (registerPhotoUri || uploadPhotoUri) && (
            <ImageSwiper
              uploadPhotoUri={uploadPhotoUri}
              registerPhotoUri={registerPhotoUri}
              showIndex={showIndex}
              isLoading={isLoading}
              removeImage={removeImage}
            />
          )
        )}
        <View style={{paddingHorizontal: 10}}>
          <View>
            {isTaking ? (
              <ShootButtons
                onPressCancel={onPressShootCancel}
                takePicture={takePicture}
              />
            ) : (
              <MainButtons isLoading={isLoading} onPress={onPressMainButton} />
            )}
          </View>
          <RuleModal
            ruleModal={ruleModal}
            onPressYes={() => {
              buttonAction === 'upload' ? pickImage() : handlePressRegister();
            }}
            onPressNo={() => setRuleModal(!ruleModal)}
            onRequestClose={() => {
              setRuleModal(!ruleModal);
            }}
          />
          <LoadingModal
            loadingModal={loadingModal}
            onRequestClose={() => {
              setLoadingModal(!loadingModal);
            }}
          />
          <FeedbackSwitch
            isLoading={isLoading}
            samePerson={samePerson}
            onValueChange={() => setSamePerson(!samePerson)}
          />
          {isLoading && <ActivityIndicator size="large" />}
          {registerPhoto && uploadPhoto && !isLoading && (
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={matchingFaces}>
              <Text style={{color: 'white'}}>Submit</Text>
            </Pressable>
          )}
          {errorMessage && !isLoading && (
            <ErrorResponseBox errorMessage={errorMessage} />
          )}
          {deepfaceResponse && !isLoading && (
            <DeepFaceResponseBox deepfaceResponse={deepfaceResponse} />
          )}
          {dlibResponse && !isLoading && (
            <DlibResponseBox dlibResponse={dlibResponse} />
          )}
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  camera: {
    width: '100%',
    height: 450,
    alignSelf: 'center',
    position: 'relative',
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
  title: {
    color: 'red',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
  },
});
