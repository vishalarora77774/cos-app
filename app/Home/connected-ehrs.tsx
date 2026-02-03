import { AppWrapper } from '@/components/app-wrapper';
import { ProfileContent } from '@/components/profile-content';
import { Colors } from '@/constants/theme';
import { useConnectedEhrs } from '@/hooks/use-connected-ehrs';
import { useAccessibility } from '@/stores/accessibility-store';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ConnectedEhrsScreen() {
  const { settings, getScaledFontWeight, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const { connectedHospitals, isLoadingClinics } = useConnectedEhrs();

  return (
    <AppWrapper showHamburgerIcon={false}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text, fontSize: getScaledFontSize(20), fontWeight: getScaledFontWeight(600) as any }]}>
          Connected EHRs{connectedHospitals.length > 0 ? ` (${connectedHospitals.length})` : ''}
        </Text>
      </View>

      <ProfileContent
        showProfileHeader={false}
        showProfileMenu={false}
        showSignOut={false}
        showEhrSection
        showEhrTitle={false}
        connectedHospitals={connectedHospitals}
        isLoadingClinics={isLoadingClinics}
        onConnectEhr={() => router.push('/(auth)/provider-selection')}
        containerStyle={styles.contentContainer}
      />
    </AppWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
});
