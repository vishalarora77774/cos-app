import { useAccessibility } from '@/stores/accessibility-store';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Switch, Text } from 'react-native-paper';
import { InitialsAvatar } from '@/utils/avatar-utils';

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

  const dynamicPadding = getScaledFontSize(16);
  const avatarSize = getScaledFontSize(48);
  const cardMargin = getScaledFontSize(12);

  return (
    <Card style={[styles.card, { marginBottom: cardMargin }]} onPress={onPress}>
      <Card.Content style={[styles.cardContent, { padding: dynamicPadding }]}>
        <View style={styles.contentRow}>
          {image ? (
            <Avatar.Image
              size={avatarSize}
              source={image}
              style={[styles.avatar, { marginRight: dynamicPadding }]}
            />
          ) : (
            <InitialsAvatar
              name={name}
              size={avatarSize}
              style={[styles.avatar, { marginRight: dynamicPadding }]}
            />
          )}
          <View style={styles.textContainer}>
            <Text 
              style={[
                styles.title,
                {
                  fontSize: getScaledFontSize(16),
                  fontWeight: getScaledFontWeight(600) as any,
                  marginBottom: getScaledFontSize(4),
                }
              ]}
              numberOfLines={2}
            >
              {name}
            </Text>
            <Text 
              style={[
                styles.subtitle,
                {
                  fontSize: getScaledFontSize(12),
                  fontWeight: getScaledFontWeight(500) as any,
                }
              ]}
              numberOfLines={2}
            >
              {qualifications}
            </Text>
          </View>
          {showSwitch && (
            <View style={[styles.switchContainer, { paddingLeft: dynamicPadding }]}>
              <Switch
                value={switchValue}
                onValueChange={onSwitchChange}
                color="#4CAF50"
              />
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
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
    flexShrink: 0,
  },
});
