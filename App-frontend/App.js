import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettleUpScreen from './src/screens/SettleUpScreen';
import ManagePersonsScreen from './src/screens/ManagePersonsScreen';

// Services & Theme
import apiService from './src/services/apiService';
import { Theme } from './src/theme/Theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }) {
  const { token, user } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'view-dashboard';
          else if (route.name === 'Settle Up') iconName = 'hand-coin';
          else if (route.name === 'People') iconName = 'account-group';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textSecondary,
        tabBarStyle: {
          height: 70,
          paddingBottom: 4,
          paddingTop: 1,
          backgroundColor: Theme.colors.background,
          borderTopWidth: 5,
          borderTopColor: Theme.colors.primary,
          elevation: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        initialParams={{ token, user }}
      />
      <Tab.Screen
        name="Settle Up"
        component={SettleUpScreen}
        initialParams={{ token, user }}
      />
      <Tab.Screen
        name="People"
        component={ManagePersonsScreen}
        initialParams={{ token, user }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Landing');
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          // Attempt to fetch profile to verify token
          const user = await apiService.getProfile(token);
          setAuthData({ token, user });
          setInitialRoute('MainTabs');
        }
      } catch (e) {
        console.log('Token verification failed or no token found');
        await SecureStore.deleteItemAsync('userToken');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          initialParams={authData}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
