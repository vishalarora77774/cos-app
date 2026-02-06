import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Switch } from 'react-native';
import { Card, Icon, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { useHealthDetails } from '@/hooks/use-health-details';

export default function HealthDetailsScreen() {
  const { settings, getScaledFontSize, getScaledFontWeight } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const { healthDetails, isLoading, updateHealthDetails } = useHealthDetails();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    height: healthDetails?.height || '',
    weight: healthDetails?.weight || '',
    bloodType: healthDetails?.bloodType || '',
    bloodPressureSystolic: healthDetails?.bloodPressureSystolic || '',
    bloodPressureDiastolic: healthDetails?.bloodPressureDiastolic || '',
    usesCpap: healthDetails?.usesCpap || false,
    chronicConditions: healthDetails?.chronicConditions || [],
  });

  const [newCondition, setNewCondition] = useState('');

  React.useEffect(() => {
    if (healthDetails) {
      setEditedData({
        height: healthDetails.height || '',
        weight: healthDetails.weight || '',
        bloodType: healthDetails.bloodType || '',
        bloodPressureSystolic: healthDetails.bloodPressureSystolic || '',
        bloodPressureDiastolic: healthDetails.bloodPressureDiastolic || '',
        usesCpap: healthDetails.usesCpap || false,
        chronicConditions: healthDetails.chronicConditions || [],
      });
    }
  }, [healthDetails]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Prepare data for saving - convert empty strings to undefined so they're saved as null
      const dataToSave = {
        height: editedData.height.trim() || undefined,
        weight: editedData.weight.trim() || undefined,
        bloodType: editedData.bloodType.trim() || undefined,
        bloodPressureSystolic: editedData.bloodPressureSystolic.trim() || undefined,
        bloodPressureDiastolic: editedData.bloodPressureDiastolic.trim() || undefined,
        usesCpap: editedData.usesCpap,
        chronicConditions: editedData.chronicConditions,
      };
      
      await updateHealthDetails(dataToSave);
      setIsEditing(false);
      // Show success feedback (you can add a toast notification here if needed)
      console.log('✅ Health details saved successfully');
    } catch (error) {
      console.error('❌ Error saving health details:', error);
      // You can add error toast notification here
      alert('Failed to save health details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (healthDetails) {
      setEditedData({
        height: healthDetails.height || '',
        weight: healthDetails.weight || '',
        bloodType: healthDetails.bloodType || '',
        bloodPressureSystolic: healthDetails.bloodPressureSystolic || '',
        bloodPressureDiastolic: healthDetails.bloodPressureDiastolic || '',
        usesCpap: healthDetails.usesCpap || false,
        chronicConditions: healthDetails.chronicConditions || [],
      });
    }
    setIsEditing(false);
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setEditedData({
        ...editedData,
        chronicConditions: [...editedData.chronicConditions, newCondition.trim()],
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setEditedData({
      ...editedData,
      chronicConditions: editedData.chronicConditions.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon source="arrow-left" size={getScaledFontSize(24)} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: getScaledFontSize(20), fontWeight: getScaledFontWeight(600) as any }]}>
            Health Details
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(400) as any }]}>
            Loading health details...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon source="arrow-left" size={getScaledFontSize(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: getScaledFontSize(20), fontWeight: getScaledFontWeight(600) as any }]}>
          Health Details
        </Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Icon source="pencil" size={getScaledFontSize(24)} color={colors.tint} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Height */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Text style={[styles.label, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
              Height
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, fontSize: getScaledFontSize(16) }]}
                value={editedData.height}
                onChangeText={(text) => setEditedData({ ...editedData, height: text })}
                placeholder="e.g., 182 cm"
                placeholderTextColor={colors.text + '60'}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(400) as any }]}>
                {healthDetails?.height || 'Not set'}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Weight */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Text style={[styles.label, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
              Weight
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, fontSize: getScaledFontSize(16) }]}
                value={editedData.weight}
                onChangeText={(text) => setEditedData({ ...editedData, weight: text })}
                placeholder="e.g., 111.1 kg"
                placeholderTextColor={colors.text + '60'}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(400) as any }]}>
                {healthDetails?.weight || 'Not set'}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Blood Type */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Text style={[styles.label, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
              Blood Type
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, fontSize: getScaledFontSize(16) }]}
                value={editedData.bloodType}
                onChangeText={(text) => setEditedData({ ...editedData, bloodType: text })}
                placeholder="e.g., O+, A-, B+"
                placeholderTextColor={colors.text + '60'}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(400) as any }]}>
                {healthDetails?.bloodType || 'Not set'}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Blood Pressure */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Text style={[styles.label, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
              Blood Pressure
            </Text>
            {isEditing ? (
              <View style={styles.bpContainer}>
                <TextInput
                  style={[styles.bpInput, { color: colors.text, borderColor: colors.border, fontSize: getScaledFontSize(16) }]}
                  value={editedData.bloodPressureSystolic}
                  onChangeText={(text) => setEditedData({ ...editedData, bloodPressureSystolic: text })}
                  placeholder="Systolic"
                  placeholderTextColor={colors.text + '60'}
                  keyboardType="numeric"
                />
                <Text style={[styles.bpSeparator, { color: colors.text, fontSize: getScaledFontSize(16) }]}>/</Text>
                <TextInput
                  style={[styles.bpInput, { color: colors.text, borderColor: colors.border, fontSize: getScaledFontSize(16) }]}
                  value={editedData.bloodPressureDiastolic}
                  onChangeText={(text) => setEditedData({ ...editedData, bloodPressureDiastolic: text })}
                  placeholder="Diastolic"
                  placeholderTextColor={colors.text + '60'}
                  keyboardType="numeric"
                />
                <Text style={[styles.bpUnit, { color: colors.text, fontSize: getScaledFontSize(14) }]}>mm Hg</Text>
              </View>
            ) : (
              <Text style={[styles.value, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(400) as any }]}>
                {healthDetails?.bloodPressureSystolic && healthDetails?.bloodPressureDiastolic
                  ? `${healthDetails.bloodPressureSystolic}/${healthDetails.bloodPressureDiastolic} mm Hg`
                  : 'Not set'}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Uses CPAP */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <View style={styles.switchContainer}>
              <View style={styles.switchLabelContainer}>
                <Text style={[styles.label, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
                  Uses CPAP
                </Text>
                <Text style={[styles.switchDescription, { color: colors.text + '80', fontSize: getScaledFontSize(12), fontWeight: getScaledFontWeight(400) as any }]}>
                  Continuous Positive Airway Pressure device
                </Text>
              </View>
              <Switch
                value={isEditing ? editedData.usesCpap : (healthDetails?.usesCpap || false)}
                onValueChange={(value) => setEditedData({ ...editedData, usesCpap: value })}
                disabled={!isEditing}
                trackColor={{ false: colors.border, true: colors.tint + '40' }}
                thumbColor={isEditing && editedData.usesCpap ? colors.tint : colors.text + '40'}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Chronic Conditions */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Card.Content>
            <Text style={[styles.label, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
              Chronic Medical Conditions
            </Text>
            {isEditing ? (
              <View style={styles.conditionsContainer}>
                <View style={styles.addConditionContainer}>
                  <TextInput
                    style={[styles.conditionInput, { color: colors.text, borderColor: colors.border, fontSize: getScaledFontSize(14) }]}
                    value={newCondition}
                    onChangeText={setNewCondition}
                    placeholder="Add condition (e.g., Diabetes, Asthma)"
                    placeholderTextColor={colors.text + '60'}
                    onSubmitEditing={addCondition}
                  />
                  <TouchableOpacity onPress={addCondition} style={[styles.addButton, { backgroundColor: colors.tint }]}>
                    <Icon source="plus" size={getScaledFontSize(20)} color="#fff" />
                  </TouchableOpacity>
                </View>
                {editedData.chronicConditions.map((condition, index) => (
                  <View key={index} style={[styles.conditionTag, { backgroundColor: colors.tint + '20' }]}>
                    <Text style={[styles.conditionText, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                      {condition}
                    </Text>
                    <TouchableOpacity onPress={() => removeCondition(index)}>
                      <Icon source="close" size={getScaledFontSize(18)} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.conditionsList}>
                {healthDetails?.chronicConditions && healthDetails.chronicConditions.length > 0 ? (
                  healthDetails.chronicConditions.map((condition, index) => (
                    <View key={index} style={[styles.conditionTag, { backgroundColor: colors.tint + '20' }]}>
                      <Text style={[styles.conditionText, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                        {condition}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { color: colors.text + '60', fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(400) as any }]}>
                    No chronic conditions recorded
                  </Text>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {isEditing && (
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={[styles.cancelButton, { borderColor: colors.border }]}
              labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              disabled={isSaving}
              loading={isSaving}
              style={[styles.saveButton, { backgroundColor: colors.tint }]}
              labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any, color: '#fff' }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  label: {
    marginBottom: 8,
  },
  value: {
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  bpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bpInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  bpSeparator: {
    marginHorizontal: 8,
  },
  bpUnit: {
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    marginTop: 4,
  },
  conditionsContainer: {
    marginTop: 8,
  },
  addConditionContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  conditionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionsList: {
    marginTop: 8,
  },
  conditionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  conditionText: {
    flex: 1,
  },
  emptyText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
