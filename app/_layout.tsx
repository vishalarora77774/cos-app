import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AccessibilityProvider } from '@/stores/accessibility-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AccessibilityProvider>
      <PaperProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            {/** Splash at index - decides where to go. */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/** Auth stack - sign-in / sign-up */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            {/** Main tabs */}
            <Stack.Screen name="Home" options={{ headerShown: false }} />
            <Stack.Screen 
              name="modal" 
              options={{ 
                presentation: 'modal', 
                title: 'Doctors',
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="appointments-modal" 
              options={{ 
                presentation: 'modal', 
                title: 'All Appointments',
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="today-schedule" 
              options={{ 
                title: "Today's Schedule",
                headerShown: false,
                autoHideHomeIndicator: true,
              }} 
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </AccessibilityProvider>
  );
}
