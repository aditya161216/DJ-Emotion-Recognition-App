import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Button,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

type CameraPosition = 'front' | 'back' | 'external';

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
            setFeedback('');

            const photo = await cameraRef.current.takePhoto();
            const base64 = await RNFS.readFile(photo.path, 'base64');

            const res = await fetch('http://11.22.19.204:3000/analyze-emotion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64 }),
            });

            const json = await res.json();
            setEmotionLog((prev) => [
                ...prev,
                { timestamp: Date.now(), emotion: json.emotion || 'None' },
            ]);
            setFeedback(`${json.emotion?.toUpperCase()}: ${json.feedback}`);
        } catch (err) {
            console.error('Capture error:', err);
            setFeedback('Error analyzing emotion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {hasPermission && device ? (
                <Camera
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    device={device}
                    isActive={true}
                    photo={true}
                />
            ) : (
                <View style={styles.centered}>
                    <Text>Camera is loading or permission not granted.</Text>
                </View>
            )}

            <View style={styles.overlay}>
                {loading && <ActivityIndicator size="small" color="#fff" />}
                {feedback !== '' && <Text style={styles.feedback}>{feedback}</Text>}
                <Button title="Stop Recording" onPress={() => setShowConfirmation(true)} />
                <View style={{ marginTop: 10 }}>
                    <Button title="Select Camera" onPress={() => setShowModal(true)} />
                </View>
            </View>

            {/* Confirmation modal */}
            {showConfirmation && (
                <View style={styles.confirmationContainer}>
                    <View style={styles.confirmationBox}>
                        <Text style={styles.confirmationText}>Are you sure you want to stop recording?</Text>
                        <View style={styles.confirmationButtonRow}>
                            <TouchableOpacity
                                style={styles.confirmationButton}
                                onPress={() => onComplete(emotionLog)}
                            >
                                <Text style={styles.confirmationButtonText}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmationButton}
                                onPress={() => setShowConfirmation(false)}
                            >
                                <Text style={styles.confirmationButtonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Camera selection modal */}
            <Modal transparent visible={showModal} animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Select Camera</Text>
                        {(['front', 'back', 'external'] as CameraPosition[]).map((pos) => (
                            <TouchableOpacity
                                key={pos}
                                style={styles.modalButton}
                                onPress={() => {
                                    setCameraPosition(pos);
                                    setShowModal(false);
                                }}
                            >
                                <Text style={styles.modalButtonText}>
                                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.modalButton, { marginTop: 10 }]}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    feedback: {
        marginTop: 10,
        fontSize: 16,
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#222',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        color: '#00FFFF',
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: 'bold',
    },
    modalButton: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    confirmationContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    confirmationBox: {
        backgroundColor: '#222',
        padding: 24,
        borderRadius: 12,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },

    confirmationText: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },

    confirmationButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    confirmationButton: {
        flex: 1,
        marginHorizontal: 8,
        backgroundColor: '#1E90FF',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },

    confirmationButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
