import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: any;
}

const API_BASE_URL = 'http://172.16.36.178:3000'; 

export default function AuthScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [djName, setDjName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async () => {
        const endpoint = isRegistering ? '/register' : '/login';

        const payload = isRegistering
            ? { email, password, dj_name: djName, user_type: 'FREE' }   // CHANGE LATER
            : { email, password };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
                await AsyncStorage.setItem('token', data.access_token);
                navigation.replace('Main'); // take them to MainScreen
            } else if (isRegistering) {
                Alert.alert('Success', 'Registration successful. You can now log in.');
                setIsRegistering(false);
            }

        } catch (err: any) {
            Alert.alert('Error', 'Failed to connect to server.', err);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>{isRegistering ? 'Register' : 'Login'}</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
            />

            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            {isRegistering && (
                <TextInput
                    placeholder="DJ Name"
                    value={djName}
                    onChangeText={setDjName}
                    style={styles.input}
                />
            )}

            <Button title={isRegistering ? 'Register' : 'Login'} onPress={handleSubmit} />

            <Text
                style={styles.switchMode}
                onPress={() => setIsRegistering(!isRegistering)}
            >
                {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00FFFF',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        marginBottom: 12,
        padding: 12,
        borderRadius: 8,
    },
    switchMode: {
        color: '#1E90FF',
        textAlign: 'center',
        marginTop: 16,
    },
});
