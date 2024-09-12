import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Button, Image, ActivityIndicator, Dimensions, Modal, Switch, SafeAreaView, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as RNFS from 'react-native-fs';
import Swiper from 'react-native-swiper'

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
    feedback: boolean
): Promise<any> => {
    const url = 'http://103.94.54.195:3000/api/face-compare';
  
    const body = JSON.stringify({
        register_image: uploadPhoto,
        scan_image: registerPhoto,
        feedback: feedback ? "Yes": "No",
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

const detectScan = async (scanImage: string) => {
    const url = "http://103.94.54.195:3000/api/detect-scan"
    const body = JSON.stringify({
        scan_image: scanImage,
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
}

const detectRegister = async (registerImage: string) => {
    const url = "http://103.94.54.195:3000/api/detect-register"
    const body = JSON.stringify({
        register_image: registerImage,
    });
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });
        console.log(response)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

export default function HomeScreen() {
    const [registerPhotoUri, setRegisterPhotoUri] = useState<string | null>(null);
    const [registerPhoto, setRegisterPhoto] = useState<string>("");
    const [uploadPhotoUri, setUploadPhotoUri] = useState<string>("");
    const [uploadPhoto, setUploadPhoto] = useState<string>("");
    const [isRegister, setIsRegister] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [deepfaceResponse, setDeepFaceResponse] = useState<{execution_time: number, distance: number, matches: boolean} | null>(null);
    const [dlibResponse, setDlibResponse] = useState<{execution_time: number, distance: number, matches: boolean} | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [ruleModal, setRuleModal] = useState<boolean>(false);
    const [loadingModal, setLoadingModal] = useState<boolean>(false);
    const [samePerson, setSamePerson] = useState<boolean>(false);
    const [buttonAction, setButtonAction] = useState("")

    const device = useCameraDevice("front");
    const { hasPermission, requestPermission } = useCameraPermission()

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, []);

    if (device == null) return <View><Text>No Device</Text></View>

    const cameraRef = useRef<Camera | null>(null);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePhoto()
                const based64Register = await convertToBase64(`file://${photo.path}`);
                setLoadingModal(true)
                const response = await detectScan(based64Register)
                setRegisterPhotoUri(`file://${photo.path}`);
                setRegisterPhoto(based64Register);
            } catch (error) {
                setErrorMessage("Invalid Image. Face Not Detected");
                console.error(error);
            } finally {
                setIsRegister(false);
                setLoadingModal(false)
            }
        }
    };

    const pickImage = async () => {
        setErrorMessage("")
        setDeepFaceResponse(null);
        setDlibResponse(null);
        setRuleModal(!ruleModal)
        let result = await launchImageLibrary({
            mediaType: 'photo',
            includeBase64: false,
            quality: 1,
        });
        setLoadingModal(true)
        try {
            if (result && result.assets && result.assets.length > 0) {
                const based64Register = await convertToBase64(result.assets[0].uri || "");
                const response = await detectRegister(based64Register)
                console.log(response)
                setUploadPhoto(based64Register);
                setUploadPhotoUri(result.assets[0].uri || "");
            }
        } catch (error) {
            setErrorMessage("Invalid Image. Face Not Detected");
            console.error(error);
        } finally {
            setLoadingModal(false)
        }
    };

    const matchingFaces = async () => {
        setIsLoading(true);
        setErrorMessage("")
        setDeepFaceResponse(null)
        setDlibResponse(null);
        try {
            const response = await compareFaces(uploadPhoto, registerPhoto, samePerson);
            console.log(response)
            if (response) {
                const deepface = {
                    execution_time: Number(response["deepface_execution_time"]),
                    distance: response["deepface"]["distance"],
                    matches: response["deepface"]["verified"]
                };
                const dlib = {
                    execution_time: Number(response["dlib_execution_time"]),
                    distance: response["dlib"]["distance"],
                    matches: response["dlib"]["matches"]
                };

                setDeepFaceResponse(deepface);
                setDlibResponse(dlib);
            }
        } catch (error) {
            setErrorMessage(`${error}`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePressRegister = () => {
        setRuleModal(!ruleModal)
        setIsRegister(true);
        setErrorMessage("");
        setDeepFaceResponse(null);
        setDlibResponse(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
            {
                (!isRegister && !registerPhotoUri && !uploadPhotoUri) &&
                <Text style={styles.title}>
                    This app is aimed at collecting human images to train machine learning model.
                </Text>
            }
            {
                (isRegister) ?
                <Camera
                    ref={cameraRef}
                    style={[styles.camera]}
                    device={device}
                    isActive={true}
                    photo={true}
                />
                 :
                 (registerPhotoUri || uploadPhotoUri) &&
                 <View style={{height: 400, justifyContent: "center", alignItems: "center",}}>
                    <Swiper showsPagination={false} loop={false} >
                        {
                            registerPhotoUri && 
                            <View style={{paddingHorizontal: 10}}>
                                <Image src={registerPhotoUri || ""} style={styles.image} />
                                <Text style={{color: "#6482AD", fontWeight: "bold"}}>Image From Camera</Text>
                            </View>
                        }
                        {
                            uploadPhotoUri &&
                            <View style={{paddingHorizontal: 10}}>
                                <Image src={uploadPhotoUri || ""} style={styles.image} />
                                <Text style={{color: "#6482AD", fontWeight: "bold"}}>Image From Gallery</Text>
                            </View>
                        }
                    </Swiper>
                 </View>
            }
            <View style={{paddingHorizontal: 10}}>
                <View >
                    {
                        isRegister ?
                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 40 }}>
                            <Pressable style={[styles.button, styles.secondaryButton]} onPress={() => setIsRegister(false)} >
                                <Text >Cancel</Text>
                            </Pressable>
                            <Pressable style={[styles.button, styles.scanButton]} onPress={takePicture} >
                                <Text >Shoot Picture</Text>
                            </Pressable>
                        </View> :
                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 }}>
                            <Pressable style={styles.button} onPress={() => {setRuleModal(!ruleModal); setButtonAction("upload")}} >
                                <Text style={styles.text}>Upload your photo</Text>
                            </Pressable>
                            <Pressable style={styles.button} onPress={() => {setRuleModal(!ruleModal); setButtonAction("take")}}>
                                <Text style={styles.text}>Take your photo</Text>
                            </Pressable>
                        </View>
                    }
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={ruleModal}
                    onRequestClose={() => {
                        setRuleModal(!ruleModal);
                    }}>
                    <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>A face must be appeared clearly in the photo</Text>
                        <View style={{
                            flexDirection: "row",
                            gap: 20
                        }}>
                            <Pressable
                                style={[styles.button, styles.secondaryButton]}
                                onPress={() => setRuleModal(!ruleModal)}>
                                    <Text style={styles.textStyle}>I won't</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.primaryButton]}
                                onPress={() => {
                                    buttonAction === "upload" ?
                                    pickImage():
                                    handlePressRegister()
                                }}>
                                <Text style={styles.textStyle}>I know, I will</Text>
                            </Pressable>
                        </View>
                    </View>
                    </View>
                </Modal>
                <Modal animationType="slide"
                    transparent={true}
                    visible={loadingModal}
                    onRequestClose={() => {
                        setLoadingModal(!loadingModal);
                }}>
                    <View style={styles.loadingModalView}>
                        <ActivityIndicator size="large" />
                    </View>
                </Modal>
                <View style={{flexDirection: "row", marginVertical: 10, justifyContent: "center"}}>
                    <Text style={styles.text}>Are these photos same person?</Text>
                    <Switch
                        trackColor={{false: '#767577', true: '#81b0ff'}}
                        thumbColor={samePerson ? '#f5dd4b' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => setSamePerson(!samePerson)}
                        value={samePerson}
                    />
                </View>
                {
                    isLoading ?
                    <ActivityIndicator size="large" /> :
                    <Pressable style={[styles.button, styles.primaryButton]} onPress={matchingFaces}>
                        <Text style={{ color: "white" }}>Submit</Text>
                    </Pressable>
                }
                
                {
                    (errorMessage && !isLoading) &&
                    <View style={[styles.responseBox, {borderColor: "red"}]}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                }
                {
                    (deepfaceResponse && dlibResponse && !isLoading) &&
                    <Text style={[styles.successText, {marginVertical: 20}]}>Submitted Successfully! You can now close the app</Text>
                }
                {
                    (deepfaceResponse && !isLoading) &&
                    <View style={styles.responseBox}>
                        <Text style={[styles.text, {fontWeight: "bold"}]}>Deep Face</Text>
                        <Text style={styles.text}>Distance: {deepfaceResponse.distance?.toPrecision(3)}</Text>
                        <Text style={styles.text}>Execution time: {deepfaceResponse.execution_time?.toPrecision(3)} seconds</Text>
                        <View style={{flexDirection: "row", alignItems: "center", gap: 10,}}>
                            <Text style={styles.text}>
                                Result: 
                            </Text>
                            <Text style={[styles.text, deepfaceResponse.matches ? styles.trueBadge : styles.falseBadge]}>
                                {deepfaceResponse.matches ? "True" : "False"}
                            </Text>
                        </View>
                    </View>
                }
                {
                    (dlibResponse && !isLoading) &&
                    <View style={styles.responseBox}>
                        <Text style={[styles.text, {fontWeight: "bold"}]}>Dlib</Text>
                        <Text style={styles.text}>Distance: {dlibResponse.distance?.toPrecision(3)}</Text>
                        <Text style={styles.text}>Execution time: {dlibResponse.execution_time?.toPrecision(3)} seconds</Text>
                        <View style={{flexDirection: "row", alignItems: "center", gap: 10,}}>
                            <Text style={styles.text}>
                                Result: 
                            </Text>
                            <Text style={[styles.text, dlibResponse.matches ? styles.trueBadge : styles.falseBadge]}>
                                {dlibResponse.matches ? "True" : "False"}
                            </Text>
                        </View>
                    </View>
                }
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 10
    },
    camera: {
        width: "100%",
        height: 450,
        alignSelf: "center",
        position: "relative"
    },
    image: {
        width: "100%",
        height: 350,
        borderRadius: 15,
        objectFit: "cover",
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
    scanButton: {
        backgroundColor: 'red',
        borderWidth: 0,
        shadowColor: 'darkred', 
        shadowOffset: { width: 3, height: 5 }, 
        shadowOpacity: 1,
        shadowRadius: 10, 
        elevation: 20,
    },
    primaryButton: {
        backgroundColor: 'red',
        borderWidth: 0,
        shadowColor: 'darkred', 
        shadowOffset: { width: 3, height: 5 }, 
        shadowOpacity: 1,
        shadowRadius: 10, 
        elevation: 20,
    },
    secondaryButton: {
        backgroundColor: 'grey',
        borderWidth: 0,
        shadowColor: 'darkgrey', 
        shadowOffset: { width: 3, height: 5 }, 
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
    text: {
        color: '#000',
        fontSize: 16,
    },
    errorText: {
        color: "red",
        fontSize: 17,
    },
    successText: {
        color: "green",
        fontSize: 17,
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
    responseBox: {
        borderWidth: 1, 
        borderColor: "black", 
        borderRadius: 15,
        marginTop: 10, 
        padding: 20,
        gap: 10,
    },
    loadingModalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5,
        backfaceVisibility: "visible",
        backgroundColor: "black"
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
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        color: "black",
        fontSize: 20,
        marginBottom: 15,
        textAlign: 'center',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
});
