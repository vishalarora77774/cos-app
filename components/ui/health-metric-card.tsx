import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useAccessibility } from '@/stores/accessibility-store';

export interface HealthMetricCardProps {
  /** Title of the metric */
  title: string;
  /** Current value */
  value: string;
  /** Unit of measurement */
  unit?: string;
  /** Status: 'good', 'warning', 'critical', or 'normal' */
  status?: 'good' | 'warning' | 'critical' | 'normal';
  /** Icon name from Material Icons */
  icon?: string;
  /** Icon color */
  iconColor?: string;
  /** Background color for icon container */
  iconBackgroundColor?: string;
  /** Additional information or trend */
  trend?: string;
  /** Target or reference value */
  target?: string;
}

export function HealthMetricCard({
  title,
  value,
  unit,
  status = 'normal',
  icon,
  iconColor,
  iconBackgroundColor,
  trend,
  target,
}: HealthMetricCardProps) {
  const { settings, getScaledFontSize, getScaledFontWeight } = useAccessibility();
  const isDark = settings.isDarkTheme;

  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'critical':
        return '#ff4444';
      default:
        return isDark ? '#9BA1A6' : '#687076';
    }
  };

  const defaultIconColor = iconColor || getStatusColor();
  const defaultIconBg = iconBackgroundColor || (isDark ? '#2a2a2a' : '#e8f4f8');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#252525' : '#f9f9f9',
          borderRadius: 16,
          padding: getScaledFontSize(16),
        },
      ]}
    >
      <View style={styles.header}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: defaultIconBg,
                width: getScaledFontSize(40),
                height: getScaledFontSize(40),
                borderRadius: getScaledFontSize(10),
              },
            ]}
          >
            <Icon source={icon} size={getScaledFontSize(24)} color={defaultIconColor} />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                color: isDark ? '#ECEDEE' : '#11181C',
                fontSize: getScaledFontSize(14),
                fontWeight: getScaledFontWeight(500) as any,
              },
            ]}
          >
            {title}
          </Text>
          {target && (
            <Text
              style={[
                styles.target,
                {
                  color: isDark ? '#9BA1A6' : '#687076',
                  fontSize: getScaledFontSize(12),
                  fontWeight: getScaledFontWeight(400) as any,
                  marginTop: getScaledFontSize(2),
                },
              ]}
            >
              Target: {target}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.valueContainer}>
        <Text
          style={[
            styles.value,
            {
              color: getStatusColor(),
              fontSize: getScaledFontSize(28),
              fontWeight: getScaledFontWeight(700) as any,
            },
          ]}
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={[
              styles.unit,
              {
                color: isDark ? '#9BA1A6' : '#687076',
                fontSize: getScaledFontSize(16),
                fontWeight: getScaledFontWeight(400) as any,
                marginLeft: getScaledFontSize(4),
              },
            ]}
          >
            {unit}
          </Text>
        )}
      </View>
      {trend && (
        <Text
          style={[
            styles.trend,
            {
              color: isDark ? '#9BA1A6' : '#687076',
              fontSize: getScaledFontSize(12),
              fontWeight: getScaledFontWeight(400) as any,
              marginTop: getScaledFontSize(4),
            },
          ]}
        >
          {trend}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    flex: 1,
  },
  target: {
    marginTop: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  value: {
    lineHeight: 34,
  },
  unit: {
    marginLeft: 4,
  },
  trend: {
    marginTop: 4,
  },
});

