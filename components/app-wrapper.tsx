import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppWrapperProps {
  children: React.ReactNode;
  showFooter?: boolean;
  notificationCount?: number;
  showAccessibilityIcon?: boolean;
  showLogo?: boolean;
  showBellIcon?: boolean;
}

export function AppWrapper({ 
  children, 
  notificationCount = 0, 
  showAccessibilityIcon = true, 
  showLogo = true, 
  showBellIcon = true 
}: AppWrapperProps) {
  const { settings, increaseFontSize, decreaseFontSize, toggleBoldText, toggleTheme, getScaledFontWeight, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const pathname = usePathname();
  const [isAccessibilityModalVisible, setIsAccessibilityModalVisible] = useState(false);

  const handleTabPress = (route: string) => {
    router.push(`/(tabs)/${route}` as any);
  };

  const handleNotificationPress = () => {
    // setIsAccessibilityModalVisible(true);
  };

  const handleAccessibilityPress = () => {
    setIsAccessibilityModalVisible(true);
  };

  const closeAccessibilityModal = () => {
    setIsAccessibilityModalVisible(false);
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background}]}>
        <View style={styles.headerContent}>
          {/* Accessibility Icon */}
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
          
          {/* Logo */}
          {showLogo && (
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                contentFit="contain"
                style={{ width: getScaledFontSize(40), height: getScaledFontSize(40) }}
              />
            </View>
          )}
          
          {/* Notification Bell */}
          {showBellIcon && (
            <TouchableOpacity 
              style={styles.notificationContainer}
              onPress={handleNotificationPress}
            >
              <IconSymbol 
                name="bell.fill" 
                size={getScaledFontSize(24)} 
                color={colors.text} 
              />
              {notificationCount > 0 && (
                <View style={[styles.notificationBadge]}>
                  <Text style={[styles.notificationText, { fontSize: getScaledFontSize(10)}]}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

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
});
