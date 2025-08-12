import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthScreen from "./components/AuthScreen";
import MainScreen from './components/MainScreen';
import HowToUseScreen from './components/HowToUseScreen';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import SplashScreen from './components/SplashScreen';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import * as Keychain from 'react-native-keychain';
import SettingsScreen from './components/SettingsScreen';

enableScreens();

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {

        // Then check auth
        const credentials = await Keychain.getInternetCredentials('djemotionanalyzer.com');
        // Check if credentials exist and are not false
        if (credentials && typeof credentials !== 'boolean') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAccess();
  }, []);

  // Show loading while checking
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#00FFFF" />
      </View>
    );
  }


  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Splash"
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            ...TransitionPresets.SlideFromRightIOS,
            gestureDirection: 'horizontal',
            headerShown: false,
          }}
        />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="HowToUse" component={HowToUseScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            ...TransitionPresets.SlideFromRightIOS,
            gestureDirection: 'horizontal',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}