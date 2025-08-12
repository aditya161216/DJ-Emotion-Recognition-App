import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import * as Keychain from 'react-native-keychain';
import CustomButton from './CustomButton';
import ConfirmationModal from './ConfirmationModal';
import { API_PROD_BASE_URL } from '@env';

interface Props {
    navigation: any;
}

export default function SettingsScreen({ navigation }: Props) {
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleSignOut = async () => {
        try {
            await Keychain.resetInternetCredentials({
                server: "djemotionanalyzer.com"
            });
            navigation.navigate('Auth');
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            // Get the auth token
            const credentials = await Keychain.getInternetCredentials('djemotionanalyzer.com');
            if (!credentials || typeof credentials === 'boolean') {
                throw new Error('No credentials found');
            }

            const token = credentials.password;

            // Call delete account endpoint
            const response = await fetch(`${API_PROD_BASE_URL}/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            // Clear credentials and navigate to auth
            await Keychain.resetInternetCredentials({
                server: "djemotionanalyzer.com"
            });

            Alert.alert(
                'Account Deleted',
                'Your account has been permanently deleted.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Auth'),
                    },
                ]
            );
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to delete account. Please try again or contact support.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity
                        style={styles.optionButton}
                        onPress={handleSignOut}
                        disabled={loading}
                    >
                        <Text style={styles.optionText}>Sign Out</Text>
                        <Text style={styles.optionArrow}>→</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={[styles.optionButton, styles.dangerOption]}
                        onPress={() => setShowDeleteModal(true)}
                        disabled={loading}
                    >
                        <Text style={[styles.optionText, styles.dangerText]}>
                            Delete Account
                        </Text>
                        <Text style={[styles.optionArrow, styles.dangerText]}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoText}>
                        Deleting your account will permanently remove all your data. This action cannot be undone.
                    </Text>
                </View>
            </View>

            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#00FFFF" />
                    <Text style={styles.loadingText}>Deleting account...</Text>
                </View>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                visible={showDeleteModal}
                option1Text="Delete"
                option2Text="Cancel"
                bodyText="Are you absolutely sure you want to delete your account? This will permanently delete all your data and cannot be undone."
                onPress={handleDeleteAccount}
                onCancel={() => setShowDeleteModal(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        padding: 5,
    },
    backText: {
        color: '#00FFFF',
        fontSize: 16,
        fontWeight: '400',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '300',
        letterSpacing: 0.5,
    },
    placeholder: {
        width: 60, // Same width as back button for centering
    },
    content: {
        flex: 1,
        paddingTop: 40,
    },
    section: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        color: '#666',
        fontSize: 14,
        fontWeight: '400',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 8,
        marginBottom: 12,
    },
    optionText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '300',
    },
    optionArrow: {
        color: '#666',
        fontSize: 18,
    },
    divider: {
        height: 20,
    },
    dangerOption: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
    },
    dangerText: {
        color: '#FF3B30',
    },
    infoSection: {
        paddingHorizontal: 40,
        paddingTop: 20,
    },
    infoText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '300',
        textAlign: 'center',
        lineHeight: 20,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 16,
        fontWeight: '300',
    },
});