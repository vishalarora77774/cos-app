import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Alert, ActivityIndicator } from 'react-native';
import { Card, Button, TextInput, Icon } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useProxies } from '@/hooks/use-proxies';
import { AppWrapper } from '@/components/app-wrapper';

export default function ProxyManagementScreen() {
  const { settings, getScaledFontSize, getScaledFontWeight } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const { proxies, isLoading, addProxy, removeProxy } = useProxies();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddProxy = () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    // Check if proxy already exists
    if (proxies.some(p => p.email.toLowerCase() === trimmedEmail.toLowerCase())) {
      Alert.alert('Error', 'This proxy already exists');
      return;
    }
    setPendingEmail(trimmedEmail);
    setShowAddModal(false);
    setShowConsentModal(true);
  };

  const handleConsentYes = async () => {
    setShowConsentModal(false);
    setIsAdding(true);
    try {
      await addProxy(pendingEmail);
      setEmailInput('');
      setPendingEmail('');
      Alert.alert('Success', 'Proxy has been added successfully');
    } catch (error) {
      console.error('Error adding proxy:', error);
      Alert.alert('Error', 'Failed to add proxy. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleConsentNo = () => {
    setShowConsentModal(false);
    setPendingEmail('');
    setShowAddModal(true);
  };

  const handleRemoveProxy = (proxyId: string, email: string) => {
    Alert.alert(
      'Remove Proxy',
      `Are you sure you want to remove ${email} as a proxy?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeProxy(proxyId);
              Alert.alert('Success', 'Proxy has been removed');
            } catch (error) {
              console.error('Error removing proxy:', error);
              Alert.alert('Error', 'Failed to remove proxy. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'revoked':
        return '#F44336';
      default:
        return colors.text + '80';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'revoked':
        return 'Revoked';
      default:
        return status;
    }
  };

  return (
    <AppWrapper>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Description */}
        <Card style={[styles.infoCard, { backgroundColor: colors.background }]}>
          <Card.Content>
            <Text style={[styles.infoText, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
              Proxies are individuals you authorize to access your health information. They can view and manage your medical records on your behalf.
            </Text>
          </Card.Content>
        </Card>

        {/* Add Proxy Button */}
        <Button
          mode="contained"
          onPress={() => setShowAddModal(true)}
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any, color: '#fff' }}
          icon={() => <MaterialIcons name="person-add" size={getScaledFontSize(20)} color="#fff" />}
        >
          Add Proxy
        </Button>

        {/* Proxies List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.text + '80', fontSize: getScaledFontSize(14) }]}>
              Loading proxies...
            </Text>
          </View>
        ) : proxies.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: colors.background }]}>
            <Card.Content>
              <View style={styles.emptyContent}>
                <MaterialIcons name="people-outline" size={getScaledFontSize(48)} color={colors.text + '60'} />
                <Text style={[styles.emptyText, { color: colors.text + '80', fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any }]}>
                  No proxies assigned
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.text + '60', fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                  Add a proxy to grant access to your health information
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.proxiesList}>
            {proxies.map((proxy) => (
              <Card key={proxy.id} style={[styles.proxyCard, { backgroundColor: colors.background }]}>
                <Card.Content>
                  <View style={styles.proxyContent}>
                    <View style={styles.proxyInfo}>
                      <View style={styles.proxyHeader}>
                        <MaterialIcons name="email" size={getScaledFontSize(20)} color={colors.tint} />
                        <Text style={[styles.proxyEmail, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>
                          {proxy.email}
                        </Text>
                      </View>
                      <View style={styles.proxyStatusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(proxy.status) + '20' }]}>
                          <View style={[styles.statusDot, { backgroundColor: getStatusColor(proxy.status) }]} />
                          <Text style={[styles.statusText, { color: getStatusColor(proxy.status), fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(500) as any }]}>
                            {getStatusLabel(proxy.status)}
                          </Text>
                        </View>
                        {proxy.consentDate && (
                          <Text style={[styles.consentDate, { color: colors.text + '60', fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(400) as any }]}>
                            Added {new Date(proxy.consentDate).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveProxy(proxy.id, proxy.email)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="delete-outline" size={getScaledFontSize(24)} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Proxy Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.addModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: getScaledFontSize(20), fontWeight: getScaledFontWeight(600) as any }]}>
                Add Proxy
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={getScaledFontSize(24)} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.addModalBody}>
              <Text style={[styles.inputLabel, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
                Email Address
              </Text>
              <TextInput
                mode="outlined"
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="proxy@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.emailInput}
                contentStyle={{ fontSize: getScaledFontSize(16) }}
                outlineStyle={{ borderColor: colors.text + '40', borderRadius: 12 }}
              />
              <Text style={[styles.inputHelper, { color: colors.text + '60', fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(400) as any }]}>
                Enter the email address of the person you want to grant proxy access
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddModal(false)}
                style={[styles.modalButton, { borderColor: colors.text + '40' }]}
                labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any, color: colors.text }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddProxy}
                disabled={isAdding}
                loading={isAdding}
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any, color: '#fff' }}
              >
                Continue
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Consent Modal */}
      <Modal
        visible={showConsentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleConsentNo}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: getScaledFontSize(20), fontWeight: getScaledFontWeight(600) as any }]}>
                Data Sharing Consent
              </Text>
              <TouchableOpacity onPress={handleConsentNo} style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={getScaledFontSize(24)} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              <View style={styles.consentSection}>
                <Text style={[styles.consentQuestion, { color: colors.text, fontSize: getScaledFontSize(18), fontWeight: getScaledFontWeight(600) as any }]}>
                  Do you consent to share your health-related data with {pendingEmail}?
                </Text>
                
                <Text style={[styles.consentDescription, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                  By selecting "Yes", you agree to share your health information with this proxy to allow them to view and manage your medical records on your behalf.
                </Text>
              </View>

              <View style={styles.termsSection}>
                <Text style={[styles.termsTitle, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>
                  Terms and Conditions:
                </Text>
                
                <View style={styles.termsList}>
                  <View style={styles.termItem}>
                    <MaterialIcons name="check-circle" size={getScaledFontSize(16)} color={colors.tint} />
                    <Text style={[styles.termText, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                      Your health data will be shared with the proxy for the purpose of managing your medical records.
                    </Text>
                  </View>
                  
                  <View style={styles.termItem}>
                    <MaterialIcons name="check-circle" size={getScaledFontSize(16)} color={colors.tint} />
                    <Text style={[styles.termText, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                      The proxy is required to maintain confidentiality and comply with HIPAA regulations.
                    </Text>
                  </View>
                  
                  <View style={styles.termItem}>
                    <MaterialIcons name="check-circle" size={getScaledFontSize(16)} color={colors.tint} />
                    <Text style={[styles.termText, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                      You have the right to revoke this consent at any time by removing the proxy.
                    </Text>
                  </View>
                  
                  <View style={styles.termItem}>
                    <MaterialIcons name="check-circle" size={getScaledFontSize(16)} color={colors.tint} />
                    <Text style={[styles.termText, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                      Your data will be shared securely and only with authorized personnel.
                    </Text>
                  </View>
                  
                  <View style={styles.termItem}>
                    <MaterialIcons name="check-circle" size={getScaledFontSize(16)} color={colors.tint} />
                    <Text style={[styles.termText, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                      The proxy will not sell or share your data with third parties without your explicit consent.
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={handleConsentNo}
                style={[styles.modalButton, { borderColor: colors.text + '40' }]}
                labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any, color: colors.text }}
              >
                No
              </Button>
              <Button
                mode="contained"
                onPress={handleConsentYes}
                disabled={isAdding}
                loading={isAdding}
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any, color: '#fff' }}
              >
                Yes, I Consent
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </AppWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  infoText: {
    lineHeight: 20,
  },
  addButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    marginTop: 0,
  },
  emptyCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
  },
  proxiesList: {
    gap: 12,
  },
  proxyCard: {
    borderRadius: 12,
    marginBottom: 0,
  },
  proxyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proxyInfo: {
    flex: 1,
  },
  proxyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  proxyEmail: {
    flex: 1,
  },
  proxyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    textTransform: 'capitalize',
  },
  consentDate: {
    marginTop: 0,
  },
  removeButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addModalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    paddingBottom: 32,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignSelf: 'center',
    margin: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  addModalBody: {
    padding: 20,
  },
  inputLabel: {
    marginBottom: 8,
  },
  emailInput: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  inputHelper: {
    marginTop: 4,
  },
  modalScrollView: {
    maxHeight: 400,
    padding: 20,
  },
  consentSection: {
    marginBottom: 24,
  },
  consentQuestion: {
    marginBottom: 12,
  },
  consentDescription: {
    lineHeight: 20,
  },
  termsSection: {
    marginTop: 8,
  },
  termsTitle: {
    marginBottom: 16,
  },
  termsList: {
    gap: 12,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termText: {
    flex: 1,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
});
