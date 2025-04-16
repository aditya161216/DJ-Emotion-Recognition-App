import React from "react";
import { View, Text, Button, StyleSheet, Modal } from "react-native";

export default function ConfirmationModal({
    visible,
    option1Text,
    option2Text,
    bodyText,
    onPress,
    onCancel,
}: {
    visible: boolean;
    option1Text: string;
    option2Text: string;
    bodyText: string;
    onPress: () => void;
    onCancel: () => void;
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.saveModal}>
                    <Text style={styles.savePromptText}>{bodyText}</Text>
                    <View style={styles.saveButtonRow}>
                        <Button title={option1Text} onPress={onPress} />
                        <Button title={option2Text} color="gray" onPress={onCancel} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)", 
        justifyContent: "center",
        alignItems: "center",
    },
    saveModal: {
        backgroundColor: "#222",
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        width: "80%",
    },
    savePromptText: {
        color: "#fff",
        fontSize: 18,
        marginBottom: 16,
        textAlign: "center",
    },
    saveButtonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
});
