import { NavigationContainer } from '@react-navigation/native';
import AuthScreen from "./components/AuthScreen";
import MainScreen from './components/MainScreen';
import HowToUseScreen from './components/HowToUseScreen';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import SplashScreen from './components/SplashScreen';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import * as Keychain from 'react-native-keychain';


enableScreens();

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // check whether the user's JWT token is stored in async storage; i.e. whether they are logged in
  // useEffect(() => {
  //   const checkToken = async () => {
  //     const token = await AsyncStorage.getItem('token');
  //     console.log("Token in App: ", token)
  //     setIsAuthenticated(!!token);
  //   };

  //   checkToken();
  // });

  useEffect(() => {
    const checkToken = async () => {
      try {
        const credentials = await Keychain.getInternetCredentials('djemotionanalyzer.com');
        console.log("Token in App: ", credentials ? 'Token exists' : 'No token');
        setIsAuthenticated(!!credentials);
      } catch (error) {
        console.error('Keychain error:', error);
        setIsAuthenticated(false);
      }
    };

    checkToken();
  });


  // show loading screen if not authenticated
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
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
            ...TransitionPresets.SlideFromLeftIOS, 
            gestureDirection: 'vertical', 
            headerShown: false,
          }}
        />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="HowToUse" component={HowToUseScreen} />
      </Stack.Navigator>

    </NavigationContainer>
  );
}

