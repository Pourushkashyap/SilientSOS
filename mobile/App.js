import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalculatorScreen from './src/screens/CalculatorScreen';
import HiddenSetupScreen from './src/screens/HiddenSetupScreen';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const initTF = async () => {
      await tf.ready();
    };
    initTF();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Calculator" component={CalculatorScreen} />
        <Stack.Screen name="Setup" component={HiddenSetupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
