import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Card, Icon, TextInput as PaperTextInput } from 'react-native-paper';

export default function PersonalInfoScreen() {
  const { settings, getScaledFontWeight, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const userImg = require('@/assets/images/dummy.jpg');

  const [formData, setFormData] = useState({
    name: 'Jenny Wilson',
    email: 'jenny.wilson@email.com',
    phone: '+1 234 567 8900',
    dateOfBirth: '1990-05-15',
    gender: 'Female',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
  });

  const handleSave = () => {
    // Handle save logic here
    console.log('Form data:', formData);
    router.back();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon source="arrow-left" size={getScaledFontSize(32)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          {
            color: colors.text,
            fontSize: getScaledFontSize(20),
            fontWeight: getScaledFontWeight(600) as any,
          }
        ]}>Personal Information</Text>
        <View style={{ width: getScaledFontSize(32) }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <Avatar.Image
              source={userImg}
              size={getScaledFontSize(120)}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editPhotoButton}>
              <Icon source="camera" size={getScaledFontSize(20)} color="#fff" />
            </TouchableOpacity>
            <Text style={[
              styles.photoLabel,
              {
                color: colors.text,
                fontSize: getScaledFontSize(14),
                fontWeight: getScaledFontWeight(500) as any,
              }
            ]}>Update Profile Photo</Text>
          </View>

          {/* Form Section */}
          <Card style={[styles.formCard, { backgroundColor: colors.background }]}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(500) as any,
                }
              ]}>Full Name</Text>
              <PaperTextInput
                mode="outlined"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                style={styles.input}
                contentStyle={[
                  styles.inputContent,
                  { fontSize: getScaledFontSize(16) }
                ]}
                outlineStyle={styles.inputOutline}
              />
            </View>

            {/* Email - Disabled */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(500) as any,
                }
              ]}>Email</Text>
              <PaperTextInput
                mode="outlined"
                value={formData.email}
                editable={false}
                style={[styles.input, styles.disabledInput]}
                contentStyle={[
                  styles.inputContent,
                  { fontSize: getScaledFontSize(16) }
                ]}
                outlineStyle={styles.inputOutline}
              />
              <Text style={[
                styles.disabledHelperText,
                { fontSize: getScaledFontSize(12) }
              ]}>Email cannot be changed</Text>
            </View>

            {/* Phone - Disabled */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(500) as any,
                }
              ]}>Phone Number</Text>
              <PaperTextInput
                mode="outlined"
                value={formData.phone}
                editable={false}
                style={[styles.input, styles.disabledInput]}
                contentStyle={[
                  styles.inputContent,
                  { fontSize: getScaledFontSize(16) }
                ]}
                outlineStyle={styles.inputOutline}
              />
              <Text style={[
                styles.disabledHelperText,
                { fontSize: getScaledFontSize(12) }
              ]}>Phone number cannot be changed</Text>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(500) as any,
                }
              ]}>Date of Birth</Text>
              <PaperTextInput
                mode="outlined"
                value={formData.dateOfBirth}
                onChangeText={(text) => handleChange('dateOfBirth', text)}
                placeholder="YYYY-MM-DD"
                style={styles.input}
                contentStyle={[
                  styles.inputContent,
                  { fontSize: getScaledFontSize(16) }
                ]}
                outlineStyle={styles.inputOutline}
              />
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(500) as any,
                }
              ]}>Gender</Text>
              <PaperTextInput
                mode="outlined"
                value={formData.gender}
                onChangeText={(text) => handleChange('gender', text)}
                style={styles.input}
                contentStyle={[
                  styles.inputContent,
                  { fontSize: getScaledFontSize(16) }
                ]}
                outlineStyle={styles.inputOutline}
              />
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(500) as any,
                }
              ]}>Address</Text>
              <PaperTextInput
                mode="outlined"
                value={formData.address}
                onChangeText={(text) => handleChange('address', text)}
                style={styles.input}
                contentStyle={[
                  styles.inputContent,
                  { fontSize: getScaledFontSize(16) }
                ]}
                outlineStyle={styles.inputOutline}
              />
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getScaledFontSize(14),
                  fontWeight: getScaledFontWeight(500) as any,
                }
              ]}>City</Text>
              <PaperTextInput
                mode="outlined"
                value={formData.city}
                onChangeText={(text) => handleChange('city', text)}
                style={styles.input}
                contentStyle={[
                  styles.inputContent,
                  { fontSize: getScaledFontSize(16) }
                ]}
                outlineStyle={styles.inputOutline}
              />
            </View>

            {/* State and Zip Code Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[
                  styles.label,
                  {
                    color: colors.text,
                    fontSize: getScaledFontSize(14),
                    fontWeight: getScaledFontWeight(500) as any,
                  }
                ]}>State</Text>
                <PaperTextInput
                  mode="outlined"
                  value={formData.state}
                  onChangeText={(text) => handleChange('state', text)}
                  style={styles.input}
                  contentStyle={[
                    styles.inputContent,
                    { fontSize: getScaledFontSize(16) }
                  ]}
                  outlineStyle={styles.inputOutline}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[
                  styles.label,
                  {
                    color: colors.text,
                    fontSize: getScaledFontSize(14),
                    fontWeight: getScaledFontWeight(500) as any,
                  }
                ]}>Zip Code</Text>
                <PaperTextInput
                  mode="outlined"
                  value={formData.zipCode}
                  onChangeText={(text) => handleChange('zipCode', text)}
                  style={styles.input}
                  contentStyle={[
                    styles.inputContent,
                    { fontSize: getScaledFontSize(16) }
                  ]}
                  outlineStyle={styles.inputOutline}
                />
              </View>
            </View>
          </Card>

          {/* Save Button */}
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            labelStyle={[
              styles.saveButtonLabel,
              {
                fontSize: getScaledFontSize(16),
                fontWeight: getScaledFontWeight(600) as any,
              }
            ]}
          >
            Save Changes
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    marginBottom: 12,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 58,
    right: '42%',
    backgroundColor: '#0a7ea4',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  photoLabel: {
    marginTop: 8,
  },
  formCard: {
    marginBottom: 24,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputContent: {
    height: 48,
  },
  inputOutline: {
    borderColor: '#e0e0e0',
    borderRadius: 12,
  },
  disabledInput: {
    opacity: 0.6,
  },
  disabledHelperText: {
    color: '#888',
    marginTop: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: 32,
  },
  saveButtonLabel: {
    paddingVertical: 8,
  },
});

