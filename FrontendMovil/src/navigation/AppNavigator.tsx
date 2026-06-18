import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CalendarioScreen from '../screens/CalendarioScreen';
import HorarioScreen from '../screens/HorarioScreen';
import MallaScreen from '../screens/MallaScreen';
import NotasScreen from '../screens/NotasScreen';
import RamoFormScreen from '../screens/RamoFormScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { usuario, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {usuario == null ? (
          // Rutas públicas
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
          </>
        ) : (
          // Rutas privadas protegidas
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Calendario" component={CalendarioScreen} />
            <Stack.Screen name="Horario" component={HorarioScreen} />
            <Stack.Screen name="Malla" component={MallaScreen} />
            <Stack.Screen name="Notas" component={NotasScreen} />
            <Stack.Screen name="RamoForm" component={RamoFormScreen} options={{ title: 'Gestión de Ramo' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
