import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { generateHealthSuggestions, AISuggestion, HealthSummary } from '@/services/openai';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Icon } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Mock health data - In a real app, this would come from your API
const getMockHealthData = (): HealthSummary => ({
  treatmentPlan: {
    plan: 'Diabetes management and cardiovascular health monitoring',
    duration: '12 months',
    goals: ['Maintain blood sugar levels', 'Reduce cardiovascular risk', 'Improve overall wellness'],
  },
  medicalReports: [
    {
      date: '2024-11-15',
      type: 'Blood Test',
      summary: 'HbA1c at 6.8%, cholesterol levels within acceptable range',
      findings: ['HbA1c: 6.8%', 'Total Cholesterol: 185 mg/dL', 'HDL: 52 mg/dL'],
    },
    {
      date: '2024-11-01',
      type: 'Cardiovascular Screening',
      summary: 'Blood pressure well controlled, no concerning findings',
      findings: ['Blood Pressure: 128/78 mmHg', 'Heart Rate: 72 bpm'],
    },
  ],
  medications: [
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily with meals',
      purpose: 'Diabetes management',
    },
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily in the morning',
      purpose: 'Blood pressure control',
    },
    {
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      purpose: 'Cardiovascular protection',
    },
  ],
});

export default function PlanScreen() {
  const { settings, getScaledFontWeight, getScaledFontSize } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAISuggestions = useCallback(async (isRefresh = false) => {
    try {
      console.log('loadAISuggestions called, isRefresh:', isRefresh);
      if (isRefresh) {
        setIsRefreshing(true);
        console.log('Setting isRefreshing to true');
        // Keep previous content visible during refresh for better UX
      } else {
        setIsLoading(true);
      }
      setError(null);
      const healthData = getMockHealthData();
      console.log('Calling generateHealthSuggestions with isRefresh:', isRefresh);
      // Pass isRefresh flag to get fresh, varied responses on each refresh
      const suggestion = await generateHealthSuggestions(healthData, isRefresh);
      console.log('Received suggestion from OpenAI:', suggestion);
      // Replace content with fresh AI-generated response
      setAiSuggestion(suggestion);
    } catch (err) {
      console.error('Error loading AI suggestions:', err);
      setError(err instanceof Error ? err.message : 'Unable to load health suggestions. Please try again later.');
      // On error during refresh, don't clear existing content
      if (!isRefresh) {
        setAiSuggestion(null);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      console.log('loadAISuggestions completed');
    }
  }, []);

  useEffect(() => {
    loadAISuggestions();
  }, [loadAISuggestions]);

  const onRefresh = useCallback(async () => {
    console.log('Pull to refresh triggered');
    await loadAISuggestions(true);
  }, [loadAISuggestions]);

  return (
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        {/* AI Health Summary Section - Senior-Friendly Design */}
        <View style={[styles.aiSection, { 
          backgroundColor: settings.isDarkTheme ? '#1a1a1a' : '#ffffff',
        }]}>
          <View style={styles.aiHeader}>
              <View style={[styles.iconContainer, { backgroundColor: settings.isDarkTheme ? '#2a2a2a' : '#e8f4f8' }]}>
                <IconSymbol name="sparkles" size={getScaledFontSize(40)} color={colors.tint} />
                {isRefreshing && (
                  <View style={[
                    styles.refreshIndicatorOverlay,
                    { backgroundColor: settings.isDarkTheme ? '#1a1a1a' : '#ffffff' }
                  ]}>
                    <ActivityIndicator size="small" color={colors.tint} />
                  </View>
                )}
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[
                  styles.aiTitle,
                  {
                    color: colors.text,
                    fontSize: getScaledFontSize(24),
                    fontWeight: getScaledFontWeight(700) as any,
                  }
                ]}>
                  Your Health Summary
                </Text>
                <Text style={[
                  styles.aiSubtitle,
                  {
                    color: colors.icon,
                    fontSize: getScaledFontSize(14),
                    fontWeight: getScaledFontWeight(400) as any,
                    marginTop: getScaledFontSize(4),
                  }
                ]}>
                  {isRefreshing ? 'Updating your health summary...' : 'AI-powered insights based on your treatment plan'}
                </Text>
              </View>
            </View>

            {/* Refresh Loading Indicator */}
            {isRefreshing && aiSuggestion && (
              <View style={[
                styles.refreshLoadingContainer,
                {
                  backgroundColor: settings.isDarkTheme ? '#252525' : '#f5f5f5',
                  paddingVertical: getScaledFontSize(12),
                  marginBottom: getScaledFontSize(8),
                  marginTop: getScaledFontSize(8),
                }
              ]}>
                <ActivityIndicator size="small" color={colors.tint} />
                <Text style={[
                  styles.refreshLoadingText,
                  {
                    color: colors.text,
                    fontSize: getScaledFontSize(16),
                    fontWeight: getScaledFontWeight(500) as any,
                    marginLeft: getScaledFontSize(8),
                  }
                ]}>
                  Refreshing...
                </Text>
              </View>
            )}

            {isLoading && !isRefreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[
                  styles.loadingText,
                  {
                    color: colors.text,
                    fontSize: getScaledFontSize(20),
                    fontWeight: getScaledFontWeight(500) as any,
                    marginTop: getScaledFontSize(20),
                  }
                ]}>
                  Analyzing your health information...
                </Text>
                <Text style={[
                  styles.loadingSubtext,
                  {
                    color: colors.icon,
                    fontSize: getScaledFontSize(16),
                    fontWeight: getScaledFontWeight(400) as any,
                    marginTop: getScaledFontSize(8),
                    textAlign: 'center',
                  }
                ]}>
                  This may take a few moments
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <View style={[styles.errorIconContainer, { backgroundColor: settings.isDarkTheme ? '#3a1a1a' : '#ffeaea' }]}>
                  <Icon source="alert-circle" size={getScaledFontSize(48)} color="#ff4444" />
                </View>
                <Text style={[
                  styles.errorText,
                  {
                    color: '#ff4444',
                    fontSize: getScaledFontSize(20),
                    fontWeight: getScaledFontWeight(700) as any,
                    marginTop: getScaledFontSize(16),
                    textAlign: 'center',
                  }
                ]}>
                  Unable to Load Summary
                </Text>
                <Text style={[
                  styles.errorDetail,
                  {
                    color: colors.text,
                    fontSize: getScaledFontSize(18),
                    fontWeight: getScaledFontWeight(400) as any,
                    marginTop: getScaledFontSize(8),
                    textAlign: 'center',
                    paddingHorizontal: getScaledFontSize(16),
                  }
                ]}>
                  {error}
                </Text>
                <Button
                  mode="contained"
                  onPress={() => loadAISuggestions(false)}
                  style={[styles.retryButton, { marginTop: getScaledFontSize(24) }]}
                  buttonColor={colors.tint}
                  contentStyle={styles.buttonContent}
                >
                  <Text style={[
                    {
                      fontSize: getScaledFontSize(18),
                      fontWeight: getScaledFontWeight(600) as any,
                    }
                  ]}>
                    Try Again
                  </Text>
                </Button>
              </View>
            ) : aiSuggestion ? (
              <View style={styles.suggestionsContainer}>
                {/* Summary Section */}
                <View style={[styles.suggestionBlock, styles.summaryBlock]}>
                  <View style={styles.blockHeader}>
                    <View style={[styles.blockIconContainer, { backgroundColor: settings.isDarkTheme ? '#2a2a2a' : '#e8f4f8' }]}>
                      <Icon source="file-document" size={getScaledFontSize(32)} color={colors.tint} />
                    </View>
                    <Text style={[
                      styles.blockTitle,
                      {
                        color: colors.text,
                        fontSize: getScaledFontSize(20),
                        fontWeight: getScaledFontWeight(700) as any,
                        marginLeft: getScaledFontSize(12),
                      }
                    ]}>
                      Overview
                    </Text>
                  </View>
                  <View style={[styles.summaryContent, { 
                    backgroundColor: settings.isDarkTheme ? '#252525' : '#f9f9f9',
                    borderRadius: 12,
                    padding: getScaledFontSize(16),
                    marginTop: getScaledFontSize(12),
                  }]}>
                    <Text style={[
                      styles.summaryText,
                      {
                        color: colors.text,
                        fontSize: getScaledFontSize(19),
                        fontWeight: getScaledFontWeight(400) as any,
                        lineHeight: getScaledFontSize(30),
                      }
                    ]}>
                      {aiSuggestion.summary}
                    </Text>
                  </View>
                </View>

                {/* Key Points Section */}
                {aiSuggestion.keyPoints.length > 0 && (
                  <View style={styles.suggestionBlock}>
                    <View style={styles.blockHeader}>
                      <View style={[styles.blockIconContainer, { backgroundColor: settings.isDarkTheme ? '#1a2e1a' : '#e8f5e9' }]}>
                        <Icon source="check-circle" size={getScaledFontSize(32)} color="#4caf50" />
                      </View>
                      <Text style={[
                        styles.blockTitle,
                        {
                          color: colors.text,
                          fontSize: getScaledFontSize(20),
                          fontWeight: getScaledFontWeight(700) as any,
                          marginLeft: getScaledFontSize(12),
                        }
                      ]}>
                        Important Points to Remember
                      </Text>
                    </View>
                    <View style={styles.listContainer}>
                      {aiSuggestion.keyPoints.map((point, index) => (
                        <View key={index} style={[styles.listItem, {
                          backgroundColor: settings.isDarkTheme ? '#252525' : '#f9f9f9',
                          borderRadius: 12,
                          padding: getScaledFontSize(14),
                          marginBottom: getScaledFontSize(10),
                        }]}>
                          <View style={[styles.bulletPoint, { backgroundColor: colors.tint }]}>
                            <Text style={[styles.bulletNumber, {
                              color: '#fff',
                              fontSize: getScaledFontSize(16),
                              fontWeight: getScaledFontWeight(700) as any,
                            }]}>
                              {index + 1}
                            </Text>
                          </View>
                          <Text style={[
                            styles.listText,
                            {
                              color: colors.text,
                              fontSize: getScaledFontSize(19),
                              fontWeight: getScaledFontWeight(500) as any,
                              lineHeight: getScaledFontSize(30),
                              flex: 1,
                              marginLeft: getScaledFontSize(12),
                            }
                          ]}>
                            {point}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Recommendations Section */}
                {aiSuggestion.recommendations.length > 0 && (
                  <View style={styles.suggestionBlock}>
                    <View style={styles.blockHeader}>
                      <View style={[styles.blockIconContainer, { backgroundColor: settings.isDarkTheme ? '#2a241a' : '#fff8e1' }]}>
                        <Icon source="lightbulb" size={getScaledFontSize(32)} color="#ff9800" />
                      </View>
                      <Text style={[
                        styles.blockTitle,
                        {
                          color: colors.text,
                          fontSize: getScaledFontSize(20),
                          fontWeight: getScaledFontWeight(700) as any,
                          marginLeft: getScaledFontSize(12),
                        }
                      ]}>
                        Daily Recommendations
                      </Text>
                    </View>
                    <View style={styles.listContainer}>
                      {aiSuggestion.recommendations.map((rec, index) => (
                        <View key={index} style={[styles.listItem, {
                          backgroundColor: settings.isDarkTheme ? '#252525' : '#f9f9f9',
                          borderRadius: 12,
                          padding: getScaledFontSize(14),
                          marginBottom: getScaledFontSize(10),
                        }]}>
                          <View style={[styles.recommendationIcon, { backgroundColor: colors.tint }]}>
                            <Icon source="arrow-right" size={getScaledFontSize(20)} color="#fff" />
                          </View>
                          <Text style={[
                            styles.listText,
                            {
                              color: colors.text,
                              fontSize: getScaledFontSize(19),
                              fontWeight: getScaledFontWeight(500) as any,
                              lineHeight: getScaledFontSize(30),
                              flex: 1,
                              marginLeft: getScaledFontSize(12),
                            }
                          ]}>
                            {rec}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Warnings Section */}
                {aiSuggestion.warnings.length > 0 && (
                  <View style={[styles.suggestionBlock, styles.warningBlock, {
                    backgroundColor: settings.isDarkTheme ? '#3a241a' : '#fff3cd',
                    borderColor: settings.isDarkTheme ? '#ff6b6b' : '#ffc107',
                  }]}>
                    <View style={styles.blockHeader}>
                      <View style={[styles.blockIconContainer, { backgroundColor: settings.isDarkTheme ? '#4a1a1a' : '#ffeb3b' }]}>
                        <Icon source="alert" size={getScaledFontSize(32)} color="#ff4444" />
                      </View>
                      <Text style={[
                        styles.blockTitle,
                        {
                          color: '#ff4444',
                          fontSize: getScaledFontSize(20),
                          fontWeight: getScaledFontWeight(700) as any,
                          marginLeft: getScaledFontSize(12),
                        }
                      ]}>
                        Important Warnings
                      </Text>
                    </View>
                    <View style={styles.listContainer}>
                      {aiSuggestion.warnings.map((warning, index) => (
                        <View key={index} style={[styles.listItem, {
                          backgroundColor: settings.isDarkTheme ? '#2a1a1a' : '#fff9c4',
                          borderRadius: 12,
                          padding: getScaledFontSize(14),
                          marginBottom: getScaledFontSize(10),
                          borderLeftWidth: 4,
                          borderLeftColor: '#ff4444',
                        }]}>
                          <Icon source="alert-circle" size={getScaledFontSize(28)} color="#ff4444" />
                          <Text style={[
                            styles.listText,
                            {
                              color: colors.text,
                              fontSize: getScaledFontSize(19),
                              fontWeight: getScaledFontWeight(600) as any,
                              lineHeight: getScaledFontSize(30),
                              flex: 1,
                              marginLeft: getScaledFontSize(12),
                            }
                          ]}>
                            {warning}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : null}
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
  },
  aiSection: {
    marginBottom: 24,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderRadius: 24,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  refreshIndicatorOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  refreshLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  refreshLoadingText: {
    marginLeft: 8,
  },
  aiTitle: {
    flex: 1,
  },
  aiSubtitle: {
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    textAlign: 'center',
  },
  loadingSubtext: {
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    paddingHorizontal: 16,
  },
  errorDetail: {
    paddingHorizontal: 16,
  },
  retryButton: {
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 180,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  suggestionsContainer: {
    gap: 28,
  },
  suggestionBlock: {
    marginBottom: 8,
  },
  summaryBlock: {
    marginBottom: 4,
  },
  summaryContent: {
    marginTop: 12,
  },
  warningBlock: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  blockIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockTitle: {
    flex: 1,
  },
  summaryText: {
    textAlign: 'left',
  },
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bulletNumber: {
    textAlign: 'center',
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listText: {
    flex: 1,
  },
});
