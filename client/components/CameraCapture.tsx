import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Modal,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import ConfirmationModal from './ConfirmationModal';
import CustomButton from './CustomButton';
import { API_BASE_URL, API_PROD_BASE_URL } from '@env'
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

type CameraPosition = 'front' | 'back' | 'external';

// check for backend url
if (!API_PROD_BASE_URL) {
    throw new Error("Backend URL missing from env file");
}

export default function CameraCapture({
    onComplete,
    showStopModal,
    onStopPress,
    onStopCancel,
    cameraPosition,
    setCameraPosition,
}: {
    onComplete: (log: { timestamp: number; emotion: string }[]) => void;
    showStopModal: boolean;
    onStopPress: () => void;
    onStopCancel: () => void;
    cameraPosition: CameraPosition;
    setCameraPosition: (pos: CameraPosition) => void;
}) {
    // const [hasPermission, setHasPermission] = useState(false);
    // const [feedback, setFeedback] = useState('');
    // const [currentEmotion, setCurrentEmotion] = useState('');
    // const [loading, setLoading] = useState(false);
    // const [emotionLog, setEmotionLog] = useState<
    //     { timestamp: number; emotion: string }[]
    // >([]);
    // const [showModal, setShowModal] = useState(false);

    // const cameraRef = useRef<Camera>(null);
    // const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // const devices = useCameraDevices();
    // const device = devices.find((d) => d.position === cameraPosition);

    // useEffect(() => {
    //     (async () => {
    //         const status = await Camera.requestCameraPermission();
    //         setHasPermission(status === 'granted');
    //     })();
    // }, []);

    // useEffect(() => {
    //     if (device && hasPermission && !intervalRef.current) {
    //         intervalRef.current = setInterval(() => {
    //             takePhotoAndSend();
    //         }, 2500);
    //     }

    //     return () => {
    //         if (intervalRef.current) {
    //             clearInterval(intervalRef.current);
    //             intervalRef.current = null;
    //         }
    //     };
    // }, [device, hasPermission]);

    // const takePhotoAndSend = async () => {
    //     if (!cameraRef.current) return;
    //     try {
    //         setLoading(true);

    //         const photo = await cameraRef.current.takePhoto();
    //         const base64 = await RNFS.readFile(photo.path, 'base64');

    //         const res = await fetch(`${API_PROD_BASE_URL}/analyze-emotion`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ image: base64 }),
    //         });

    //         const json = await res.json();
    //         const emotion = json.emotion || 'None';
    //         setEmotionLog((prev) => [
    //             ...prev,
    //             { timestamp: Date.now(), emotion },
    //         ]);
    //         setCurrentEmotion(emotion);
    //         setFeedback(json.feedback || '');
    //     } catch (err) {
    //         console.error('Capture error:', err);
    //         setCurrentEmotion('Error');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const [hasPermission, setHasPermission] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [currentEmotion, setCurrentEmotion] = useState('');
    const [loading, setLoading] = useState(false);
    const [emotionLog, setEmotionLog] = useState<
        { timestamp: number; emotion: string }[]
    >([]);
    const [showModal, setShowModal] = useState(false);
    const [isRecordingVideo, setIsRecordingVideo] = useState(false);

    const cameraRef = useRef<Camera>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const devices = useCameraDevices();
    const device = devices.find((d) => d.position === cameraPosition);

    useEffect(() => {
        (async () => {
            const cameraStatus = await Camera.requestCameraPermission();
            const microphoneStatus = await Camera.requestMicrophonePermission();
            setHasPermission(cameraStatus === 'granted' && microphoneStatus === 'granted');
        })();
    }, []);

    useEffect(() => {
        if (device && hasPermission && !intervalRef.current) {
            // Start video recording when component mounts
            setTimeout(() => {
                startVideoRecording();
            }, 1000);

            // Continue with photo intervals for emotion detection
            intervalRef.current = setInterval(() => {
                takePhotoAndSend();
            }, 2500);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [device, hasPermission]);

    const startVideoRecording = async () => {
        if (!cameraRef.current || isRecordingVideo) return;

        try {
            await cameraRef.current.startRecording({
                onRecordingFinished: async (video) => {
                    console.log('Video saved to:', video.path);
                    // Save to camera roll
                    try {
                        await CameraRoll.saveAsset(video.path, { type: 'video' });
                        // Remove the Alert or make it appear after navigation
                        console.log('Recording saved to camera roll!');
                    } catch (error) {
                        console.error('Failed to save video:', error);
                    }
                },
                onRecordingError: (error) => {
                    console.error('Recording error:', error);
                },
            });
            setIsRecordingVideo(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    };

    const stopVideoRecording = async () => {
        if (!cameraRef.current || !isRecordingVideo) return;

        try {
            await cameraRef.current.stopRecording();
            setIsRecordingVideo(false);
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };


    const takePhotoAndSend = async () => {
        if (!cameraRef.current || !isRecordingVideo) return;

        try {
            setLoading(true);
            // Take snapshot during video recording
            const snapshot = await cameraRef.current.takeSnapshot({
                quality: 85,
                // skipMetadata: true,
            });

            const base64 = await RNFS.readFile(snapshot.path, 'base64');

            const res = await fetch(`${API_PROD_BASE_URL}/analyze-emotion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64 }),
            });

            const json = await res.json();
            const emotion = json.emotion || 'None';
            setEmotionLog((prev) => [
                ...prev,
                { timestamp: Date.now(), emotion },
            ]);
            setCurrentEmotion(emotion);
            setFeedback(json.feedback || '');

            // Clean up snapshot file
            await RNFS.unlink(snapshot.path);
        } catch (err) {
            console.error('Capture error:', err);
            setCurrentEmotion('Error');
        } finally {
            setLoading(false);
        }
    };

    // Update the stop recording handler
    const handleStopRecording = async () => {
        // First stop the recording and wait for it to complete
        if (isRecordingVideo) {
            await stopVideoRecording();
            // Add a delay to ensure video is saved
            setTimeout(() => {
                onStopPress();
            }, 1000);
        } else {
            onStopPress();
        }
    };

    return (
        <View style={styles.container}>
            {hasPermission && device ? (
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFillObject}
                    device={device}
                    isActive={true}
                    photo={true}
                    video={true}
                    audio={true}
                />
            ) : (
                <View style={styles.centered}>
                    <Text style={styles.permissionText}>Waiting for camera permission...</Text>
                </View>
            )}

            {/* Recording indicator */}
            {isRecordingVideo && (
                <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>REC</Text>
                </View>
            )}

            {/* Top overlay - emotion feedback */}
            <View style={styles.topOverlay}>
                {currentEmotion && (
                    <View style={styles.emotionContainer}>
                        <Text style={styles.emotionText}>
                            {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1).toLowerCase()}
                        </Text>
                        {feedback !== '' && (
                            <Text style={styles.feedbackText}>{feedback}</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Bottom overlay - controls */}
            <View style={styles.bottomOverlay}>
                <CustomButton
                    title="Stop Recording"
                    onPress={handleStopRecording}
                    variant="primary"
                    size="large"
                    style={styles.stopButton}
                />
                <TouchableOpacity
                    onPress={() => setShowModal(true)}
                    style={styles.cameraToggle}
                >
                    <Text style={styles.cameraToggleText}>
                        Select Camera • {cameraPosition === 'front' ? 'Front' : 'Back'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ConfirmationModal
                visible={showStopModal}
                option1Text="Yes"
                option2Text="No"
                bodyText="Are you sure you want to stop recording?"
                onPress={async () => {
                    if (isRecordingVideo) {
                        await stopVideoRecording();
                        // Wait for video to save
                        setTimeout(() => {
                            onStopCancel();
                            setTimeout(() => {
                                onComplete(emotionLog);
                            }, 500);
                        }, 1500);
                    } else {
                        onStopCancel();
                        setTimeout(() => {
                            onComplete(emotionLog);
                        }, 100);
                    }
                }}
                onCancel={onStopCancel}
            />

            {/* Camera selection modal */}
            <Modal transparent visible={showModal} animationType="fade">
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setShowModal(false)}
                >
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Select Camera</Text>
                        {(['front', 'back', 'external'] as CameraPosition[]).map((pos) => (
                            <TouchableOpacity
                                key={pos}
                                style={[
                                    styles.modalOption,
                                    cameraPosition === pos && styles.modalOptionActive
                                ]}
                                onPress={() => {
                                    setCameraPosition(pos);
                                    setShowModal(false);
                                }}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    cameraPosition === pos && styles.modalOptionTextActive
                                ]}>
                                    {pos.charAt(0).toUpperCase() + pos.slice(1)} Camera
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    permissionText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
    },
    topOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1,
    },
    emotionContainer: {
        alignItems: 'center',
    },
    emotionText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '300',
        marginBottom: 4,
    },
    feedbackText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontWeight: '300',
        maxWidth: 280,
    },
    loader: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        alignItems: 'center',
    },
    stopButton: {
        width: '100%',
        marginBottom: 16,
    },
    cameraToggle: {
        paddingVertical: 12,
    },
    cameraToggleText: {
        fontSize: 15,
        color: '#999',
        fontWeight: '300',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#0a0a0a',
        padding: 24,
        borderRadius: 16,
        width: '80%',
        maxWidth: 300,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    modalTitle: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
        fontWeight: '300',
    },
    modalOption: {
        paddingVertical: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    modalOptionActive: {
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
    },
    modalOptionText: {
        color: '#999',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '300',
    },
    modalOptionTextActive: {
        color: '#00FFFF',
    },
    recordingIndicator: {
        position: 'absolute',
        top: 100,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        marginRight: 6,
    },
    recordingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});