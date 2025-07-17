import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WelcomePage() {
    const features = [
        'Record live sets',
        'Analyze emotions',
        'Track performance'
    ];

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>DJ Emotion Analyzer</Text>
                <Text style={styles.subtitle}>Understand your crowd in real-time</Text>

                <View style={styles.features}>
                    {features.map((text, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={styles.numberContainer}>
                                <Text style={styles.number}>{index + 1}</Text>
                            </View>
                            <Text style={styles.featureText}>{text}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '400',
        color: '#00FFFF',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        fontWeight: '300',
        letterSpacing: 0.2,
        marginBottom: 72,
    },
    features: {
        width: 200,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    numberContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    number: {
        fontSize: 11,
        color: '#00FFFF',
        fontWeight: '500',
    },
    featureText: {
        fontSize: 17,
        color: '#999',
        fontWeight: '300',
        letterSpacing: 0.2,
    },
});