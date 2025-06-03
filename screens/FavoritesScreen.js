import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateCarImageUrl } from '../services/ImageService';

// Storage keys - using the same as CatalogueScreen
const STORAGE_KEYS = {
  FAVORITES: '@autorent_favorites',
  CACHED_CARS: '@autorent_cached_cars',
};

const FavoritesScreen = ({ isDarkMode = false }) => {
  const [favoriteVehicles, setFavoriteVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavoriteVehicles();
  }, []);

  const loadFavoriteVehicles = async () => {
    try {
      setLoading(true);
      
      // Load favorite IDs and cached cars in parallel
      const [favoriteIds, cachedCars] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.getItem(STORAGE_KEYS.CACHED_CARS)
      ]);

      if (favoriteIds && cachedCars) {
        const favorites = JSON.parse(favoriteIds);
        const cars = JSON.parse(cachedCars);
        
        // Get the actual car objects for favorite IDs
        const favoriteCars = cars.filter(car => favorites.includes(car.id));
        setFavoriteVehicles(favoriteCars);
      } else {
        setFavoriteVehicles([]);
      }
    } catch (error) {
      console.error('Error loading favorite vehicles:', error);
      Alert.alert('Error', 'Failed to load favorite vehicles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeFromFavorites = async (carId) => {
    try {
      // Get current favorites
      const favoriteIds = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (favoriteIds) {
        const favorites = JSON.parse(favoriteIds);
        const updatedFavorites = favorites.filter(id => id !== carId);
        
        // Update AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
        
        // Update local state
        setFavoriteVehicles(prevVehicles => 
          prevVehicles.filter(vehicle => vehicle.id !== carId)
        );
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  };

  const handleRemovePress = (car) => {
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove ${car.make} ${car.model} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromFavorites(car.id),
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavoriteVehicles();
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={[styles.favoriteCard, isDarkMode && styles.darkFavoriteCard]}>
      <Image
        source={{ 
          uri: generateCarImageUrl(item),
          cache: 'force-cache'
        }}
        style={styles.carImage}
        resizeMode="cover"
      />
      
      <View style={styles.carInfo}>
        <View style={styles.carDetails}>
          <Text style={[styles.carName, isDarkMode && styles.darkText]}>
            {item.make} {item.model}
          </Text>
          <Text style={[styles.carYear, isDarkMode && styles.darkSecondaryText]}>
            {item.year}
          </Text>
          <Text style={[styles.carPrice, isDarkMode && styles.darkText]}>
            ${item.price || 50}/day
          </Text>
          
          {/* Additional car specs */}
          <View style={styles.specsContainer}>
            {item.fuel_type && (
              <Text style={[styles.specText, isDarkMode && styles.darkSecondaryText]}>
                {item.fuel_type}
              </Text>
            )}
            {item.transmission && (
              <Text style={[styles.specText, isDarkMode && styles.darkSecondaryText]}>
                • {item.transmission}
              </Text>
            )}
            {item.cylinders && (
              <Text style={[styles.specText, isDarkMode && styles.darkSecondaryText]}>
                • {item.cylinders} cyl
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemovePress(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.removeIcon}>❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🤍</Text>
      <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
        No Favorites Yet
      </Text>
      <Text style={[styles.emptySubtitle, isDarkMode && styles.darkSecondaryText]}>
        Explore the catalog and add cars to your favorites
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Loading favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
          Favorites
        </Text>
        <Text style={[styles.headerSubtitle, isDarkMode && styles.darkSecondaryText]}>
          {favoriteVehicles.length} {favoriteVehicles.length === 1 ? 'car' : 'cars'}
        </Text>
      </View>

      {/* Favorites List */}
      <FlatList
        data={favoriteVehicles}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          favoriteVehicles.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  darkHeader: {
    backgroundColor: '#121212',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  darkFavoriteCard: {
    backgroundColor: '#2a2a2a',
  },
  carImage: {
    width: '100%',
    height: 180,
  },
  carInfo: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  carDetails: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  removeIcon: {
    fontSize: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  darkText: {
    color: '#fff',
  },
  darkSecondaryText: {
    color: '#aaa',
  },
});

export default FavoritesScreen; 