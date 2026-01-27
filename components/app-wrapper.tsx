import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { processFastenHealthDataFromFile } from '@/services/fasten-health-processor';
import { USE_MOCK_DATA, getFastenHealthDataName } from '@/services/fasten-health-config';
import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ConnectedHospital {
  id: string;
  name: string;
  provider: string;
  connectedDate: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
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
  const [connectedHospitals, setConnectedHospitals] = useState<ConnectedHospital[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);

  // Load clinics from FHIR data
  const loadClinics = async () => {
    setIsLoadingClinics(true);
    try {
      const dataSourceName = getFastenHealthDataName();
      console.log(`🔄 Loading clinics from ${dataSourceName} data (USE_MOCK_DATA: ${USE_MOCK_DATA})`);
      
      const processedData = await processFastenHealthDataFromFile();
      
      // Transform ProcessedClinic to ConnectedHospital format
      const hospitals: ConnectedHospital[] = processedData.clinics.map((clinic, index) => {
        // Generate a connection date (simulate connection dates over the past year)
        const connectionDate = new Date();
        connectionDate.setMonth(connectionDate.getMonth() - (index * 2)); // Stagger connection dates
        
        // Determine provider based on clinic name or use default
        const providerNames = ['EPIC', 'Cerner', 'Allscripts', 'athenahealth', 'NextGen'];
        const provider = providerNames[index % providerNames.length];
        
        // Format address
        const addressParts = [];
        if (clinic.address?.line && clinic.address.line.length > 0) {
          addressParts.push(clinic.address.line[0]);
        }
        if (clinic.address?.city) {
          addressParts.push(clinic.address.city);
        }
        if (clinic.address?.state) {
          addressParts.push(clinic.address.state);
        }
        if (clinic.address?.zip) {
          addressParts.push(clinic.address.zip);
        }
        const fullAddress = addressParts.join(', ');
        
        return {
          id: clinic.id,
          name: clinic.name,
          provider: provider,
          connectedDate: connectionDate.toISOString().split('T')[0],
          address: fullAddress || undefined,
          city: clinic.address?.city,
          state: clinic.address?.state,
          phone: clinic.phone,
          email: clinic.email,
        };
      });
      
      setConnectedHospitals(hospitals);
      console.log(`✅ Loaded ${hospitals.length} connected clinics from ${dataSourceName} data`);
      if (hospitals.length > 0) {
        console.log(`📋 Clinic names: ${hospitals.map(h => h.name).join(', ')}`);
      }
    } catch (error) {
      console.error('Error loading clinics:', error);
      // Keep empty array on error
      setConnectedHospitals([]);
    } finally {
      setIsLoadingClinics(false);
    }
  };

  // Load clinics on mount
  useEffect(() => {
    loadClinics();
  }, []);

  // Reload clinics when drawer opens to ensure fresh data
  useEffect(() => {
    if (isDrawerMenuVisible) {
      loadClinics();
    }
  }, [isDrawerMenuVisible]);

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

            {/* Loading State */}
            {isLoadingClinics && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[styles.loadingText, { color: colors.text + '80', fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                  Loading clinics...
                </Text>
              </View>
            )}

            {/* Connected Clinics List */}
            {!isLoadingClinics && connectedHospitals.length > 0 && (
              <View style={styles.connectedHospitalsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>
                  Connected Clinics ({connectedHospitals.length})
                </Text>
                {connectedHospitals.map((hospital) => (
                  <TouchableOpacity 
                    key={hospital.id}
                    style={[styles.hospitalItem, { borderBottomColor: colors.text + '10' }]}
                    onPress={() => {
                      // TODO: Handle clinic selection/view details
                      // Could navigate to a clinic detail screen showing all data from that clinic
                      closeDrawerMenu();
                    }}
                  >
                    <View style={styles.hospitalItemContent}>
                      <View style={styles.hospitalInfo}>
                        <Text style={[styles.hospitalName, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>
                          {hospital.name}
                        </Text>
                        <View style={styles.hospitalDetails}>
                          <Text style={[styles.hospitalProvider, { color: colors.text + '80', fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                            {hospital.provider}
                          </Text>
                          {hospital.address && (
                            <Text style={[styles.hospitalAddress, { color: colors.text + '70', fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(400) as any }]}>
                              {hospital.address}
                            </Text>
                          )}
                          {hospital.phone && (
                            <Text style={[styles.hospitalPhone, { color: colors.text + '70', fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(400) as any }]}>
                              📞 {hospital.phone}
                            </Text>
                          )}
                        </View>
                        <Text style={[styles.hospitalDate, { color: colors.text + '60', fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(400) as any }]}>
                          Connected on {new Date(hospital.connectedDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </Text>
                      </View>
                      <IconSymbol name="chevron.right" size={getScaledFontSize(20)} color={colors.text + '60'} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!isLoadingClinics && connectedHospitals.length === 0 && (
              <View style={styles.emptyState}>
                <IconSymbol name="building.2" size={getScaledFontSize(48)} color={colors.text + '40'} />
                <Text style={[styles.emptyStateText, { color: colors.text + '60', fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any, marginTop: 16 }]}>
                  No connected clinics yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.text + '50', fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(400) as any, marginTop: 8 }]}>
                  Connect your first EHR to get started
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
  emptyStateSubtext: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  hospitalDetails: {
    marginTop: 4,
    gap: 2,
  },
  hospitalAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  hospitalPhone: {
    fontSize: 12,
    marginTop: 2,
  },
});
