import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { checkSession } from '@/services/auth';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function SplashGate() {
  const { settings, getScaledFontWeight, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // const ok = await checkSession();
        // if (!isMounted) return;
        // if (ok) {
        //   router.replace('/(tabs)');
        // } else {
        //   router.replace('/(auth)/sign-in' as any);
        // }
        setTimeout(() => {
          router.replace('/(auth)/sign-in');
        }, 3000);
      } catch (e) {
        if (!isMounted) return;
        router.replace('/(auth)/sign-in' as any);
      } finally {
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require('@/assets/images/logo.png')} style={[{ width: getScaledFontSize(140), height: getScaledFontSize(140) }]} contentFit="contain" />
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
});


