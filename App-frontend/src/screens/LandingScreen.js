import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Linking, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Theme } from '../theme/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiService from '../services/apiService';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  useEffect(() => {
    // 1. Handle deep link when the app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // 2. Handle deep link when the app is launched from a closed state
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const handleDeepLink = async ({ url }) => {
    console.log('Deep link received:', url);
    if (!url) return;

    // Check if the URL contains the token
    const token = url.split('token=')[1];
    if (token) {
      try {
        // Save the token for persistent login!
        await SecureStore.setItemAsync('userToken', token);
        
        // Fetch the profile to confirm identity and get the user object
        const user = await apiService.getProfile(token);
        // Success! Go to the Dashboard
        navigation.replace('MainTabs', { token, user });
      } catch (error) {
        console.error('Failed to fetch profile after login:', error);
        Alert.alert('Login Error', 'Failed to complete login. Please try again.');
      }
    }
  };

  const handleGoogleLogin = () => {
    // Point to your public ngrok tunnel (Full URL)
    const authUrl = 'https://pseudoviscous-holozoic-elian.ngrok-free.dev/oauth2/authorization/google';
    Linking.openURL(authUrl);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGlow} />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="lightning-bolt" size={48} color={Theme.colors.secondary} />
          <Text style={styles.logoText}>FairShare</Text>
        </View>

        <View style={styles.textGroup}>
          <Text style={styles.title}>Finance,{"\n"}Simplified.</Text>
          <Text style={styles.subtitle}>
            Balance your life, fairly. Track, settle, and optimize your debts with precision.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleGoogleLogin}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={Theme.colors.white} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, styles.googleButton]}
            onPress={handleGoogleLogin}
          >
            <MaterialCommunityIcons name="google" size={20} color={Theme.colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Login with Google</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.tagline}>Smart settling, better relationships.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center' },
  backgroundGlow: { position: 'absolute', top: -height * 0.1, right: -width * 0.2, width: width * 1.2, height: width * 1.2, borderRadius: width * 0.6, backgroundColor: Theme.colors.primary, opacity: 0.15, transform: [{ scale: 1.5 }] },
  content: { paddingHorizontal: Theme.spacing.lg, flex: 1, justifyContent: 'space-between', paddingVertical: Theme.spacing.xxl },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.xxl },
  logoText: { fontSize: 28, fontWeight: '800', color: Theme.colors.text, marginLeft: Theme.spacing.sm, letterSpacing: -1 },
  textGroup: { marginTop: Theme.spacing.xxl },
  title: { fontSize: 56, fontWeight: '900', color: Theme.colors.text, lineHeight: 64, letterSpacing: -2 },
  subtitle: { fontSize: 18, color: Theme.colors.textSecondary, marginTop: Theme.spacing.md, lineHeight: 28 },
  buttonGroup: { marginTop: Theme.spacing.xxl },
  primaryButton: { backgroundColor: Theme.colors.primary, paddingVertical: Theme.spacing.lg, paddingHorizontal: Theme.spacing.xl, borderRadius: Theme.borderRadius.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Theme.spacing.md },
  googleButton: { backgroundColor: '#DB4437' }, // Google Red
  buttonText: { color: Theme.colors.white, fontSize: 18, fontWeight: '700', marginRight: Theme.spacing.sm },
  tagline: { textAlign: 'center', color: Theme.colors.textSecondary, fontSize: 14, fontWeight: '500', opacity: 0.6 }
});

export default LandingScreen;
