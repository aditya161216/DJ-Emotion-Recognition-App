import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
    Linking,
} from 'react-native';
import CustomButton from './CustomButton';
import * as Keychain from 'react-native-keychain';

interface Props {
    navigation: any;
}

// Beta access codes
const BETA_ACCESS_CODES = [
    'EARLYDJ',
    'REVIEWER2025'
];

export default function BetaAccessScreen({ navigation }: Props) {
    const [accessCode, setAccessCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!accessCode.trim()) {
            Alert.alert('Error', 'Please enter an access code');
            return;
        }

        setLoading(true);

        // Check if code is valid
        if (BETA_ACCESS_CODES.includes(accessCode.toUpperCase())) {
            try {
                // Store that user has beta access
                await Keychain.setInternetCredentials(
                    'groovegauge.beta',
                    'beta_access',
                    'granted'
                );

                // Navigate to main app
                navigation.replace('Splash');
            } catch (error) {
                Alert.alert('Error', 'Failed to save access status');
            }
        } else {
            Alert.alert(
                'Invalid Code',
                'This access code is not valid. Please check your invitation email or contact us for access.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Contact Us',
                        onPress: () => {
                            Linking.openURL('mailto:adityav171@gmail.com?subject=Beta Access Request');
                        },
                    },
                ]
            );
        }

        setLoading(false);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.content}>

                    <Text style={styles.title}>Welcome to Beta</Text>
                    <Text style={styles.subtitle}>
                        GrooveGauge is currently in private beta.{'\n'}
                        Enter your access code to continue.
                    </Text>

                    <View style={styles.form}>
                        <TextInput
                            placeholder="Enter access code"
                            placeholderTextColor="#444"
                            value={accessCode}
                            onChangeText={setAccessCode}
                            style={styles.input}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                        />

                        <CustomButton
                            title={loading ? 'Verifying...' : 'Continue'}
                            onPress={handleSubmit}
                            variant="primary"
                            size="medium"
                            style={styles.button}
                            disabled={loading}
                        />

                        <Text style={styles.infoText}>
                            Don't have a code?{' '}
                            <Text
                                style={styles.linkText}
                                onPress={() => {
                                    Linking.openURL('mailto:adityav171@gmail.com?subject=Beta Access Request');
                                }}
                            >
                                Request access
                            </Text>
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    icon: {
        fontSize: 64,
    },
    title: {
        fontSize: 28,
        fontWeight: '300',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 48,
        fontWeight: '300',
        textAlign: 'center',
        lineHeight: 22,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: 'transparent',
        color: '#fff',
        marginBottom: 24,
        paddingVertical: 16,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        fontSize: 17,
        fontWeight: '300',
        textAlign: 'center'
    },
    button: {
        marginTop: 24,
        marginBottom: 32,
    },
    infoText: {
        color: '#666',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '300',
    },
    linkText: {
        color: '#00FFFF',
        textDecorationLine: 'underline',
    },
    footer: {
        paddingBottom: 50,
    },
    footerText: {
        color: '#666',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '300',
    },
});