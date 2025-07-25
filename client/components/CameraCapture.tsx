import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import ConfirmationModal from './ConfirmationModal';
import CustomButton from './CustomButton';
import { API_BASE_URL, API_PROD_BASE_URL } from '@env'

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
    const [hasPermission, setHasPermission] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [currentEmotion, setCurrentEmotion] = useState('');
    const [loading, setLoading] = useState(false);
    const [emotionLog, setEmotionLog] = useState<
        { timestamp: number; emotion: string }[]
    >([]);
    const [showModal, setShowModal] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const cameraRef = useRef<Camera>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const devices = useCameraDevices();
    const device = devices.find((d) => d.position === cameraPosition);

    useEffect(() => {
        (async () => {
            const cameraStatus = await Camera.requestCameraPermission();
            const micStatus = await Camera.requestMicrophonePermission();
            setHasPermission(cameraStatus === 'granted' && micStatus === 'granted');
        })();
    }, []);

    // Start video recording after camera is ready
    useEffect(() => {
        if (device && hasPermission && cameraRef.current && !isRecording) {
            // Small delay to ensure camera is fully initialized
            const timer = setTimeout(() => {
                startVideoRecording();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [device, hasPermission]);

    // Start photo interval after recording starts
    useEffect(() => {
        if (isRecording && device && hasPermission && !intervalRef.current) {
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
    }, [isRecording, device, hasPermission]);

    const startVideoRecording = async () => {
        if (!cameraRef.current || isRecording) return;

        try {
            console.log("Starting video recording...");
            await cameraRef.current.startRecording({
                onRecordingFinished: async (video) => {
                    console.log('Recording finished:', video);
                    try {
                        const videoPath = video.path.startsWith('file://')
                            ? video.path
                            : `file://${video.path}`;
                        await CameraRoll.save(videoPath, { type: 'video' });
                        console.log('Video saved to camera roll');
                    } catch (error) {
                        console.error('Failed to save video:', error);
                    }
                },
                onRecordingError: (error) => {
                    console.error('Recording error:', error);
                    setIsRecording(false);
                },
            });
            setIsRecording(true);
            console.log("Video recording started");
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    };

    const stopVideoRecording = async () => {
        if (!cameraRef.current || !isRecording) return;

        console.log("Stopping video recording...");
        try {
            await cameraRef.current.stopRecording();
            setIsRecording(false);
            console.log("Video recording stopped");
        } catch (err) {
            console.error("Error stopping recording:", err);
        }
    };

    const takePhotoAndSend = async () => {
        if (!cameraRef.current || !isRecording) return;
        try {
            setLoading(true);

            const photo = await cameraRef.current.takePhoto();
            const base64 = await RNFS.readFile(photo.path, 'base64');

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

            // Clean up photo file
            await RNFS.unlink(photo.path);
        } catch (err) {
            console.error('Capture error:', err);
            setCurrentEmotion('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleStopPress = async () => {
        await stopVideoRecording();
        onStopPress(); // This triggers the modal
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
                    <Text style={styles.permissionText}>
                        Waiting for camera and microphone permissions...
                    </Text>
                </View>
            )}

            {/* Recording indicator */}
            {isRecording && (
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
                    onPress={handleStopPress}
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
                onPress={() => {
                    onStopCancel();
                    setTimeout(() => {
                        onComplete(emotionLog);
                    }, 100);
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
    recordingIndicator: {
        position: 'absolute',
        top: 60,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF0000',
        marginRight: 6,
    },
    recordingText: {
        color: '#FF0000',
        fontSize: 12,
        fontWeight: '600',
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
});