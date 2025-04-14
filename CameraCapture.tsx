import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

export default function CameraCapture({ onComplete }: { onComplete: (log: { timestamp: number; emotion: string }[]) => void }) {
    const [hasPermission, setHasPermission] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [emotionLog, setEmotionLog] = useState<{ timestamp: number; emotion: string }[]>([]);

    const cameraRef = useRef<Camera>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const devices = useCameraDevices();
    const device = devices.find(d => d.position === 'front');

    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        })();
    }, []);

    useEffect(() => {
        if (device && hasPermission && !intervalRef.current) {
            console.log('📸 Starting emotion capture interval...');
            intervalRef.current = setInterval(() => {
                takePhotoAndSend();
            }, 2500);    // adjust this to change the interval between photos
        }

        console.log('📸 Emotion log:', emotionLog);

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
            // const newLog = [...emotionLog, { timestamp: Date.now(), emotion: json.emotion || 'None' }];
            // console.log('Current log length:', newLog.length);
            // setEmotionLog(newLog);
            setEmotionLog(prev => [...prev, { timestamp: Date.now(), emotion: json.emotion || 'None' }]);

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
                <View style={styles.centered}><Text>Camera is loading or permission not granted.</Text></View>
            )}
            <View style={styles.overlay}>
                {loading && <ActivityIndicator size="small" color="#fff" />}
                {feedback !== '' && <Text style={styles.feedback}>{feedback}</Text>}
                <Button title="Stop Recording" onPress={() => onComplete(emotionLog)} />
            </View>
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
});