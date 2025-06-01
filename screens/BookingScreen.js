import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateCarImageUrl } from '../services/ImageService';

const BookingScreen = ({ car, onClose, onConfirm, onBack, onBookingConfirmed, isDarkMode = false }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [rentalPeriod, setRentalPeriod] = useState(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Support both old and new prop names for backward compatibility
  const handleClose = onClose || onBack;
  const handleConfirm = onConfirm || onBookingConfirmed;

  // Generate random rental period
  const generateRentalPeriod = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1); // 1-30 days from now
    
    const duration = Math.floor(Math.random() * 7) + 1; // 1-7 days duration
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    return {
      startDate,
      endDate,
      duration,
      startTime: '10:00 AM',
      endTime: '10:00 AM'
    };
  };

  // Generate random pickup location
  const generatePickupLocation = () => {
    const locations = [
      'Universității nr. 1, Oradea, 410087, Bihor',
      'Strada Republicii nr. 15, Cluj-Napoca, 400015, Cluj',
      'Bulevardul Unirii nr. 12, București, 030167, Bucharest',
      'Strada Memorandului nr. 28, Timișoara, 300134, Timiș',
      'Piața Unirii nr. 9, Iași, 700056, Iași'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  // Calculate price breakdown
  const calculatePriceBreakdown = (dailyRate, duration) => {
    const subtotal = dailyRate * duration;
    const serviceFee = Math.floor(Math.random() * 30) + 15; // $15-45
    const insurance = Math.floor(Math.random() * 25) + 20; // $20-45
    const total = subtotal + serviceFee + insurance;

    return {
      dailyRate,
      serviceFee,
      insurance,
      total
    };
  };

  useEffect(() => {
    setRentalPeriod(generateRentalPeriod());
    setPickupLocation(generatePickupLocation());
  }, []);

  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const priceBreakdown = rentalPeriod ? calculatePriceBreakdown(car.price, rentalPeriod.duration) : null;

  // Generate rating based on car properties
  const generateRating = (car) => {
    let rating = 4.0;
    if (car.year && car.year > 2018) rating += 0.3;
    if (car.fuel_type === 'electric') rating += 0.4;
    if (car.cylinders && car.cylinders >= 6) rating += 0.2;
    if (car.class && car.class.toLowerCase().includes('luxury')) rating += 0.3;
    return Math.min(5.0, rating).toFixed(1);
  };

  const saveBooking = useCallback(async () => {
    if (isBooking) return; // Prevent multiple bookings
    
    try {
      setIsBooking(true);
      console.log('Starting booking save process...');
      
      const booking = {
        id: Date.now().toString(),
        car: car,
        rentalPeriod: rentalPeriod,
        pickupLocation: pickupLocation,
        priceBreakdown: priceBreakdown,
        paymentMethod: paymentMethod,
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
      };

      console.log('Booking object created:', booking);

      // Get existing bookings
      const existingBookings = await AsyncStorage.getItem('bookings');
      const bookings = existingBookings ? JSON.parse(existingBookings) : [];
      
      console.log('Existing bookings loaded:', bookings.length);
      
      // Add new booking
      bookings.push(booking);
      
      // Save back to storage
      await AsyncStorage.setItem('bookings', JSON.stringify(bookings));
      
      console.log('Booking saved successfully. Total bookings:', bookings.length);
      
      // Use setTimeout to ensure async operations complete before navigation
      setTimeout(() => {
        console.log('Redirecting after timeout...');
        if (handleConfirm) {
          handleConfirm();
        } else if (handleClose) {
          handleClose();
        }
        setIsBooking(false);
      }, 200);
      
    } catch (error) {
      console.error('Error saving booking:', error);
      setIsBooking(false);
      console.error('Booking failed. Please try again.');
    }
  }, [isBooking, car, rentalPeriod, pickupLocation, priceBreakdown, paymentMethod, handleConfirm, handleClose]);

  const handlePaymentMethodChange = () => {
    // Simple toggle between card and cash for web compatibility
    setPaymentMethod(paymentMethod === 'card' ? 'cash' : 'card');
    console.log('Payment method changed to:', paymentMethod === 'card' ? 'cash' : 'card');
  };

  // Move the early return check to after all hooks are called
  if (!car || !rentalPeriod || !priceBreakdown) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <TouchableOpacity style={[styles.backButton, isDarkMode && styles.darkBackButton]} onPress={handleClose}>
            <Text style={[styles.backIcon, isDarkMode && styles.darkText]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Booking summary</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rating = generateRating(car);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity style={[styles.backButton, isDarkMode && styles.darkBackButton]} onPress={handleClose}>
          <Text style={[styles.backIcon, isDarkMode && styles.darkText]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Booking summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Car Details Card */}
        <View style={[styles.carCard, isDarkMode && styles.darkCard]}>
          <Image
            source={{ 
              uri: generateCarImageUrl(car),
              cache: 'force-cache'
            }}
            style={styles.carImage}
            resizeMode="cover"
          />
          <View style={styles.carInfo}>
            <Text style={[styles.carName, isDarkMode && styles.darkText]}>{car.make} {car.model}</Text>
            <Text style={[styles.carSpecs, isDarkMode && styles.darkSecondaryText]}>
              {car.fuel_type === 'electric' ? 'Electric' : 'Gasoline'} • {car.transmission === 'a' ? 'Automatic' : 'Manual'}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={[styles.ratingText, isDarkMode && styles.darkText]}>{rating}</Text>
            </View>
          </View>
        </View>

        {/* Rental Period */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSecondaryText]}>RENTAL PERIOD</Text>
          <View style={[styles.dateContainer, isDarkMode && styles.darkCard]}>
            <View style={styles.dateItem}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={[styles.dateText, isDarkMode && styles.darkText]}>{formatDate(rentalPeriod.startDate)}</Text>
              <Text style={[styles.timeText, isDarkMode && styles.darkText]}>{rentalPeriod.startTime}</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={[styles.dateText, isDarkMode && styles.darkText]}>{formatDate(rentalPeriod.endDate)}</Text>
              <Text style={[styles.timeText, isDarkMode && styles.darkText]}>{rentalPeriod.endTime}</Text>
            </View>
          </View>
          <Text style={[styles.durationText, isDarkMode && styles.darkSecondaryText]}>Duration: {rentalPeriod.duration} days</Text>
        </View>

        {/* Pickup Location */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSecondaryText]}>PICKUP LOCATION</Text>
          <View style={[styles.locationContainer, isDarkMode && styles.darkCard]}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={[styles.locationText, isDarkMode && styles.darkText]}>{pickupLocation}</Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSecondaryText]}>PRICE BREAKDOWN</Text>
          <View style={[styles.priceContainer, isDarkMode && styles.darkCard]}>
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, isDarkMode && styles.darkText]}>Daily rate</Text>
              <Text style={[styles.priceValue, isDarkMode && styles.darkText]}>${priceBreakdown.dailyRate}.00</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, isDarkMode && styles.darkText]}>Service fee</Text>
              <Text style={[styles.priceValue, isDarkMode && styles.darkText]}>${priceBreakdown.serviceFee}.00</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, isDarkMode && styles.darkText]}>Insurance</Text>
              <Text style={[styles.priceValue, isDarkMode && styles.darkText]}>${priceBreakdown.insurance}.00</Text>
            </View>
            <View style={[styles.priceItem, styles.totalItem, isDarkMode && styles.darkTotalItem]}>
              <Text style={[styles.totalLabel, isDarkMode && styles.darkText]}>Total</Text>
              <Text style={[styles.totalValue, isDarkMode && styles.darkText]}>${priceBreakdown.total}.00</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSecondaryText]}>PAYMENT METHOD</Text>
          <View style={[styles.paymentContainer, isDarkMode && styles.darkCard]}>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentIcon}>
                {paymentMethod === 'card' ? '💳' : '💵'}
              </Text>
              <Text style={[styles.paymentText, isDarkMode && styles.darkText]}>
                {paymentMethod === 'card' ? 'Credit card' : 'Cash'}
              </Text>
            </View>
            <TouchableOpacity onPress={handlePaymentMethodChange}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity 
          style={[styles.confirmButton, isBooking && styles.confirmButtonDisabled]} 
          onPress={saveBooking}
          disabled={isBooking}
        >
          <Text style={styles.confirmButtonText}>
            {isBooking ? 'Confirming...' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  carCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  carSpecs: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  dateContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
  },
  locationContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  priceContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#333',
  },
  priceValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  paymentContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
  },
  changeText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkHeader: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  darkBackButton: {
    backgroundColor: '#333',
  },
  darkText: {
    color: '#fff',
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  darkSecondaryText: {
    color: '#aaa',
  },
  darkTotalItem: {
    borderTopColor: '#444',
  },
});

export default BookingScreen; 