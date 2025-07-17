import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'large' | 'medium' | 'small';
    icon?: string;
    disabled?: boolean;
    style?: any;
}

export default function CustomButton({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    icon,
    disabled = false,
    style,
}: CustomButtonProps) {
    const buttonStyles = [
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                {icon && <Text style={[textStyles, styles.icon]}>{icon}</Text>}
                <Text style={textStyles}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
    icon: {
        marginRight: 8,
        fontSize: 20,
    },
    // Variants
    primary: {
        backgroundColor: '#00FFFF',
        borderColor: '#00FFFF',
    },
    secondary: {
        backgroundColor: '#1a1a1a',
        borderColor: '#333',
    },
    outline: {
        backgroundColor: 'transparent',
        borderColor: '#00FFFF',
    },
    // Variant Text Colors
    primaryText: {
        color: '#000',
    },
    secondaryText: {
        color: '#00FFFF',
    },
    outlineText: {
        color: '#00FFFF',
    },
    // Sizes
    large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        minWidth: 200,
    },
    medium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        minWidth: 120,
    },
    small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minWidth: 80,
    },
    // Size Text
    largeText: {
        fontSize: 18,
    },
    mediumText: {
        fontSize: 16,
    },
    smallText: {
        fontSize: 14,
    },
    // Disabled State
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.7,
    },
});

// Usage examples in your MainScreen:
/*
// Primary button (cyan with black text)
<CustomButton 
    title="Start"
    onPress={() => {}}
    variant="primary"
    size="large"
    icon="🎵"
/>

// Secondary button (dark with cyan text)
<CustomButton 
    title="Import/View Past Log"
    onPress={() => {}}
    variant="secondary"
    size="medium"
/>

// Outline button (transparent with cyan border)
<CustomButton 
    title="Logout"
    onPress={() => {}}
    variant="outline"
    size="small"
/>
*/