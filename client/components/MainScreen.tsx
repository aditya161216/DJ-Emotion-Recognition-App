import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native';
import CameraCapture from './CameraCapture';
import EmotionGraph from './EmotionGraph';
import WelcomePage from './WelcomePage';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import Share from 'react-native-share';
import ConfirmationModal from './ConfirmationModal';
import { CameraPosition } from '../types/cameraTypes';

export default function MainScreen() {
    const [isRecording, setIsRecording] = useState(false);
    const [emotionLog, setEmotionLog] = useState<
        { timestamp: number; emotion: string }[]
    >([]);
    const [logDate, setLogDate] = useState<string | undefined>(undefined);
    const [isWelcomePage, setIsWelcomePage] = useState(true);
    const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');
    const [showSavePrompt, setShowSavePrompt] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showRestartModal, setShowRestartModal] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [pendingImport, setPendingImport] = useState(false);

    useEffect(() => {
        if (pendingImport) {
            const runImport = async () => {
                setPendingImport(false);
                await importEmotionLog();
            };
            runImport();
        }
    }, [pendingImport]);

    useEffect(() => {
        console.log('Emotion Log:', emotionLog);
    },);


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

    return (
        <>
            {isWelcomePage ? (
                <>
                    <WelcomePage />
                    <View style={styles.restartButton}>
                        <Button
                            title="Start"
                            onPress={() => {
                                setCameraPosition('back');
                                setIsWelcomePage(false);
                                setIsRecording(true);
                                setLogDate(new Date().toLocaleDateString());
                            }}
                        />
                        <View style={{ marginTop: 12 }}>
                            <Button
                                title="Import/View Past Log"
                                color="#1E90FF"
                                onPress={importEmotionLog}
                            />
                        </View>
                    </View>
                </>
            ) : (
                <View style={{ flex: 1 }}>
                    {isRecording ? (
                        <CameraCapture
                            onComplete={(log) => {
                                setEmotionLog(log);
                                setIsRecording(false);
                                setShowSavePrompt(true);
                                setLogDate(new Date().toLocaleDateString());
                            }}
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

                            <View style={styles.buttonRow}>
                                <View style={styles.buttonWrapper}>
                                    <Button
                                        title="Record Again"
                                        color="#1E90FF"
                                        onPress={() => setShowRestartModal(true)}
                                    />
                                </View>
                                <View style={styles.buttonWrapper}>
                                    <Button
                                        title="Back To Welcome Page"
                                        color="#1E90FF"
                                        onPress={() => setShowWelcomeModal(true)}
                                    />
                                </View>
                            </View>
                            <View style={styles.importExportRow}>
                                <View style={styles.buttonWrapper}>
                                    <Button
                                        title="Export Log"
                                        color="#1E90FF"
                                        onPress={() => exportEmotionLog(emotionLog)}
                                    />
                                </View>
                                <View style={styles.buttonWrapper}>
                                    <Button
                                        title="Import Log"
                                        color="#1E90FF"
                                        onPress={() => setShowImportModal(true)}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    {emotionLog.length > 0 && <ConfirmationModal
                        visible={showSavePrompt}
                        option1Text="Yes"
                        option2Text="No"
                        bodyText="Do you want to save this emotion log?"
                        onPress={async () => {
                            setShowSavePrompt(false);
                            await exportEmotionLog(emotionLog);
                        }}
                        onCancel={() => setShowSavePrompt(false)}
                    />}

                    <ConfirmationModal
                        visible={showImportModal}
                        option1Text="Proceed"
                        option2Text="Go Back"
                        bodyText="WARNING: This will overwrite your current emotion log. Make sure you have saved your current log before importing a new one."
                        onPress={() => {
                            setShowImportModal(false);
                            setTimeout(() => {
                                setPendingImport(true);
                            }, 400);
                        }}
                        onCancel={() => setShowImportModal(false)}
                    />

                    <ConfirmationModal
                        visible={showRestartModal}
                        option1Text="Yes"
                        option2Text="No"
                        bodyText="Are you sure you want to record another set? This will clear the current session."
                        onPress={() => {
                            setShowRestartModal(false);
                            setIsRecording(true);
                            setLogDate(new Date().toLocaleDateString());
                        }}
                        onCancel={() => setShowRestartModal(false)}
                    />

                    <ConfirmationModal
                        visible={showWelcomeModal}
                        option1Text="Yes"
                        option2Text="No"
                        bodyText="Are you sure you want to go back to the welcome page? This will clear the current session."
                        onPress={() => {
                            setShowWelcomeModal(false);
                            setIsWelcomePage(true);
                        }}
                        onCancel={() => setShowWelcomeModal(false)}
                    />
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 20,
    },
    restartButton: {
        marginTop: 20,
        marginBottom: 40,
        alignItems: 'center',
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 8,
        borderRadius: 10,
        overflow: 'hidden',
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
    saveModal: {
        position: 'absolute',
        top: '30%',
        left: '10%',
        right: '10%',
        backgroundColor: '#222',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 5,
        zIndex: 9999,
    },
    savePromptText: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 16,
        textAlign: 'center',
    },
    saveButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    importExportRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 16,
        marginBottom: 70,
    },
    logDate: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
        marginTop: -12,
    },
});
