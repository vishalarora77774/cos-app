import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ConnectedHospital {
  id: string;
  name: string;
  provider: string;
  connectedDate: string;
}

interface AppWrapperProps {
  children: React.ReactNode;
  showFooter?: boolean;
  notificationCount?: number;
  showAccessibilityIcon?: boolean;
  showLogo?: boolean;
  showBellIcon?: boolean;
  showHamburgerIcon?: boolean;
}

// Mock data for connected hospitals - replace with actual data source later
const mockConnectedHospitals: ConnectedHospital[] = [
  {
    id: '1',
    name: 'Mayo Clinic',
    provider: 'EPIC',
    connectedDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Cleveland Clinic',
    provider: 'Cerner',
    connectedDate: '2024-02-20',
  },
];

export function AppWrapper({ 
  children, 
  notificationCount = 0, 
  showAccessibilityIcon = true, 
  showLogo = true, 
  showBellIcon = false,
  showHamburgerIcon = true
}: AppWrapperProps) {
  const { settings, increaseFontSize, decreaseFontSize, toggleBoldText, toggleTheme, getScaledFontWeight, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const pathname = usePathname();
  const [isAccessibilityModalVisible, setIsAccessibilityModalVisible] = useState(false);
  const [isDrawerMenuVisible, setIsDrawerMenuVisible] = useState(false);
  const [connectedHospitals] = useState<ConnectedHospital[]>(mockConnectedHospitals);

  const handleTabPress = (route: string) => {
    router.push(`/(tabs)/${route}` as any);
  };

  const handleNotificationPress = () => {
    // setIsAccessibilityModalVisible(true);
  };

  const handleAccessibilityPress = () => {
    setIsAccessibilityModalVisible(true);
  };

  const handleHamburgerPress = () => {
    setIsDrawerMenuVisible(true);
  };

  const closeAccessibilityModal = () => {
    setIsAccessibilityModalVisible(false);
  };

  const closeDrawerMenu = () => {
    setIsDrawerMenuVisible(false);
  };

  const handleConnectEHR = () => {
    // TODO: Implement EHR connection flow
    closeDrawerMenu();
    // Navigate to provider selection or EHR connection screen
    router.push('/(auth)/provider-selection');
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background}]}>
        <View style={styles.headerContent}>
          {/* Left side - Hamburger or spacer */}
          <View style={styles.headerLeft}>
            {showHamburgerIcon && (
              <TouchableOpacity 
                style={styles.hamburgerContainer}
                onPress={handleHamburgerPress}
              >
                <IconSymbol 
                  name="list.bullet" 
                  size={getScaledFontSize(28)} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Center - Logo */}
          {showLogo && (
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                contentFit="contain"
                style={{ width: getScaledFontSize(40), height: getScaledFontSize(40) }}
              />
            </View>
          )}
          
          {/* Right side - Accessibility Icon */}
          <View style={styles.headerRight}>
            {showAccessibilityIcon && (
              <TouchableOpacity 
                style={styles.accessibilityContainer}
                onPress={handleAccessibilityPress}
              >
                <IconSymbol 
                  name="accessibility" 
                  size={getScaledFontSize(32)} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Drawer Menu Modal */}
      <Modal
        visible={isDrawerMenuVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDrawerMenu}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.text + '20' }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: getScaledFontSize(20), fontWeight: getScaledFontWeight(600) as any }]}>EHR Connections</Text>
            <TouchableOpacity onPress={closeDrawerMenu}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Connect Another EHR Option */}
            <TouchableOpacity 
              style={[styles.ehrOption, { borderBottomColor: colors.text + '20' }]}
              onPress={handleConnectEHR}
            >
              <View style={styles.ehrOptionContent}>
                <IconSymbol name="plus" size={getScaledFontSize(24)} color={colors.tint} />
                <Text style={[styles.ehrOptionText, { color: colors.tint, fontSize: getScaledFontSize(18), fontWeight: getScaledFontWeight(600) as any }]}>
                  Connect Another EHR
                </Text>
              </View>
            </TouchableOpacity>

            {/* Divider */}
            {connectedHospitals.length > 0 && (
              <View style={[styles.divider, { backgroundColor: colors.text + '20' }]} />
            )}

            {/* Connected Hospitals List */}
            {connectedHospitals.length > 0 && (
              <View style={styles.connectedHospitalsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>
                  Connected Hospitals
                </Text>
                {connectedHospitals.map((hospital) => (
                  <TouchableOpacity 
                    key={hospital.id}
                    style={[styles.hospitalItem, { borderBottomColor: colors.text + '10' }]}
                    onPress={() => {
                      // TODO: Handle hospital selection/view details
                      closeDrawerMenu();
                    }}
                  >
                    <View style={styles.hospitalItemContent}>
                      <View style={styles.hospitalInfo}>
                        <Text style={[styles.hospitalName, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>
                          {hospital.name}
                        </Text>
                        <Text style={[styles.hospitalProvider, { color: colors.text + '80', fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                          {hospital.provider}
                        </Text>
                        <Text style={[styles.hospitalDate, { color: colors.text + '60', fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(400) as any }]}>
                          Connected on {new Date(hospital.connectedDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <IconSymbol name="chevron.right" size={getScaledFontSize(20)} color={colors.text + '60'} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {connectedHospitals.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.text + '60', fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                  No connected hospitals yet
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Accessibility Modal */}
      <Modal
        visible={isAccessibilityModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAccessibilityModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: getScaledFontSize(20), fontWeight: getScaledFontWeight(600) as any }]}>Accessibility Options</Text>
            <TouchableOpacity onPress={closeAccessibilityModal}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.accessibilitySection}>
              <View style={styles.textSizeContainer}>
                <IconSymbol name="textformat.size" size={getScaledFontSize(20)} color={colors.text} />
                <Text style={[styles.optionText, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any }]}>Text Size</Text>
                <View style={styles.fontSizeControls}>
                  <TouchableOpacity 
                    style={[styles.fontSizeButton]}
                    onPress={decreaseFontSize}
                  >
                    <IconSymbol name="minus" size={16} color="white" />
                  </TouchableOpacity>
                  <Text style={[styles.fontSizeDisplay, { color: colors.text }]}>{settings.fontSizeScale}%</Text>
                  <TouchableOpacity 
                    style={[styles.fontSizeButton]}
                    onPress={increaseFontSize}
                  >
                    <IconSymbol name="plus" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.boldTextContainer}>
                <IconSymbol name="bold" size={getScaledFontSize(20)} color={colors.text} />
                <Text style={[styles.optionText, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any }]}>Bold Text</Text>
                <TouchableOpacity 
                  style={[
                    styles.toggleButton, 
                    { 
                      backgroundColor: settings.isBoldTextEnabled ? '#0a7ea4' : '#E0E0E0' 
                    }
                  ]}
                  onPress={toggleBoldText}
                >
                  <View 
                    style={[
                      styles.toggleThumb, 
                      { 
                        backgroundColor: 'white',
                        transform: [{ translateX: settings.isBoldTextEnabled ? 16 : 2 }]
                      }
                    ]} 
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.themeContainer}>
                <IconSymbol name="circle.fill" size={getScaledFontSize(20)} color={colors.text} />
                <Text style={[styles.optionText, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any }]}>Theme</Text>
                <View style={styles.themeToggle}>
                  <Text style={[styles.themeLabel, { color: !settings.isDarkTheme ? colors.tint : colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>Light</Text>
                  <TouchableOpacity 
                    style={[
                      styles.toggleButton, 
                      { 
                        backgroundColor: settings.isDarkTheme ? '#0a7ea4' : '#E0E0E0' 
                      }
                    ]}
                    onPress={toggleTheme}
                  >
                    <View 
                      style={[
                        styles.toggleThumb, 
                        { 
                          backgroundColor: 'white',
                          transform: [{ translateX: settings.isDarkTheme ? 16 : 2 }]
                        }
                      ]} 
                    />
                  </TouchableOpacity>
                  <Text style={[styles.themeLabel, { color: settings.isDarkTheme ? colors.tint : colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>Dark</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    width: 44, // Fixed width to match icon container size
    alignItems: 'flex-start',
  },
  headerRight: {
    width: 44, // Fixed width to match icon container size
    alignItems: 'flex-end',
  },
  hamburgerContainer: {
    padding: 8,
  },
  accessibilityContainer: {
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  notificationContainer: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    backgroundColor: '#0a7ea4',
  },
  notificationText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  accessibilitySection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  accessibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  textSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fontSizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
  },
  fontSizeDisplay: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  boldTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  themeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  ehrOption: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  ehrOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ehrOptionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
    marginHorizontal: 20,
  },
  connectedHospitalsSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  hospitalItem: {
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  hospitalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hospitalInfo: {
    flex: 1,
    gap: 4,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hospitalProvider: {
    fontSize: 14,
    marginBottom: 4,
  },
  hospitalDate: {
    fontSize: 12,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
  },
});
