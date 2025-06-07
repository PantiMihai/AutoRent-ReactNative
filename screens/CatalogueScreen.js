import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIController } from '../controllers/APIController';
import CarCatalogueCard from '../components/CarCatalogueCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CompareScreen from './CompareScreen';
import CarDetailsScreen from './CarDetailsScreen';

const STORAGE_KEYS = {
  FAVORITES: '@autorent_favorites',
  COMPARE_LIST: '@autorent_compare_list',
  CACHED_CARS: '@autorent_cached_cars',
};

// Car types mapping for filtering
const CAR_TYPES = {
  'ALL_TYPES': 'All Types',
  'SUV': 'SUV',
  'SPORT': 'Sport', 
  'SEDAN': 'Sedan',
};

// Generate realistic pricing based on car type and specs
const generateCarPrice = (car) => {
  let basePrice = 50;
  
  // Price based on car class
  const classMultipliers = {
    'suv': 1.5,
    'sport utility vehicle': 1.5,
    'sports car': 2.5,
    'luxury car': 2.0,
    'sedan': 1.2,
    'compact car': 0.8,
    'midsize car': 1.0,
    'coupe': 1.8,
    'convertible': 2.2,
  };

  const carClass = car.class?.toLowerCase() || '';
  const multiplier = Object.keys(classMultipliers).find(key => 
    carClass.includes(key)
  );
  
  if (multiplier) {
    basePrice *= classMultipliers[multiplier];
  }

  // Price based on year (newer = more expensive)
  const currentYear = new Date().getFullYear();
  const carYear = car.year || 2000;
  const yearFactor = Math.max(0.5, (carYear - 1990) / (currentYear - 1990));
  basePrice *= yearFactor;

  // Price based on cylinders (more cylinders = more expensive)
  if (car.cylinders) {
    basePrice *= (1 + (car.cylinders - 4) * 0.15);
  }

  // Round to nearest $10
  return Math.round(basePrice / 10) * 10;
};

// Map car classes to our filter types
const getCarType = (car) => {
  const carClass = car.class?.toLowerCase() || '';
  const carMake = car.make?.toLowerCase() || '';
  const carModel = car.model?.toLowerCase() || '';
  
  // SUV category - check class, make, and model
  if (carClass.includes('suv') || 
      carClass.includes('sport utility') ||
      carClass.includes('truck') ||
      carModel.includes('suv') ||
      ['jeep', 'land rover', 'range rover'].some(brand => carMake.includes(brand))) {
    return 'SUV';
  }
  
  // Sport category - expand criteria significantly
  if (carClass.includes('sport') || 
      carClass.includes('coupe') || 
      carClass.includes('convertible') ||
      carClass.includes('roadster') ||
      carClass.includes('supercar') ||
      carClass.includes('muscle') ||
      carClass.includes('performance') ||
      carModel.includes('sport') ||
      carModel.includes('gt') ||
      carModel.includes('gti') ||
      carModel.includes('turbo') ||
      carModel.includes('rs') ||
      carModel.includes('m3') ||
      carModel.includes('m5') ||
      carModel.includes('amg') ||
      carModel.includes('type r') ||
      carModel.includes('sti') ||
      carModel.includes('wrx') ||
      ['ferrari', 'lamborghini', 'maserati', 'aston martin', 'mclaren', 'bugatti', 'koenigsegg', 'pagani'].some(brand => carMake.includes(brand)) ||
      ['corvette', 'camaro', 'challenger', 'mustang', 'viper', 'gt-r', 'supra', 'rx-7', 'nsx', '911', 'boxster', 'cayman'].some(model => carModel.includes(model))) {
    return 'Sport';
  }
  
  // Sedan category - explicit sedans and family cars
  if (carClass.includes('sedan') || 
      carClass.includes('saloon') ||
      carClass.includes('compact') ||
      carClass.includes('midsize') ||
      carClass.includes('full-size') ||
      carClass.includes('luxury') ||
      carClass.includes('executive') ||
      carModel.includes('sedan')) {
    return 'Sedan';
  }
  
  // Default fallback - distribute more evenly
  // Use a simple hash to distribute unknown cars across categories
  const hash = (carMake + carModel).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const categories = ['Sedan', 'Sport', 'SUV'];
  return categories[Math.abs(hash) % categories.length];
};

