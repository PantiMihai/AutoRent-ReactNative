import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateCarImageUrl } from '../services/ImageService';
import AuthService from '../services/AuthService';
import BookingDetailsScreen from './BookingDetailsScreen';
import RatingScreen from './RatingScreen';

// Storage keys - using the same as CatalogueScreen
const STORAGE_KEYS = {
  FAVORITES: '@autorent_favorites',
  BOOKINGS: 'bookings',
  CACHED_CARS: '@autorent_cached_cars',
};

const ProfileScreen = ({ onLogout, onNavigate, isDarkMode, onToggleDarkMode }) => {
  const [bookings, setBookings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('profile');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [favoriteVehicles, setFavoriteVehicles] = useState([]);
  const [allCars, setAllCars] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Get current user from Firebase
      const currentUser = AuthService.getCurrentUser();
      setUser(currentUser);

      // Load all data in parallel
      await Promise.all([
        loadBookings(),
        loadFavoriteVehicles(),
        loadAllCars(),
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setLoading(false);
    }
  };

  const loadAllCars = async () => {
    try {
      const cachedCars = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_CARS);
      if (cachedCars) {
        setAllCars(JSON.parse(cachedCars));
      }
    } catch (error) {
      console.error('Error loading cached cars:', error);
    }
  };

  const loadFavoriteVehicles = async () => {
    try {
      const favoriteIds = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (favoriteIds) {
        const favorites = JSON.parse(favoriteIds);
        
        // Wait for cars to be loaded first
        let cars = allCars;
        if (cars.length === 0) {
          const cachedCars = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_CARS);
          if (cachedCars) {
            cars = JSON.parse(cachedCars);
            setAllCars(cars);
          }
        }
        
        // Get the actual car objects for favorite IDs
        const favoriteCars = cars.filter(car => favorites.includes(car.id));
        setFavoriteVehicles(favoriteCars);
      }
    } catch (error) {
      console.error('Error loading favorite vehicles:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const existingBookings = await AsyncStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const bookingsList = existingBookings ? JSON.parse(existingBookings) : [];
      
      setBookings(bookingsList);
      
      // Find active booking (most recent one with 'confirmed' or 'in progress' status)
      const active = bookingsList.find(booking => 
        booking.status === 'in progress' || booking.status === 'confirmed'
      );
      
      if (active) {
        setActiveBooking({
          ...active,
          status: 'in progress', // Simulate active booking
          id: active.id || '7345'
        });
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  // Calculate total trips from completed bookings
  const getTotalTrips = () => {
    return bookings.filter(booking => 
      booking.status === 'completed' || booking.status === 'in progress' || booking.status === 'closed'
    ).length;
  };

  // Get member since year from Firebase user creation date
  const getMemberSince = () => {
    if (user && user.metadata && user.metadata.creationTime) {
      return new Date(user.metadata.creationTime).getFullYear();
    }
    return new Date().getFullYear(); // Fallback to current year
  };

  // Get user data from Firebase
  const getUserData = () => {
    if (!user) {
      return {
        name: 'Loading...',
        email: 'Loading...',
        totalTrips: 0,
        memberSince: new Date().getFullYear(),
        driverLicense: 'Not Verified',
        paymentMethods: 0,
        avatar: null
      };
    }

    return {
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      totalTrips: getTotalTrips(),
      memberSince: getMemberSince(),
      driverLicense: 'Verified', // In a real app, this would be stored in user profile
      paymentMethods: 1, // In a real app, this would be fetched from user's payment methods
      avatar: user.photoURL || null
    };
  };

  const userData = getUserData();

  const handleDarkModeToggle = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await AuthService.logout();
            if (result.success) {
              if (onLogout) onLogout();
            } else {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const generateRating = (car) => {
    let rating = 4.0;
    if (car.year && car.year > 2018) rating += 0.3;
    if (car.fuel_type === 'electric') rating += 0.4;
    if (car.cylinders && car.cylinders >= 6) rating += 0.2;
    if (car.class && car.class.toLowerCase().includes('luxury')) rating += 0.3;
    return Math.min(5.0, rating).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    
    return stars.join('');
  };

  const handleBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setCurrentScreen('bookingDetails');
  };

  const handleEndTrip = () => {
    // Navigate to rating screen instead of directly ending the trip
    setSelectedBooking(activeBooking);
    setCurrentScreen('rating');
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      if (activeBooking) {
        // Update booking with review data and change status to 'closed'
        const updatedBookings = bookings.map(booking => 
          booking.id === activeBooking.id 
            ? { 
                ...booking, 
                status: 'closed',
                review: reviewData,
                completedDate: new Date().toISOString()
              }
            : booking
        );
        
        await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
        setActiveBooking(null);
        await loadBookings();
        
        // Go back to profile screen
        setCurrentScreen('profile');
        
        Alert.alert('Thank You!', 'Your review has been submitted and the trip has been completed.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  const handleExtendBooking = () => {
    Alert.alert('Extend Booking', 'Booking extension feature coming soon!');
  };

  const handleModifyBooking = () => {
    Alert.alert('Modify Booking', 'Booking modification feature coming soon!');
  };

  if (currentScreen === 'bookingDetails') {
    return (
      <BookingDetailsScreen
        booking={selectedBooking}
        onBack={() => setCurrentScreen('profile')}
        onModify={handleModifyBooking}
        onExtend={handleExtendBooking}
        isDarkMode={isDarkMode}
      />
    );
  }

  if (currentScreen === 'rating') {
    return (
      <RatingScreen
        booking={selectedBooking}
        onBack={() => setCurrentScreen('profile')}
        onSubmitReview={handleSubmitReview}
        isDarkMode={isDarkMode}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>My account</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={[styles.settingsIcon, isDarkMode && styles.darkText]}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={[styles.userCard, isDarkMode && styles.darkCard]}>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, isDarkMode && styles.darkAvatar]}>
                {userData.avatar ? (
                  <Image source={{ uri: userData.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarText, isDarkMode && styles.darkText]}>👤</Text>
                )}
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, isDarkMode && styles.darkText]}>{userData.name}</Text>
              <Text style={[styles.userEmail, isDarkMode && styles.darkSecondaryText]}>{userData.email}</Text>
            </View>
          </View>

          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, isDarkMode && styles.darkText]}>{userData.totalTrips}</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkSecondaryText]}>Total Trips</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, isDarkMode && styles.darkText]}>{userData.memberSince}</Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkSecondaryText]}>Member Since</Text>
            </View>
          </View>

          <View style={styles.verificationItems}>
            <View style={styles.verificationItem}>
              <Text style={[styles.verificationIcon, isDarkMode && styles.darkText]}>📄</Text>
              <Text style={[styles.verificationText, isDarkMode && styles.darkText]}>Driver's License</Text>
              <Text style={styles.verifiedText}>{userData.driverLicense}</Text>
            </View>
            <View style={styles.verificationItem}>
              <Text style={[styles.verificationIcon, isDarkMode && styles.darkText]}>💳</Text>
              <Text style={[styles.verificationText, isDarkMode && styles.darkText]}>Payment Methods</Text>
              <Text style={[styles.paymentCount, isDarkMode && styles.darkText]}>{userData.paymentMethods} card</Text>
            </View>
          </View>
        </View>

        {/* Active Reservation */}
        {activeBooking && (
          <View style={[styles.sectionCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Active Reservation</Text>
            <View style={styles.activeBookingCard}>
              <View style={styles.bookingStatus}>
                <Text style={styles.statusBadge}>In Progress</Text>
                <Text style={[styles.bookingNumber, isDarkMode && styles.darkSecondaryText]}>
                  Booking #{activeBooking.id}
                </Text>
              </View>
              
              <View style={styles.bookingContent}>
                <Image
                  source={{ 
                    uri: generateCarImageUrl(activeBooking.car),
                    cache: 'force-cache'
                  }}
                  style={styles.bookingCarImage}
                  resizeMode="cover"
                />
                <View style={styles.bookingInfo}>
                  <Text style={[styles.bookingCarName, isDarkMode && styles.darkText]}>
                    {activeBooking.car.make} {activeBooking.car.model}
                  </Text>
                  <Text style={[styles.bookingCarSpecs, isDarkMode && styles.darkSecondaryText]}>
                    {activeBooking.car.fuel_type === 'electric' ? 'Electric' : 'Gasoline'} • {activeBooking.car.transmission === 'a' ? 'Automatic' : 'Manual'}
                  </Text>
                  <Text style={[styles.bookingDates, isDarkMode && styles.darkSecondaryText]}>
                    {formatDateRange(activeBooking.rentalPeriod?.startDate, activeBooking.rentalPeriod?.endDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleEndTrip}>
                  <Text style={styles.actionButtonText}>End trip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleExtendBooking}>
                  <Text style={styles.actionButtonText}>Extend</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.primaryActionButton} 
                  onPress={() => handleBookingDetails(activeBooking)}
                >
                  <Text style={styles.primaryActionButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Trip History */}
        <View style={[styles.sectionCard, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Trip History</Text>
          {bookings.length > 0 ? (
            bookings.slice(0, 2).map((booking, index) => {
              const duration = calculateDuration(booking.rentalPeriod?.startDate, booking.rentalPeriod?.endDate);
              const rating = generateRating(booking.car);
              return (
                <TouchableOpacity 
                  key={booking.id || index} 
                  style={styles.historyItem}
                  onPress={() => handleBookingDetails(booking)}
                >
                  <Image
                    source={{ 
                      uri: generateCarImageUrl(booking.car),
                      cache: 'force-cache'
                    }}
                    style={styles.historyCarImage}
                    resizeMode="cover"
                  />
                  <View style={styles.historyInfo}>
                    <Text style={[styles.historyCarName, isDarkMode && styles.darkText]}>
                      {booking.car.make} {booking.car.model}
                    </Text>
                    <Text style={[styles.historyDates, isDarkMode && styles.darkSecondaryText]}>
                      {formatDateRange(booking.rentalPeriod?.startDate, booking.rentalPeriod?.endDate)}, 2025
                    </Text>
                    <View style={styles.historyDetails}>
                      <View style={styles.ratingContainer}>
                        <Text style={styles.stars}>{renderStars(parseFloat(rating))}</Text>
                        <Text style={[styles.ratingValue, isDarkMode && styles.darkText]}>{rating}</Text>
                      </View>
                      <Text style={[styles.historyDuration, isDarkMode && styles.darkSecondaryText]}>
                        {duration} day{duration !== 1 ? 's' : ''}
                      </Text>
                      <Text style={[styles.historyPrice, isDarkMode && styles.darkText]}>
                        ${booking.priceBreakdown?.total || (booking.car.price + 55)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.editButton}>
                    <Text style={[styles.editIcon, isDarkMode && styles.darkSecondaryText]}>✏️</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={[styles.emptyText, isDarkMode && styles.darkSecondaryText]}>No trip history yet</Text>
          )}
        </View>

        {/* Favorite Vehicles */}
        <View style={[styles.sectionCard, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Favorite Vehicles</Text>
          {favoriteVehicles.length > 0 ? (
            <View style={styles.favoritesContainer}>
              {favoriteVehicles.map((vehicle) => (
                <TouchableOpacity key={vehicle.id} style={[styles.favoriteItem, isDarkMode && styles.darkFavoriteItem]}>
                  <Image
                    source={{ 
                      uri: generateCarImageUrl(vehicle),
                      cache: 'force-cache'
                    }}
                    style={styles.favoriteImage}
                    resizeMode="cover"
                  />
                  <View style={styles.favoriteInfo}>
                    <Text style={[styles.favoriteName, isDarkMode && styles.darkText]}>
                      {vehicle.make} {vehicle.model}
                    </Text>
                    <Text style={[styles.favoritePrice, isDarkMode && styles.darkSecondaryText]}>
                      From ${vehicle.price}/day
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, isDarkMode && styles.darkSecondaryText]}>
              No favorite vehicles yet
            </Text>
          )}
        </View>

        {/* Settings */}
        <View style={[styles.sectionCard, isDarkMode && styles.darkCard]}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingIcon, isDarkMode && styles.darkText]}>🌙</Text>
              <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingIcon, isDarkMode && styles.darkText]}>👤</Text>
              <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Personal Information</Text>
            </View>
            <Text style={[styles.settingArrow, isDarkMode && styles.darkSecondaryText]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🚪</Text>
              <Text style={[styles.settingText, { color: '#F44336' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  darkHeader: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  settingsButton: {
    padding: 5,
  },
  settingsIcon: {
    fontSize: 24,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  darkAvatar: {
    backgroundColor: '#333',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarText: {
    fontSize: 30,
    color: '#666',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  verificationItems: {
    gap: 10,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#333',
  },
  verificationText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  verifiedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  paymentCount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  activeBookingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  bookingStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusBadge: {
    backgroundColor: '#2196F3',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bookingNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  bookingContent: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  bookingCarImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingCarName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  bookingCarSpecs: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  bookingDates: {
    fontSize: 12,
    color: '#666',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyCarImage: {
    width: 60,
    height: 45,
    borderRadius: 6,
    marginRight: 15,
  },
  historyInfo: {
    flex: 1,
  },
  historyCarName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  historyDates: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  historyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    fontSize: 12,
    marginRight: 3,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  historyDuration: {
    fontSize: 12,
    color: '#666',
  },
  historyPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    padding: 10,
  },
  editIcon: {
    fontSize: 16,
    color: '#666',
  },
  favoritesContainer: {
    gap: 15,
  },
  favoriteItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkFavoriteItem: {
    backgroundColor: '#2a2a2a',
  },
  favoriteImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  favoriteInfo: {
    alignItems: 'center',
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  favoritePrice: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 15,
    color: '#333',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingArrow: {
    fontSize: 20,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
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

export default ProfileScreen; 