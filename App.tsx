import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Button, Image, ActivityIndicator, Dimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as RNFS from 'react-native-fs';
import { Dropdown } from 'react-native-element-dropdown';
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
    registerImage: string,
    scanImage: string,
    model: string
): Promise<any> => {
    const url = 'http://103.94.54.195:3000/api/face-compare';
  
    const body = JSON.stringify({
        register_image: registerImage,
        scan_image: scanImage,
        library: model,
    });

    console.log(registerImage.substring(0, 100))
    console.log(scanImage.substring(0, 100))
    console.log(model)
  
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
};

export default function HomeScreen() {
    const [registerPhotoUri, setRegisterPhotoUri] = useState<string | null>(null);
    const [registerPhoto, setRegisterPhoto] = useState<string>("");
    const [scanPhotoUri, setScanPhotoUri] = useState<string>("");
    const [scanPhoto, setScanPhoto] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("dlib");
    const [isRegister, setIsRegister] = useState<boolean>(false);
    const [isScan, setIsScan] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [response, setResponse] = useState<{execution_time: number, distance: number, matches: boolean} | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
                setRegisterPhotoUri(`file://${photo.path}`);
                const based64Register = await convertToBase64(`file://${photo.path}`);
                setRegisterPhoto(based64Register);
            } catch (error) {
                setErrorMessage(`Error: ${error}`);
                console.error("Error: ", error);
            } finally {
                setIsRegister(false);
            }
        }
    };

    const pickImage = async () => {
        let result = await launchImageLibrary({
            mediaType: 'photo',
            includeBase64: false,
            quality: 1,
        });

        if (result && result.assets && result.assets.length > 0) {
            setRegisterPhotoUri(result.assets[0].uri || "");
            const based64Register = await convertToBase64(result.assets[0].uri || "");
            setRegisterPhoto(based64Register);
        }
    };

    const scanPicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePhoto()
                setScanPhotoUri(`file://${photo.path}`);
                const based64Scan = await convertToBase64(`file://${photo.path}`);
                setScanPhoto(based64Scan);
            } catch (error) {
                setErrorMessage(`Error: ${error}`);
                console.error("Error: ", error);
            } finally {
                setIsScan(false);
            }
        }
    };

    const matchingFaces = async () => {
        setIsLoading(true);
        setErrorMessage("")
        setResponse(null)
        try {
            const response = await compareFaces(registerPhoto, scanPhoto, selectedModel);
            if (response) {
                const show_result = {
                    execution_time: response["execution_time"],
                    distance: response["distance"],
                    matches: response["matches"] || response["verified"]
                };

                setResponse(show_result);
            }
        } catch (error) {
            setErrorMessage(`Error: ${error}`);
            console.error("Error: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePressRegister = () => {
        setIsRegister(true);
        setIsScan(false);
        setErrorMessage("");
        setResponse(null);
    };

    const handlePressScan = () => {
        setIsRegister(false);
        setIsScan(true);
        setErrorMessage("");
        setResponse(null);
    };

    return (
        <View style={styles.container}>
            {
                (!isRegister && !isScan && !registerPhotoUri && !scanPhotoUri) &&
                <Text style={styles.title}>
                    The app used to check your girlfriend is real or not!
                </Text>
            }
            {
                (isRegister || isScan) ?
                <Camera
                    ref={cameraRef}
                    style={[styles.camera]}
                    device={device}
                    isActive={true}
                    photo={true}
                />
                 :
                 (registerPhotoUri || scanPhotoUri) &&
                 <View style={{height: 400, justifyContent: "center", alignItems: "center",}}>
                    <Swiper showsPagination={false} loop={false} >
                        {
                            registerPhotoUri && 
                            <View style={{paddingHorizontal: 10}}>
                                <Image src={registerPhotoUri || ""} style={styles.image} />
                                <Text style={{color: "#6482AD", fontWeight: "bold"}}>Register Image</Text>
                            </View>
                        }
                        {
                            scanPhotoUri &&
                            <View style={{paddingHorizontal: 10}}>
                                <Image src={scanPhotoUri || ""} style={styles.image} />
                                <Text style={{color: "#6482AD", fontWeight: "bold"}}>Scan Image</Text>
                            </View>
                        }
                    </Swiper>
                 </View>
            }
            <View style={{paddingHorizontal: 10}}>
                <View style={{ flexDirection: "row", gap: 3 }}>
                    {
                        isRegister ?
                        <Pressable style={[styles.button, styles.takeButton]} onPress={takePicture} >
                            <Text>Shoot Picture</Text>
                        </Pressable> :

                        <Pressable style={styles.button} onPress={handlePressRegister} >
                            <Text style={styles.text}>Register your face</Text>
                        </Pressable>
                    }
                    {
                        isScan ?
                        <Pressable style={[styles.button, styles.scanButton]} onPress={scanPicture} >
                            <Text >Shoot Picture</Text>
                        </Pressable> :
                        <Pressable style={styles.button} onPress={handlePressScan} disabled={!Boolean(registerPhoto)} >
                            <Text style={styles.text}>Scan your face</Text>
                        </Pressable>
                    }
                    
                </View>
                <View  style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
                    <Pressable style={styles.button} onPress={pickImage} >
                        <Text style={styles.text}>Upload your photo</Text>
                    </Pressable>
                    <Dropdown
                        style={[styles.dropdown]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        itemTextStyle={styles.selectedTextStyle}
                        iconStyle={styles.iconStyle}
                        data={[{"label": "dlib", "value": "dlib"}, {"label": "deepface", "value": "deepface"}]}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        searchPlaceholder="Search..."
                        value={selectedModel}
                        onChange={item => {
                            setSelectedModel(item.value);
                        }}
                    />
                    
                </View>
                {
                    isLoading ?
                    <ActivityIndicator size="large" /> :
                    <Pressable style={[styles.button, styles.matchButton]} onPress={matchingFaces} 
                        disabled={!Boolean(registerPhoto) || !Boolean(scanPhoto)}
                    >
                        <Text style={{ color: "white" }}>Let's Match</Text>
                    </Pressable>
                }
                
                {
                    (errorMessage && !isLoading) &&
                    <View style={[styles.responseBox, {borderColor: "red"}]}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                }
                {
                    (response && !isLoading) &&
                    <View style={styles.responseBox}>
                        <Text style={styles.text}>Distance: {response.distance?.toPrecision(3)}</Text>
                        <Text style={styles.text}>Execution time: {response.execution_time?.toPrecision(3)} seconds</Text>
                        <View style={{flexDirection: "row", alignItems: "center", gap: 10,}}>
                            <Text style={styles.text}>
                                Result: 
                            </Text>
                            <Text style={[styles.text, response.matches ? styles.trueBadge : styles.falseBadge]}>
                                {response.matches ? "True" : "False"}
                            </Text>
                        </View>
                    </View>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
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
    takeButton: {
        backgroundColor: 'red',
        borderWidth: 0,
        shadowColor: 'darkred', 
        shadowOffset: { width: 3, height: 5 }, 
        shadowOpacity: 1,
        shadowRadius: 10, 
        elevation: 20,
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
    matchButton: {
        backgroundColor: 'red',
        borderWidth: 0,
        shadowColor: 'darkred', 
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
    dropdown: {
        width: 120,
        backgroundColor: '#F0F0F0',
        color: "black",
        borderRadius: 5,
        padding: 10,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
        color: "black",
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});