const CatalogueScreen = ({ isDarkMode = false }) => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL_TYPES');
  const [favorites, setFavorites] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCarDetails, setShowCarDetails] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterCars();
  }, [cars, searchQuery, selectedFilter]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('🔄 CatalogueScreen: Loading initial data...');
      
      // Load cached data from AsyncStorage
      await Promise.all([
        loadFavorites(),
        loadCompareList(),
      ]);
      
      // Check if we have cached cars first
      const cachedCars = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_CARS);
      if (cachedCars) {
        // Use cached cars if available, but re-categorize them in case logic changed
        const parsedCars = JSON.parse(cachedCars);
        const recategorizedCars = parsedCars.map(car => ({
          ...car,
          type: getCarType(car), // Re-apply categorization logic
        }));
        console.log('✅ CatalogueScreen: Using cached cars:', recategorizedCars.length);
        console.log('🏷️ Car types distribution:', 
          recategorizedCars.reduce((acc, car) => {
            acc[car.type] = (acc[car.type] || 0) + 1;
            return acc;
          }, {})
        );
        setCars(recategorizedCars);
      } else {
        // Only fetch fresh car data if no cache exists
        console.log('🌐 CatalogueScreen: No cache found, fetching fresh cars...');
        await fetchCars();
      }
    
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      setRefreshing(true);
      console.log('🌐 CatalogueScreen: Fetching fresh cars from API...');
      const carData = await APIController.fetchRandomCars(12); // Get more cars for variety
      
      // Add pricing and IDs to cars
      const carsWithPricing = carData.map((car, index) => ({
        ...car,
        id: `${car.make}-${car.model}-${car.year}-${index}`,
        price: generateCarPrice(car),
        type: getCarType(car),
      }));
      
      setCars(carsWithPricing);
      
      // Cache cars to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_CARS, JSON.stringify(carsWithPricing));
      console.log('💾 CatalogueScreen: Cached', carsWithPricing.length, 'cars to storage');
      
    } catch (error) {
      console.error('Error fetching cars:', error);
      Alert.alert('Error', 'Failed to fetch car data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadCompareList = async () => {
    try {
      const savedCompareList = await AsyncStorage.getItem(STORAGE_KEYS.COMPARE_LIST);
      if (savedCompareList) {
        setCompareList(JSON.parse(savedCompareList));
      }
    } catch (error) {
      console.error('Error loading compare list:', error);
    }
  };

  const filterCars = () => {
    let filtered = [...cars];
    
    console.log(`🔍 Filtering cars: ${cars.length} total cars`);
    console.log(`🔍 Search query: "${searchQuery}"`);
    console.log(`🔍 Selected filter: ${selectedFilter}`);

    // Apply search filter
    if (searchQuery.trim()) {
      const beforeSearch = filtered.length;
      filtered = filtered.filter(car =>
        car.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log(`🔍 After search filter: ${beforeSearch} → ${filtered.length} cars`);
    }

    // Apply type filter
    if (selectedFilter !== 'ALL_TYPES') {
      const beforeTypeFilter = filtered.length;
      filtered = filtered.filter(car => car.type === selectedFilter);
      console.log(`🔍 After type filter (${selectedFilter}): ${beforeTypeFilter} → ${filtered.length} cars`);
      
      // Debug: show some examples of what was filtered
      if (filtered.length === 0) {
        console.log('⚠️ No cars match the filter. Available car types:', 
          cars.map(car => `${car.make} ${car.model}: ${car.type}`).slice(0, 5)
        );
      }
    }

    console.log(`✅ Final filtered result: ${filtered.length} cars`);
    setFilteredCars(filtered);
  };

  const toggleFavorite = async (carId) => {
    try {
      const newFavorites = favorites.includes(carId)
        ? favorites.filter(id => id !== carId)
        : [...favorites, carId];
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleCompare = async (carId) => {
    try {
      let newCompareList;
      
      if (compareList.includes(carId)) {
        // Remove from compare list
        newCompareList = compareList.filter(id => id !== carId);
      } else {
        // Add to compare list (max 2 cars)
        if (compareList.length >= 2) {
          Alert.alert('Compare Limit', 'You can only compare up to 2 cars at a time.');
          return;
        }
        newCompareList = [...compareList, carId];
      }
      
      setCompareList(newCompareList);
      await AsyncStorage.setItem(STORAGE_KEYS.COMPARE_LIST, JSON.stringify(newCompareList));
      
      // Show compare screen when 2 cars are selected
      if (newCompareList.length === 2) {
        setShowCompare(true);
      }
    } catch (error) {
      console.error('Error toggling compare:', error);
    }
  };

  const clearCompareList = async () => {
    try {
      setCompareList([]);
      await AsyncStorage.setItem(STORAGE_KEYS.COMPARE_LIST, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing compare list:', error);
    }
  };

  const getComparedCars = () => {
    return cars.filter(car => compareList.includes(car.id));
  };

  const handleCloseCompare = () => {
    setShowCompare(false);
  };

  const handleRemoveFromCompare = async (carId) => {
    try {
      const newCompareList = compareList.filter(id => id !== carId);
      setCompareList(newCompareList);
      await AsyncStorage.setItem(STORAGE_KEYS.COMPARE_LIST, JSON.stringify(newCompareList));
      
      // Close compare screen if no cars left
      if (newCompareList.length === 0) {
        setShowCompare(false);
      }
    } catch (error) {
      console.error('Error removing from compare:', error);
    }
  };

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const handleCarPress = (car) => {
    setSelectedCar(car);
    setShowCarDetails(true);
  };

  const handleCloseCarDetails = () => {
    setShowCarDetails(false);
    setSelectedCar(null);
  };

  const handleCarDetailsFavorite = async () => {
    if (selectedCar) {
      await toggleFavorite(selectedCar.id);
    }
  };

  const renderCarItem = ({ item }) => (
    <CarCatalogueCard
      car={item}
      isFavorite={favorites.includes(item.id)}
      isInCompare={compareList.includes(item.id)}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onToggleCompare={() => toggleCompare(item.id)}
      onPress={() => handleCarPress(item)}
      isDarkMode={isDarkMode}
    />
  );

  if (loading) {
    return <LoadingSpinner message="Loading catalogue..." isDarkMode={isDarkMode} />;
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Catalogue</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, isDarkMode && styles.darkSearchContainer]}>
        <View style={[styles.searchInputContainer, isDarkMode && styles.darkSearchInputContainer]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
            placeholder="Search Cars..."
            placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, isDarkMode && styles.darkFilterContainer]}>
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={styles.filterIconButton}
            onPress={toggleFilters}
          >
            <Text style={styles.filterIcon}>☰</Text>
          </TouchableOpacity>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
            style={styles.filterScrollView}
          >
            {Object.entries(CAR_TYPES).map(([key, label]) => {
              // Count cars for this filter
              const count = key === 'ALL_TYPES' 
                ? cars.length 
                : cars.filter(car => car.type === key).length;
              
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterTab,
                    selectedFilter === key && styles.filterTabActive,
                    isDarkMode && styles.darkFilterTab,
                    selectedFilter === key && isDarkMode && styles.darkFilterTabActive
                  ]}
                  onPress={() => {
                    console.log(`🔄 Filter changed to: ${key} (${label}) - ${count} cars`);
                    setSelectedFilter(key);
                    // Clear search when changing filters for better UX
                    if (searchQuery.trim()) {
                      setSearchQuery('');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.filterTabText,
                    selectedFilter === key && styles.filterTabTextActive,
                    isDarkMode && styles.darkFilterTabText,
                    selectedFilter === key && isDarkMode && styles.darkFilterTabTextActive
                  ]}>
                    {label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        
        {/* Expanded Filters */}
        {filtersExpanded && (
          <View style={[styles.expandedFilters, isDarkMode && styles.darkExpandedFilters]}>
            <Text style={[styles.expandedFiltersTitle, isDarkMode && styles.darkText]}>Additional Filters</Text>
            <View style={styles.expandedFilterRow}>
              <TouchableOpacity style={styles.expandedFilterButton}>
                <Text style={styles.expandedFilterText}>Price Range</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.expandedFilterButton}>
                <Text style={styles.expandedFilterText}>Year Range</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.expandedFilterRow}>
              <TouchableOpacity style={styles.expandedFilterButton}>
                <Text style={styles.expandedFilterText}>Fuel Type</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.expandedFilterButton}>
                <Text style={styles.expandedFilterText}>Transmission</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Compare Section */}
      <View style={[styles.compareSection, isDarkMode && styles.darkCompareSection]}>
        <View style={styles.compareHeader}>
          <Text style={[styles.compareTitle, isDarkMode && styles.darkText]}>Compare Cars</Text>
          <Text style={[styles.compareSubtitle, isDarkMode && styles.darkSecondaryText]}>
            Select up to 2 cars ({compareList.length}/2)
          </Text>
        </View>
        {compareList.length > 0 && (
          <View style={styles.compareActions}>
            {compareList.length === 2 && (
              <TouchableOpacity 
                style={styles.viewCompareButton} 
                onPress={() => setShowCompare(true)}
              >
                <Text style={styles.viewCompareText}>View</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.clearCompareButton} onPress={clearCompareList}>
              <Text style={styles.clearCompareText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Cars Grid */}
      <FlatList
        data={filteredCars}
        renderItem={renderCarItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.carsGrid}
        columnWrapperStyle={styles.carsRow}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={fetchCars}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDarkMode && styles.darkSecondaryText]}>No cars found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCars}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {/* Compare Modal */}
      <Modal
        visible={showCompare}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CompareScreen 
          cars={getComparedCars()}
          onClose={handleCloseCompare}
          onRemoveCar={handleRemoveFromCompare}
          isDarkMode={isDarkMode}
        />
      </Modal>
      
      {/* Car Details Modal */}
      <Modal
        visible={showCarDetails}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CarDetailsScreen 
          car={selectedCar}
          onBack={handleCloseCarDetails}
          onToggleFavorite={handleCarDetailsFavorite}
          isFavorite={selectedCar ? favorites.includes(selectedCar.id) : false}
          isDarkMode={isDarkMode}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    color: '#999',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  filterIcon: {
    fontSize: 18,
    color: '#666',
  },
  filterContent: {
    paddingLeft: 0,
    alignItems: 'center',
  },
  filterScrollView: {
    flex: 1,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  compareSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareHeader: {
    flex: 1,
  },
  compareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  compareSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  compareActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCompareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    marginRight: 8,
  },
  viewCompareText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  clearCompareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff4444',
    borderRadius: 6,
  },
  clearCompareText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  carsGrid: {
    padding: 16,
  },
  carsRow: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  expandedFilters: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  expandedFiltersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  expandedFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expandedFilterButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  expandedFilterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  // Dark mode styles
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkHeader: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  darkText: {
    color: '#fff',
  },
  darkSecondaryText: {
    color: '#aaa',
  },
  darkSearchContainer: {
    backgroundColor: '#1e1e1e',
  },
  darkSearchInputContainer: {
    backgroundColor: '#2a2a2a',
  },
  darkSearchInput: {
    color: '#fff',
  },
  darkFilterContainer: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  darkCompareSection: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  darkExpandedFilters: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333',
  },
  darkFilterTab: {
    backgroundColor: '#2a2a2a',
  },
  darkFilterTabActive: {
    backgroundColor: '#2196F3',
  },
  darkFilterTabText: {
    color: '#aaa',
  },
  darkFilterTabTextActive: {
    color: '#fff',
  },
});

export default CatalogueScreen; 