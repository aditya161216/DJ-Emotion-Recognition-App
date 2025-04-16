import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


export default function WelcomePage() {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎧 CrowdDJ</Text>
            <Text style={styles.subtitle}>For DJs, by DJs</Text>
            <Text style={styles.description}>
                Record your DJ sets live and get real-time feedback based on your crowd’s emotions.
            </Text>
            <Text style={styles.instructions}>
                Tap “Start” to begin recording. Tap “Stop Recording” to end the set and see your crowd's emotional trend. Additionally, click “Import/View Past Log” to view your past logs.                
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        color: '#00FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 20,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#CCCCCC',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 22,
    },
    instructions: {
        fontSize: 15,
        color: '#AAAAAA',
        textAlign: 'center',
        lineHeight: 20,
    },
});