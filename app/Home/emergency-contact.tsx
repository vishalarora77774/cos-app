import { AppWrapper } from '@/components/app-wrapper';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { useEmergencyContact } from '@/hooks/use-emergency-contact';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Card, List } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function EmergencyContactScreen() {
  const { settings, getScaledFontWeight, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const { emergencyContacts, isLoading } = useEmergencyContact();

  return (
    <AppWrapper showHamburgerIcon={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={getScaledFontSize(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text, fontSize: getScaledFontSize(20), fontWeight: getScaledFontWeight(600) as any }]}>
          Emergency Contacts
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
          </View>
        ) : emergencyContacts.length === 0 ? (
          <Card style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Card.Content>
              <View style={styles.emptyContainer}>
                <IconSymbol name="person.crop.circle.badge.exclamationmark" size={getScaledFontSize(48)} color={colors.text + '60'} />
                <Text style={[styles.emptyText, { color: colors.text + '80', fontSize: getScaledFontSize(16) }]}>
                  No emergency contacts found
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.text + '60', fontSize: getScaledFontSize(14) }]}>
                  Emergency contacts will appear here when available from your connected clinics.
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          emergencyContacts.map((contact, index) => (
            <Card 
              key={contact.id} 
              style={[
                styles.card, 
                { 
                  backgroundColor: colors.cardBackground,
                  marginBottom: index < emergencyContacts.length - 1 ? 16 : 0,
                }
              ]}
            >
              <Card.Content>
                <View style={styles.clinicHeader}>
                  <IconSymbol name="building.2" size={getScaledFontSize(20)} color={colors.primary} />
                  <Text style={[styles.clinicName, { color: colors.primary, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(600) as any }]}>
                    {contact.clinicName}
                  </Text>
                </View>

                <View style={styles.contactInfo}>
                  <View style={styles.infoRow}>
                    <IconSymbol name="person.fill" size={getScaledFontSize(20)} color={colors.text + '80'} />
                    <View style={styles.infoContent}>
                      <Text style={[styles.label, { color: colors.text + '80', fontSize: getScaledFontSize(12) }]}>Name</Text>
                      <Text style={[styles.value, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(600) as any }]}>
                        {contact.name}
                      </Text>
                    </View>
                  </View>

                  {contact.relationship && (
                    <View style={styles.infoRow}>
                      <IconSymbol name="person.2.fill" size={getScaledFontSize(20)} color={colors.text + '80'} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.label, { color: colors.text + '80', fontSize: getScaledFontSize(12) }]}>Relationship</Text>
                        <Text style={[styles.value, { color: colors.text, fontSize: getScaledFontSize(16) }]}>
                          {contact.relationship}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <IconSymbol name="phone.fill" size={getScaledFontSize(20)} color={colors.text + '80'} />
                    <View style={styles.infoContent}>
                      <Text style={[styles.label, { color: colors.text + '80', fontSize: getScaledFontSize(12) }]}>Phone</Text>
                      <Text style={[styles.value, { color: colors.text, fontSize: getScaledFontSize(16) }]}>
                        {contact.phone}
                      </Text>
                    </View>
                  </View>

                  {contact.email && (
                    <View style={styles.infoRow}>
                      <IconSymbol name="envelope.fill" size={getScaledFontSize(20)} color={colors.text + '80'} />
                      <View style={styles.infoContent}>
                        <Text style={[styles.label, { color: colors.text + '80', fontSize: getScaledFontSize(12) }]}>Email</Text>
                        <Text style={[styles.value, { color: colors.text, fontSize: getScaledFontSize(16) }]}>
                          {contact.email}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </AppWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  clinicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  clinicName: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactInfo: {
    paddingTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
});
