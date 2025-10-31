import { useAccessibility } from '@/stores/accessibility-store';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Switch, Text } from 'react-native-paper';

interface DoctorCardProps {
  id: string;
  name: string;
  qualifications: string;
  image: any;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
}

export function DoctorCard({
  id,
  name,
  qualifications,
  image,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  onPress,
}: DoctorCardProps) {
  const { getScaledFontSize, getScaledFontWeight } = useAccessibility();

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Title
        title={
          <Text style={[
            styles.title,
            {
              paddingLeft: getScaledFontSize(16),
              fontSize: getScaledFontSize(16),
              fontWeight: getScaledFontWeight(600) as any,
            }
          ]}>
            {name}
          </Text>
        }
        subtitle={
          <Text style={[
            styles.subtitle,
            {
              paddingLeft: getScaledFontSize(16),
              fontSize: getScaledFontSize(12),
              fontWeight: getScaledFontWeight(500) as any,
            }
          ]}>
            {qualifications}
          </Text>
        }
        left={() => (
          <Avatar.Image
            size={getScaledFontSize(48)}
            source={image}
            style={styles.avatar}
          />
        )}
        right={() => showSwitch ? (
          <View style={styles.switchContainer}>
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              color="#4CAF50"
            />
          </View>
        ) : null}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  title: {
    // Styles will be applied via inline styles for accessibility
  },
  subtitle: {
    // Styles will be applied via inline styles for accessibility
  },
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 16,
  },
});
