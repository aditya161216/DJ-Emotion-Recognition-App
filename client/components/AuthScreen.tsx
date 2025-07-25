import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import CustomButton from './CustomButton';
import { API_BASE_URL, API_PROD_BASE_URL } from '@env'
import * as Keychain from 'react-native-keychain';

interface Props {
    navigation: any;
}

// check for backend url
if (!API_PROD_BASE_URL) {
    throw new Error("Backend URL missing from env file");
}


export default function AuthScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [djName, setDjName] = useState('');
    const [isRegistering, setIsRegistering] = useState(true);

    // check whether the user's JWT token is stored in async storage; i.e. whether they are logged in
    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('token');
            console.log("Token in Auth: ", token)
        };

        checkToken();
    });

    const handleSubmit = async () => {
        const endpoint = isRegistering ? '/register' : '/login';

        const payload = isRegistering
            ? { email, password, dj_name: djName, user_type: 'FREE' }   // CHANGE LATER
            : { email, password };

        try {
            const response = await fetch(`${API_PROD_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Error', data.message || 'Something went wrong');
                return;
            }

            if (!isRegistering && data.access_token) {
                // await AsyncStorage.setItem('token', data.access_token);
                await Keychain.setInternetCredentials(
                    'djemotionanalyzer.com',  // server
                    email,                // username
                    data.access_token     // password (token)
                );
                console.log("JWT token is already present")
                navigation.replace('Main'); // take them to MainScreen
            } else if (isRegistering) {
                Alert.alert('Success', 'Registration successful. You can now log in.');
                setIsRegistering(false);
            }

        } catch (err: any) {
            console.error('Connection error:', err);
            console.log('URL attempted:', `${API_PROD_BASE_URL}${endpoint}`);
            Alert.alert('Error', 'Failed to connect to server.', err);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>
                        {isRegistering ? 'Create Account' : 'Welcome Back'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isRegistering
                            ? 'Start analyzing your crowd'
                            : 'Continue where you left off'}
                    </Text>

                    <View style={styles.form}>
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#444"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#444"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                        />

                        {isRegistering && (
                            <TextInput
                                placeholder="DJ Name"
                                placeholderTextColor="#444"
                                value={djName}
                                onChangeText={setDjName}
                                style={styles.input}
                            />
                        )}

                        <CustomButton
                            title={isRegistering ? 'Create Account' : 'Sign In'}
                            onPress={handleSubmit}
                            variant="primary"
                            size="medium"
                            style={styles.button}
                        />

                        <Text
                            style={styles.switchText}
                            onPress={() => setIsRegistering(!isRegistering)}
                        >
                            {isRegistering
                                ? 'Already have an account?'
                                : 'New to GrooveGauge?'}
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
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    content: {
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: '300',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 48,
        fontWeight: '300',
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
    },
    button: {
        marginTop: 24,
        marginBottom: 32,
    },
    switchText: {
        color: '#666',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '300',
    },
});