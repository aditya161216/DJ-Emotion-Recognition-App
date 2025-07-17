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
import ConfirmationModal from './ConfirmationModal';
import CustomButton from './CustomButton';

type CameraPosition = 'front' | 'back' | 'external';

// const API_BASE_URL = 'http://172.16.36.178:3000'; 
const API_BASE_URL = 'http://10.0.0.163:3000';

export default function CameraCapture({
    onComplete,
    cameraPosition,
    setCameraPosition,
}: {
    onComplete: (log: { timestamp: number; emotion: string }[]) => void;
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
    const [showConfirmation, setShowConfirmation] = useState(false);

    const cameraRef = useRef<Camera>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const devices = useCameraDevices();
    const device = devices.find((d) => d.position === cameraPosition);

    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        })();
    }, []);

    useEffect(() => {
        if (device && hasPermission && !intervalRef.current) {
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

    const takePhotoAndSend = async () => {
        if (!cameraRef.current) return;
        try {
            setLoading(true);

            const photo = await cameraRef.current.takePhoto();
            const base64 = await RNFS.readFile(photo.path, 'base64');

            const res = await fetch(`${API_BASE_URL}/analyze-emotion`, {
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
        } catch (err) {
            console.error('Capture error:', err);
            setCurrentEmotion('Error');
        } finally {
            setLoading(false);
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
                />
            ) : (
                <View style={styles.centered}>
                    <Text style={styles.permissionText}>Waiting for camera permission...</Text>
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
                    onPress={() => setShowConfirmation(true)}
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
                visible={showConfirmation}
                option1Text="Yes"
                option2Text="No"
                bodyText="Are you sure you want to stop recording?"
                onPress={() => onComplete(emotionLog)}
                onCancel={() => setShowConfirmation(false)}
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
});