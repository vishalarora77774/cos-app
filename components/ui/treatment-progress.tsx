import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useAccessibility } from '@/stores/accessibility-store';
import { ProgressBar } from './progress-bar';

export interface TreatmentGoal {
  /** Goal description */
  goal: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Status indicator */
  status?: 'on-track' | 'needs-attention' | 'completed';
}

export interface TreatmentProgressProps {
  /** Treatment plan title */
  planTitle: string;
  /** Duration of the treatment */
  duration: string;
  /** Overall progress percentage */
  overallProgress: number;
  /** Array of treatment goals */
  goals: TreatmentGoal[];
  /** Start date */
  startDate?: string;
  /** End date */
  endDate?: string;
}

export function TreatmentProgress({
  planTitle,
  duration,
  overallProgress,
  goals,
  startDate,
  endDate,
}: TreatmentProgressProps) {
  const { settings, getScaledFontSize, getScaledFontWeight } = useAccessibility();
  const isDark = settings.isDarkTheme;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'on-track':
        return '#0a7ea4';
      case 'needs-attention':
        return '#ff9800';
      default:
        return '#0a7ea4';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'on-track':
        return 'check-circle-outline';
      case 'needs-attention':
        return 'warning';
      default:
        return 'radio-button-unchecked';
    }
  };

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
        <View style={styles.headerContent}>
          <Text
            style={[
              styles.title,
              {
                color: isDark ? '#ECEDEE' : '#11181C',
                fontSize: getScaledFontSize(20),
                fontWeight: getScaledFontWeight(700) as any,
                marginBottom: getScaledFontSize(4),
              },
            ]}
          >
            {planTitle}
          </Text>
          <Text
            style={[
              styles.duration,
              {
                color: isDark ? '#9BA1A6' : '#687076',
                fontSize: getScaledFontSize(14),
                fontWeight: getScaledFontWeight(400) as any,
              },
            ]}
          >
            Duration: {duration}
          </Text>
          {(startDate || endDate) && (
            <Text
              style={[
                styles.dateRange,
                {
                  color: isDark ? '#9BA1A6' : '#687076',
                  fontSize: getScaledFontSize(12),
                  fontWeight: getScaledFontWeight(400) as any,
                  marginTop: getScaledFontSize(2),
                },
              ]}
            >
              {startDate && `Started: ${startDate}`}
              {startDate && endDate && ' • '}
              {endDate && `Ends: ${endDate}`}
            </Text>
          )}
        </View>
      </View>

      {/* Overall Progress */}
      <View style={styles.overallProgress}>
        <ProgressBar
          progress={overallProgress}
          label="Overall Progress"
          showPercentage={true}
          color="#0a7ea4"
          height={getScaledFontSize(16)}
        />
      </View>

      {/* Goals */}
      {goals.length > 0 && (
        <View style={styles.goalsContainer}>
          <Text
            style={[
              styles.goalsTitle,
              {
                color: isDark ? '#ECEDEE' : '#11181C',
                fontSize: getScaledFontSize(16),
                fontWeight: getScaledFontWeight(600) as any,
                marginTop: getScaledFontSize(16),
                marginBottom: getScaledFontSize(12),
              },
            ]}
          >
            Treatment Goals
          </Text>
          {goals.map((goal, index) => (
            <View
              key={index}
              style={[
                styles.goalItem,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                  borderRadius: 12,
                  padding: getScaledFontSize(12),
                  marginBottom: getScaledFontSize(10),
                },
              ]}
            >
              <View style={styles.goalHeader}>
                <Icon
                  source={getStatusIcon(goal.status)}
                  size={getScaledFontSize(20)}
                  color={getStatusColor(goal.status)}
                />
                <Text
                  style={[
                    styles.goalText,
                    {
                      color: isDark ? '#ECEDEE' : '#11181C',
                      fontSize: getScaledFontSize(15),
                      fontWeight: getScaledFontWeight(500) as any,
                      marginLeft: getScaledFontSize(8),
                      flex: 1,
                    },
                  ]}
                >
                  {goal.goal}
                </Text>
              </View>
              <View style={styles.goalProgress}>
                <ProgressBar
                  progress={goal.progress}
                  showPercentage={true}
                  color={getStatusColor(goal.status)}
                  height={getScaledFontSize(8)}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  duration: {
    marginTop: 4,
  },
  dateRange: {
    marginTop: 2,
  },
  overallProgress: {
    marginTop: 8,
  },
  goalsContainer: {
    marginTop: 8,
  },
  goalsTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  goalItem: {
    marginBottom: 10,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalText: {
    marginLeft: 8,
    flex: 1,
  },
  goalProgress: {
    marginTop: 4,
  },
});

