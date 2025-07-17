// this acts as an "intermediate" screen while the app decides whether to load the app or the login screen
// based on whether a jwt token is present

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

interface Props {
    navigation: any;
}

export default function SplashScreen({ navigation }: Props) {
    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('token');
            navigation.replace(token ? 'Main' : 'Auth');
        };
        checkToken();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    );
}