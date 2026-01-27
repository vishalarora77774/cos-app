import { DoctorCard } from '@/components/ui/doctor-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/stores/accessibility-store';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Portal, Text } from 'react-native-paper';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';
import { getFastenPractitioners, Provider } from '@/services/fasten-health';
import { getAllCategories, getAllMedicalSubcategories, groupProvidersByCategory, getProvidersByCategory, getProvidersByMedicalSubcategory } from '@/services/provider-categorization';
import { SUPPORT_CATEGORIES, getCategoryById, matchProviderToSubCategory } from '@/constants/categories';
import { FilterMenu } from '@/components/ui/filter-menu';


interface CategoryGroup {
  id: string;
  name: string;
  doctors: Provider[];
  subCategories?: SubCategoryGroup[];
}

interface SubCategoryGroup {
  id: string;
  name: string;
  doctors: Provider[];
}

export default function ModalScreen() {
  const { settings, getScaledFontSize, getScaledFontWeight } = useAccessibility();
  const colors = Colors[settings.isDarkTheme ? 'dark' : 'light'];
  const [categoryGroups, setCategoryGroups] = React.useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [lastVisitedFilter, setLastVisitedFilter] = React.useState<string | null>(null);

  const lastVisitedFilters = [
    { id: '3m', label: 'Last 3 months', months: 3 },
    { id: '6m', label: 'Last 6 months', months: 6 },
    { id: '1y', label: 'Last 1 year', years: 1 },
    { id: '2y', label: 'Last 2 years', years: 2 },
    { id: '5y', label: 'Last 5 years', years: 5 },
  ];

  const getCutoffDate = (filterId: string | null) => {
    if (!filterId) return null;
    const filter = lastVisitedFilters.find(item => item.id === filterId);
    if (!filter) return null;
    const now = new Date();
    const cutoff = new Date(now);
    if (filter.months) {
      cutoff.setMonth(now.getMonth() - filter.months);
    } else if (filter.years) {
      cutoff.setFullYear(now.getFullYear() - filter.years);
    }
    return cutoff;
  };

  const filterProvidersByLastVisited = (providers: Provider[]) => {
    if (!lastVisitedFilter) return providers;
    const cutoff = getCutoffDate(lastVisitedFilter);
    if (!cutoff) return providers;
    return providers.filter(provider => {
      if (!provider.lastVisited) return false;
      const visitedDate = new Date(provider.lastVisited);
      return visitedDate >= cutoff;
    });
  };

  const closeModal = () => {
    router.back();
  };

  // Load and categorize providers from Fasten Health
  React.useEffect(() => {
    const loadAndCategorizeProviders = async () => {
      setIsLoading(true);
      try {
        const providers = await getFastenPractitioners();
        
        // Use the same categorization logic as ListView for consistency
        const categorizedProviders = new Map<string, Provider[]>();
        
        // Categorize each provider (can belong to multiple subcategories)
        providers.forEach(provider => {
          const categoryMatch = provider.category
            ? SUPPORT_CATEGORIES.find(cat => cat.name === provider.category)
            : undefined;
          const subCategoryNames = provider.subCategories && provider.subCategories.length > 0
            ? provider.subCategories
            : provider.subCategory
              ? [provider.subCategory]
              : [];

          const categorizedViaProvider = categoryMatch && subCategoryNames.length > 0
            ? subCategoryNames
              .map(subName => {
                const subMatch = categoryMatch.subCategories.find(sub => sub.name === subName);
                return subMatch ? { categoryId: categoryMatch.id, subCategoryId: subMatch.id } : null;
              })
              .filter((match): match is { categoryId: string; subCategoryId: string } => Boolean(match))
            : [];

          const matches = categorizedViaProvider.length > 0
            ? categorizedViaProvider
            : (matchProviderToSubCategory(
                provider.name,
                provider.specialty,
                provider.qualifications
              ) || []);
          
          if (matches.length > 0) {
            // Add provider to ALL applicable subcategories
            matches.forEach(match => {
              const key = `${match.categoryId}-${match.subCategoryId}`;
              if (!categorizedProviders.has(key)) {
                categorizedProviders.set(key, []);
              }
              categorizedProviders.get(key)!.push(provider);
            });
          }
        });
        
        // Group by category (category IDs can contain hyphens like "social-leisure")
        const categoriesByCategoryId = new Map<string, Map<string, Provider[]>>();
        categorizedProviders.forEach((providerList, key) => {
          const categoryDef = SUPPORT_CATEGORIES.find(category =>
            key.startsWith(`${category.id}-`)
          );
          if (!categoryDef) return;

          const categoryId = categoryDef.id;
          const subCategoryId = key.substring(categoryId.length + 1);
          if (!subCategoryId) return;

          if (!categoriesByCategoryId.has(categoryId)) {
            categoriesByCategoryId.set(categoryId, new Map());
          }
          const subCategoryMap = categoriesByCategoryId.get(categoryId)!;
          subCategoryMap.set(subCategoryId, providerList);
        });
        
        const categories: CategoryGroup[] = [];
        
        // Process each category in the order defined in SUPPORT_CATEGORIES
        SUPPORT_CATEGORIES.forEach(categoryDef => {
          const subCategoryMap = categoriesByCategoryId.get(categoryDef.id);
          if (!subCategoryMap || subCategoryMap.size === 0) return;
          
          const subCategories: SubCategoryGroup[] = [];
          
          // Use the order from category definition to ensure consistency
          categoryDef.subCategories.forEach(subCatDef => {
            const providers = subCategoryMap.get(subCatDef.id) || [];
            if (providers.length > 0) {
              subCategories.push({
                id: subCatDef.id,
                name: subCatDef.name,
                doctors: providers,
              });
            }
          });
          
          if (subCategories.length > 0) {
            categories.push({
              id: categoryDef.id,
              name: categoryDef.name,
              doctors: [], // Empty when using subcategories
              subCategories,
            });
          }
        });
        
        setCategoryGroups(categories);
        console.log(`Loaded ${categories.length} categories with providers using same logic as ListView`);
      } catch (error) {
        console.error('Error loading and categorizing providers:', error);
        setCategoryGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndCategorizeProviders();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Portal.Host>
        <View style={styles.modalHeader}>
          <View style={styles.headerActionsLeft}>
            <FilterMenu
              options={lastVisitedFilters}
              selectedId={lastVisitedFilter}
              onSelect={setLastVisitedFilter}
              onClear={() => setLastVisitedFilter(null)}
              color={colors.text}
              menuBackgroundColor={colors.background}
              menuTextColor={colors.text}
              menuHighlightColor={colors.tint + '20'}
              fontSize={getScaledFontSize(14)}
              fontWeight={getScaledFontWeight(500) as any}
              iconSize={getScaledFontSize(22)}
              accessibilityLabel="Filter providers by last visited"
            />
          </View>
          <Text style={[styles.modalTitle, { 
            fontSize: getScaledFontSize(20), 
            fontWeight: getScaledFontWeight(600) as any, 
            color: colors.text 
          }]}>Doctors</Text>
          <View style={styles.headerActionsRight}>
            <TouchableOpacity onPress={closeModal} style={styles.headerAction}>
              <IconSymbol name="xmark" size={getScaledFontSize(24)} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      
        {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
            Loading providers...
          </Text>
        </View>
        ) : categoryGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text, fontSize: getScaledFontSize(16), fontWeight: getScaledFontWeight(500) as any }]}>
            No providers available
          </Text>
        </View>
        ) : (
        <TabsProvider
          defaultIndex={0}
          onChangeIndex={(index) => {
            // Reset selected category when switching tabs
            setSelectedCategoryId(null);
          }}
        >
          <Tabs
            showLeadingSpace={false}
            showTextLabel={true}
            uppercase={true}
            mode="scrollable"
            tabLabelStyle={{ 
              fontSize: getScaledFontSize(14), 
              fontWeight: getScaledFontWeight(500) as any,
              color: colors.text,
              paddingHorizontal: Math.max(8, getScaledFontSize(14) / 2),
              textAlign: 'center',
              lineHeight: getScaledFontSize(20)
            }}
            tabHeaderStyle={{
              backgroundColor: colors.background,
              borderBottomColor: colors.text + '20',
              borderBottomWidth: 1,
            }}
            style={{ backgroundColor: colors.background }}
            dark={settings.isDarkTheme}
          >
            {categoryGroups.map((category) => (
              <TabScreen
                key={category.id}
                label={category.name}
              >
                {category.subCategories && category.subCategories.length > 0 ? (
                  // Category has subcategories: Show nested tabs
                  <TabsProvider defaultIndex={0}>
                    <Tabs
                      showLeadingSpace={false}
                      showTextLabel={true}
                      uppercase={true}
                      mode="scrollable"
                      tabLabelStyle={{ 
                        fontSize: getScaledFontSize(12), 
                        fontWeight: getScaledFontWeight(500) as any,
                        color: colors.text,
                        paddingHorizontal: Math.max(8, getScaledFontSize(12) / 2),
                        textAlign: 'center',
                        lineHeight: getScaledFontSize(18)
                      }}
                      tabHeaderStyle={{
                        backgroundColor: colors.background,
                        borderBottomColor: colors.text + '20',
                        borderBottomWidth: 1,
                      }}
                      style={{ backgroundColor: colors.background }}
                      dark={settings.isDarkTheme}
                    >
                      {category.subCategories
                        .filter(subCategory => subCategory.doctors.length > 0) // Only show tabs for subcategories with providers
                        .map((subCategory) => (
                        <TabScreen
                          key={subCategory.id}
                          label={subCategory.name}
                        >
                          <ScrollView contentContainerStyle={styles.cardsContainer}>
                            {filterProvidersByLastVisited(subCategory.doctors).map((provider) => (
                              <DoctorCard
                                key={provider.id}
                                id={provider.id}
                                name={provider.name}
                                qualifications={provider.qualifications || 'Healthcare Provider'}
                                image={provider.image || undefined}
                                onPress={() => {
                                  router.push(`/(doctor-detail)?id=${encodeURIComponent(provider.id)}&name=${encodeURIComponent(provider.name)}&qualifications=${encodeURIComponent(provider.qualifications || '')}&specialty=${encodeURIComponent(provider.specialty || '')}`);
                                }}
                              />
                            ))}
                          </ScrollView>
                        </TabScreen>
                      ))}
                    </Tabs>
                  </TabsProvider>
                ) : (
                  // Category has no subcategories: Show all providers directly
                  <ScrollView contentContainerStyle={styles.cardsContainer}>
                    {category.doctors.length === 0 ? (
                      <View style={styles.emptyDepartmentContainer}>
                        <Text style={[styles.emptyText, { color: colors.text, fontSize: getScaledFontSize(14), fontWeight: getScaledFontWeight(500) as any }]}>
                          No providers in this category
                        </Text>
                      </View>
                    ) : (
                      filterProvidersByLastVisited(category.doctors).map((provider) => (
                        <DoctorCard
                          key={provider.id}
                          id={provider.id}
                          name={provider.name}
                          qualifications={provider.qualifications || 'Healthcare Provider'}
                          image={provider.image || undefined}
                          onPress={() => {
                            router.push(`/(doctor-detail)?id=${encodeURIComponent(provider.id)}&name=${encodeURIComponent(provider.name)}&qualifications=${encodeURIComponent(provider.qualifications || '')}&specialty=${encodeURIComponent(provider.specialty || '')}`);
                          }}
                        />
                      ))
                    )}
                  </ScrollView>
                )}
              </TabScreen>
            ))}
          </Tabs>
        </TabsProvider>
        )}
      </Portal.Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  headerActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 24,
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 24,
    justifyContent: 'flex-end',
  },
  headerAction: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabs: {
    height: '100%',
  },
  tabHeader: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: 48,
  },
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
  },
  emptyDepartmentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  subCategorySection: {
    marginBottom: 24,
  },
  subCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
