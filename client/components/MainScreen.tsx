import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import CameraCapture from './CameraCapture';
import EmotionGraph from './EmotionGraph';
import WelcomePage from './WelcomePage';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import Share from 'react-native-share';
import ConfirmationModal from './ConfirmationModal';
import { CameraPosition } from '../types/cameraTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { color } from 'highcharts';
import CustomButton from './CustomButton';
import { API_BASE_URL, API_PROD_BASE_URL } from '@env'
import * as Keychain from 'react-native-keychain';

// check for backend url
if (!API_PROD_BASE_URL) {
    throw new Error("Backend URL missing from env file");
}

interface Props {
    navigation: any;
}

type ActiveModal = 'none' | 'save' | 'import' | 'restart' | 'welcome' | 'stopRecording';

export default function MainScreen({ navigation }: Props) {
    const [isRecording, setIsRecording] = useState(false);
    const [emotionLog, setEmotionLog] = useState<
        { timestamp: number; emotion: string }[]
    >([]);

    const [logDate, setLogDate] = useState<string | undefined>(undefined);
    const [isWelcomePage, setIsWelcomePage] = useState(true);
    const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');
    const [activeModal, setActiveModal] = useState<ActiveModal>('none');
    const [pendingImport, setPendingImport] = useState(false);
    const [currentUser, setCurrentUser] = useState("")
    const [pendingEmotionLog, setPendingEmotionLog] = useState<{ timestamp: number; emotion: string }[]>([]);

    useEffect(() => {
        if (pendingImport) {
            const runImport = async () => {
                setPendingImport(false);
                await importEmotionLog();
            };
            runImport();
        }
    }, [pendingImport]);

    // check whether the user's JWT token is stored in async storage; i.e. whether they are logged in
    useEffect(() => {
        // const checkToken = async () => {
        //     const token = await AsyncStorage.getItem('token');
        //     console.log("Token in main: ", token)
        // };

        const checkToken = async () => {
            try {
                const credentials = await Keychain.getInternetCredentials('djemotionanalyzer.com');
                return credentials ? credentials.password : null;
            } catch (error) {
                console.error('Keychain error:', error);
                return null;
            }
        };

        checkToken();
    });

    // get the current user data
    useEffect(() => {
        // const getUserData = async () => {
        //     const token = await AsyncStorage.getItem('token');
        //     if (!token) {
        //         console.warn("No token found");
        //         return;
        //     }

        //     const res = await fetch(`${API_PROD_BASE_URL}/me`, {
        //         method: 'GET',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': `Bearer ${token}`,
        //         },
        //     });

        //     const data = await res.json();
        //     setCurrentUser(data.dj_name);
        //     console.log("Current DJ Name:", data.dj_name);
        // };

        const getUserData = async () => {
            try {
                const credentials = await Keychain.getInternetCredentials('djemotionanalyzer.com');
                if (!credentials) {
                    console.warn("No credentials found");
                    setCurrentUser('Guest');
                    return;
                }

                const token = credentials.password; // token is stored as password

                const res = await fetch(`${API_PROD_BASE_URL}/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data.dj_name || 'Guest');
                } else {
                    setCurrentUser('Guest');
                }
            } catch (error) {
                console.error("Failed to get credentials:", error);
                setCurrentUser('Guest');
            }
        };

        getUserData();
    }, []);

    const exportEmotionLog = async (log: { timestamp: string | number | Date; emotion: any; }[]) => {
        if (log.length === 0) {
            Alert.alert("No Data", "There's no emotion data to export.");
            return;
        }

        const csvData = 'Timestamp,Emotion\n' + log.map(entry => {
            const time = new Date(entry.timestamp).toISOString();
            return `${time},${entry.emotion}`;
        }).join('\n');

        const formattedDate = new Date().toISOString().replace(/[:.]/g, '-');
        const path = `${RNFS.DocumentDirectoryPath}/emotion_log_${formattedDate}.csv`;

        try {
            await RNFS.writeFile(path, csvData, 'utf8');
            await Share.open({
                url: 'file://' + path,
                type: 'text/csv',
                failOnCancel: false,
            });
        } catch (err) {
            console.error("Error saving file:", err);
            Alert.alert("Error", "Failed to save or share the file.");
        }
    };

    const importEmotionLog = async () => {
        try {
            const res = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.plainText],
            });

            const fileContent = await RNFS.readFile(res.uri, 'utf8');

            const parsedData = fileContent
                .split('\n')
                .slice(1)
                .map((line) => {
                    const [timestampStr, emotion] = line.split(',');
                    return {
                        timestamp: new Date(timestampStr).getTime(),
                        emotion: emotion.trim(),
                    };
                });

            setEmotionLog(parsedData);
            setLogDate(new Date(parsedData[0].timestamp).toLocaleDateString());
            setIsWelcomePage(false);

        } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
                console.error('Import error:', err);
            }
        }
    };

    const handleStopRecordingConfirm = (log: { timestamp: number; emotion: string }[]) => {
        setPendingEmotionLog(log);
        setActiveModal('none');
        setTimeout(() => {
            setEmotionLog(log);
            setIsRecording(false);
            setActiveModal('save');
            setLogDate(new Date().toLocaleDateString());
        }, 100);
    };

    const goToHowToScreen = () => {
        navigation.navigate('HowToUse')
    }


    return (
        <>
            <View style={{ flex: 1, backgroundColor: 'black' }}>
                {isWelcomePage ? (
                    <View style={{ flex: 1, backgroundColor: '#000' }}>
                        {/* Clean header bar */}
                        <View style={styles.headerBar}>
                            <Text style={styles.userInfo}>{currentUser || 'Guest'}</Text>
                            <TouchableOpacity
                                onPress={async () => {
                                    // await AsyncStorage.removeItem('token');
                                    await Keychain.resetInternetCredentials({
                                        server: "djemotionanalyzer.com"
                                    });
                                    navigation.navigate('Auth');
                                }}
                                style={styles.logoutButton}
                            >
                                <Text style={styles.logoutText}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Content area */}
                        <View style={{ flex: 1, paddingHorizontal: 24 }}>
                            <WelcomePage />
                        </View>

                        {/* Action buttons */}
                        <View style={styles.actionArea}>
                            <TouchableOpacity
                                onPress={goToHowToScreen}
                                style={styles.secondaryAction}
                            >
                                <Text style={styles.secondaryActionText}>How To Use</Text>
                            </TouchableOpacity>
                            <CustomButton
                                title="Start Recording"
                                onPress={() => {
                                    setCameraPosition('back');
                                    setIsWelcomePage(false);
                                    setIsRecording(true);
                                    setLogDate(new Date().toLocaleDateString());
                                }}
                                variant="primary"
                                size="medium"
                                style={styles.primaryButton}
                            />
                            <TouchableOpacity
                                onPress={importEmotionLog}
                                style={styles.secondaryAction}
                            >
                                <Text style={styles.secondaryActionText}>Import Session</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        {isRecording ? (
                            <CameraCapture
                                onComplete={handleStopRecordingConfirm}
                                showStopModal={activeModal === 'stopRecording'}
                                onStopPress={() => setActiveModal('stopRecording')}
                                onStopCancel={() => setActiveModal('none')}
                                cameraPosition={cameraPosition}
                                setCameraPosition={setCameraPosition}
                            />
                        ) : (
                            <>
                                {emotionLog.length > 0 ? (
                                    <>
                                        <EmotionGraph data={emotionLog} logDate={logDate} />
                                    </>
                                ) : (
                                    <View style={styles.noDataContainer}>
                                        <Text style={styles.noDataText}>No data to show.</Text>
                                        <Text style={styles.noDataSubtext}>
                                            Start recording to see results!
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.buttonContainer}>
                                    <View style={styles.buttonRow}>
                                        <CustomButton
                                            title="Record Again"
                                            onPress={() => setActiveModal('restart')}
                                            variant="primary"
                                            size="medium"
                                            style={styles.button}
                                        />
                                        <CustomButton
                                            title="Back To Welcome"
                                            onPress={() => setActiveModal('welcome')}
                                            variant="secondary"
                                            size="medium"
                                            style={styles.button}
                                        />
                                    </View>
                                    <View style={styles.buttonRow}>
                                        <CustomButton
                                            title="Export Log"
                                            onPress={() => exportEmotionLog(emotionLog)}
                                            variant="secondary"
                                            size="medium"
                                            style={styles.button}
                                        />
                                        <CustomButton
                                            title="Import Log"
                                            onPress={() => setActiveModal('import')}
                                            variant="secondary"
                                            size="medium"
                                            style={styles.button}
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        <ConfirmationModal
                            visible={activeModal === 'save' && emotionLog.length > 0}
                            option1Text="Yes"
                            option2Text="No"
                            bodyText="Do you want to save this emotion log?"
                            onPress={async () => {
                                setActiveModal('none');
                                setTimeout(async () => {
                                    await exportEmotionLog(emotionLog);
                                }, 100)
                            }}
                            onCancel={() => {
                                setActiveModal('none');
                            }}
                        />

                        <ConfirmationModal
                            visible={activeModal === 'import'}
                            option1Text="Proceed"
                            option2Text="Go Back"
                            bodyText="WARNING: This will overwrite your current emotion log. Make sure you have saved your current log before importing a new one."
                            onPress={() => {
                                setActiveModal('none');
                                setTimeout(() => {
                                    setPendingImport(true);
                                }, 400);
                            }}
                            onCancel={() => setActiveModal('none')}
                        />

                        <ConfirmationModal
                            visible={activeModal === 'restart'}
                            option1Text="Yes"
                            option2Text="No"
                            bodyText="Are you sure you want to record another set? This will clear the current session."
                            onPress={() => {
                                setActiveModal('none');
                                setTimeout(() => {
                                    setIsRecording(true);
                                    setLogDate(new Date().toLocaleDateString());
                                }, 100);
                            }}
                            onCancel={() => setActiveModal('none')}
                        />

                        <ConfirmationModal
                            visible={activeModal === 'welcome'}
                            option1Text="Yes"
                            option2Text="No"
                            bodyText="Are you sure you want to go back to the welcome page? This will clear the current session."
                            onPress={() => {
                                setActiveModal('none');
                                setTimeout(() => {
                                    setIsWelcomePage(true);
                                }, 100);
                            }}
                            onCancel={() => setActiveModal('none')}
                        />
                    </View>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#000',
    },
    userInfo: {
        fontSize: 14,
        color: '#666',
        fontWeight: '400',
    },
    logoutButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    logoutText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '400',
    },
    actionArea: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
        backgroundColor: '#000',
    },
    primaryButton: {
        marginBottom: 16,
    },
    secondaryAction: {
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 10, 
    },
    secondaryActionText: {
        fontSize: 15,
        color: '#666',
        fontWeight: '400',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 10,
        marginBottom: 20,
    },
    userText: {
        color: '#00FFFF',
        fontSize: 14,
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    welcomeButtonsContainer: {
        paddingBottom: 40,
        alignItems: 'center',
        gap: 16,
    },
    startButton: {
        width: '100%',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 12,
    },
    button: {
        flex: 1,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingHorizontal: 20,
    },
    noDataText: {
        color: '#00FFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    noDataSubtext: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
    },
});