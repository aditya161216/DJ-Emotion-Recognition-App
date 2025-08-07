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
import BetaAccessScreen from './components/BetaAccessScreen';

enableScreens();

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasBetaAccess, setHasBetaAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check beta access first
        const betaAccess = await Keychain.getInternetCredentials('groovegauge.beta');
        // Check if betaAccess is not false and has the expected password
        if (betaAccess && typeof betaAccess !== 'boolean' && betaAccess.password === 'granted') {
          setHasBetaAccess(true);
        } else {
          setHasBetaAccess(false);
        }

        // Then check auth
        const credentials = await Keychain.getInternetCredentials('djemotionanalyzer.com');
        // Check if credentials exist and are not false
        if (credentials && typeof credentials !== 'boolean') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setHasBetaAccess(false);
        setIsAuthenticated(false);
      }
    };

    checkAccess();
  }, []);

  // Show loading while checking
  if (isAuthenticated === null || hasBetaAccess === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#00FFFF" />
      </View>
    );
  }

  // Determine initial route
  let initialRoute = 'Splash';
  if (!hasBetaAccess) {
    initialRoute = 'BetaAccess';
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="BetaAccess" component={BetaAccessScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}