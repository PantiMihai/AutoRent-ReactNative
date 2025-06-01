import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { APIController } from '../controllers/APIController';
import { generateCarImageUrl } from '../services/ImageService';
import { RecentlyViewedUtil } from '../utils/RecentlyViewedUtil';
import CarDetailsScreen from './CarDetailsScreen';

const HomeScreen = ({ onNavigate }) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [startDate, setStartDate] = useState('Start Date');
  const [endDate, setEndDate] = useState('End Date');
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCarDetails, setShowCarDetails] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFeaturedVehicles();
    loadRecentlyViewed();
  }, []);

  // Add a focus listener to refresh recently viewed when coming back to home
  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadFeaturedVehicles = async () => {
    try {
      setLoading(true);
      const vehicles = await APIController.fetchRandomCars(6);
      // Add random ratings and prices for demo purposes
      const featuredWithExtras = vehicles.map(vehicle => ({
        ...vehicle,
        rating: (4.0 + Math.random() * 1.0).toFixed(1),
        price: Math.floor(Math.random() * 50) + 50,
        fuel_type: vehicle.fuel_type || 'Gas',
      }));
      setFeaturedVehicles(featuredWithExtras);
    } catch (error) {
      console.error('Error loading featured vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentlyViewed = async () => {
    try {
      const recent = await RecentlyViewedUtil.getRecentlyViewed();
      setRecentlyViewed(recent);
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

  const clearRecentlyViewed = async () => {
    try {
      await RecentlyViewedUtil.clearRecentlyViewed();
      setRecentlyViewed([]);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  };

  const handleSearchVehicle = () => {
    if (!pickupLocation.trim()) {
      Alert.alert('Missing Information', 'Please enter a pickup location');
      return;
    }
    // Navigate to catalogue with search parameters
    onNavigate('catalog');
  };

  const handleViewAll = () => {
    onNavigate('catalog');
  };

  const handleBookNow = (car) => {
    Alert.alert('Booking', `Booking ${car.make} ${car.model}...`);
  };

  const handleDatePress = (type) => {
    // For now, just show an alert. In a real app, you'd open a date picker
    Alert.alert('Date Picker', `Select ${type.toLowerCase()} date`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Today', onPress: () => {
        const today = new Date().toLocaleDateString();
        if (type === 'Start') {
          setStartDate(today);
        } else {
          setEndDate(today);
        }
      }},
      { text: 'Tomorrow', onPress: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toLocaleDateString();
        if (type === 'Start') {
          setStartDate(tomorrowStr);
        } else {
          setEndDate(tomorrowStr);
        }
      }}
    ]);
  };

  const handleCarPress = (car) => {
    setSelectedCar(car);
    setShowCarDetails(true);
  };

  const handleCloseCarDetails = () => {
    setShowCarDetails(false);
    setSelectedCar(null);
    // Refresh recently viewed when coming back from details
    loadRecentlyViewed();
  };

  const handleCarDetailsFavorite = async () => {
    // Simple favorite toggle - in a real app this would use AsyncStorage
    const carId = `${selectedCar.make}-${selectedCar.model}-${selectedCar.year}`;
    const isFavorite = favorites.includes(carId);
    
    if (isFavorite) {
      setFavorites(favorites.filter(id => id !== carId));
    } else {
      setFavorites([...favorites, carId]);
    }
  };

  const isCarFavorite = (car) => {
    const carId = `${car.make}-${car.model}-${car.year}`;
    return favorites.includes(carId);
  };

  const renderFeaturedVehicle = ({ item }) => (
    <View style={styles.featuredCard}>
      <View style={styles.featuredImageContainer}>
        <Image
          source={{ uri: generateCarImageUrl(item) }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.heartIcon}>
          <Text style={styles.heartText}>🤍</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredName}>{item.make} {item.model}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          <Text style={styles.fuelType}>• {item.fuel_type}</Text>
        </View>
        <Text style={styles.featuredPrice}>${item.price} <Text style={styles.priceUnit}>/day</Text></Text>
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => handleCarPress(item)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentVehicle = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentCard}
      onPress={() => handleCarPress(item)}
    >
      <Image
        source={{ uri: generateCarImageUrl(item) }}
        style={styles.recentImage}
        resizeMode="cover"
      />
      <View style={styles.recentInfo}>
        <Text style={styles.recentName}>{item.make} {item.model}</Text>
        <View style={styles.recentRatingRow}>
          <Text style={styles.recentRating}>⭐ {item.rating}</Text>
        </View>
        <Text style={styles.recentPrice}>${item.price} <Text style={styles.priceUnit}>/day</Text></Text>
      </View>
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={(e) => {
          e.stopPropagation();
          handleBookNow(item);
        }}
      >
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find your car</Text>
          <Text style={styles.headerSubtitle}>Rent the perfect vehicle</Text>
        </View>

        {/* Search Form */}
        <View style={styles.searchForm}>
          {/* Pickup Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="Pickup location"
              placeholderTextColor="#999"
              value={pickupLocation}
              onChangeText={setPickupLocation}
            />
          </View>

          {/* Date Selectors */}
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateSelector} onPress={() => handleDatePress('Start')}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{startDate}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dateSelector} onPress={() => handleDatePress('End')}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{endDate}</Text>
            </TouchableOpacity>
          </View>

          {/* Search Button */}
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearchVehicle}
          >
            <Text style={styles.searchButtonText}>Search Vehicle</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Vehicles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Vehicles</Text>
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={featuredVehicles}
            renderItem={renderFeaturedVehicle}
            keyExtractor={(item, index) => `featured-${item.make}-${item.model}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Viewed</Text>
              <TouchableOpacity onPress={clearRecentlyViewed}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={recentlyViewed}
              renderItem={renderRecentVehicle}
              keyExtractor={(item, index) => `recent-${item.make}-${item.model}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            />
          </View>
        )}
      </ScrollView>

      {/* Car Details Modal */}
      <Modal
        visible={showCarDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedCar && (
          <CarDetailsScreen
            car={selectedCar}
            onBack={handleCloseCarDetails}
            onToggleFavorite={handleCarDetailsFavorite}
            isFavorite={isCarFavorite(selectedCar)}
          />
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchForm: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 20,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  clearAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  featuredList: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImageContainer: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartText: {
    fontSize: 16,
  },
  featuredInfo: {
    padding: 12,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
  },
  fuelType: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  priceUnit: {
    fontWeight: '400',
    color: '#666',
  },
  detailsButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  recentList: {
    paddingHorizontal: 20,
  },
  recentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  recentRatingRow: {
    marginBottom: 4,
  },
  recentRating: {
    fontSize: 14,
    color: '#333',
  },
  recentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  bookButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen; 