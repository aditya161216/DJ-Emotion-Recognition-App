import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import CustomButton from "./CustomButton";

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
                <View style={styles.modalContainer}>
                    <Text style={styles.bodyText}>{bodyText}</Text>
                    <View style={styles.buttonRow}>
                        <CustomButton
                            title={option1Text}
                            onPress={onPress}
                            variant="primary"
                            size="small"
                            style={styles.button}
                        />
                        <CustomButton
                            title={option2Text}
                            onPress={onCancel}
                            variant="secondary"
                            size="small"
                            style={styles.button}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#0a0a0a",
        padding: 24,
        borderRadius: 16,
        width: "85%",
        maxWidth: 400,
        borderWidth: 1,
        borderColor: "#1a1a1a",
    },
    bodyText: {
        color: "#fff",
        fontSize: 16,
        marginBottom: 24,
        textAlign: "center",
        lineHeight: 24,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    button: {
        flex: 1,
    },
});