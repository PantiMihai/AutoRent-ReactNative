import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { generateCarImageUrl } from '../services/ImageService';

const BookingDetailsScreen = ({ booking, onBack, onModify, onExtend, isDarkMode = false }) => {
  if (!booking) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={[styles.backIcon, isDarkMode && styles.darkText]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Booking Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>No booking found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const formatTime = (time) => {
    return time || '10:00 AM';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#4CAF50';
      case 'in progress':
        return '#2196F3';
      case 'completed':
        return '#9E9E9E';
      case 'cancelled':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const generateRating = (car) => {
    let rating = 4.0;
    if (car.year && car.year > 2018) rating += 0.3;
    if (car.fuel_type === 'electric') rating += 0.4;
    if (car.cylinders && car.cylinders >= 6) rating += 0.2;
    if (car.class && car.class.toLowerCase().includes('luxury')) rating += 0.3;
    return Math.min(5.0, rating).toFixed(1);
  };

  const rating = generateRating(booking.car);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[styles.backIcon, isDarkMode && styles.darkText]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Booking Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Status */}
        <View style={[styles.statusCard, isDarkMode && styles.darkCard]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
              <Text style={styles.statusText}>{booking.status || 'Confirmed'}</Text>
            </View>
            {booking.id && (
              <Text style={[styles.bookingId, isDarkMode && styles.darkSecondaryText]}>
                Booking #{booking.id.slice(-4).toUpperCase()}
              </Text>
            )}
          </View>
        </View>

        {/* Car Details */}
        <View style={[styles.carCard, isDarkMode && styles.darkCard]}>
          <Image
            source={{ 
              uri: generateCarImageUrl(booking.car),
              cache: 'force-cache'
            }}
            style={styles.carImage}
            resizeMode="cover"
          />
          <View style={styles.carInfo}>
            <Text style={[styles.carName, isDarkMode && styles.darkText]}>
              {booking.car.make} {booking.car.model}
            </Text>
            <Text style={[styles.carSpecs, isDarkMode && styles.darkSecondaryText]}>
              {booking.car.fuel_type === 'electric' ? 'Electric' : 'Gasoline'} • {booking.car.transmission === 'a' ? 'Automatic' : 'Manual'}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={[styles.ratingText, isDarkMode && styles.darkText]}>{rating}</Text>
            </View>
          </View>
        </View>

        {/* Rental Period */}
        <View style={[styles.sectionCard, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Rental Period</Text>
          <View style={styles.periodContainer}>
            <View style={styles.periodItem}>
              <Text style={[styles.periodLabel, isDarkMode && styles.darkSecondaryText]}>Pick-up</Text>
              <Text style={[styles.periodDate, isDarkMode && styles.darkText]}>
                {formatDate(booking.rentalPeriod?.startDate)}
              </Text>
              <Text style={[styles.periodTime, isDarkMode && styles.darkSecondaryText]}>
                {formatTime(booking.rentalPeriod?.startTime)}
              </Text>
            </View>
            <View style={styles.arrow}>
              <Text style={[styles.arrowIcon, isDarkMode && styles.darkSecondaryText]}>→</Text>
            </View>
            <View style={styles.periodItem}>
              <Text style={[styles.periodLabel, isDarkMode && styles.darkSecondaryText]}>Return</Text>
              <Text style={[styles.periodDate, isDarkMode && styles.darkText]}>
                {formatDate(booking.rentalPeriod?.endDate)}
              </Text>
              <Text style={[styles.periodTime, isDarkMode && styles.darkSecondaryText]}>
                {formatTime(booking.rentalPeriod?.endTime)}
              </Text>
            </View>
          </View>
          <Text style={[styles.durationText, isDarkMode && styles.darkSecondaryText]}>
            Duration: {booking.rentalPeriod?.duration || 1} day{(booking.rentalPeriod?.duration || 1) !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Location */}
        <View style={[styles.sectionCard, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Pick-up Location</Text>
          <Text style={[styles.locationText, isDarkMode && styles.darkText]}>
            {booking.pickupLocation || 'Universității nr. 1, Oradea, 410087, Bihor'}
          </Text>
        </View>

        {/* Price Breakdown */}
        <View style={[styles.sectionCard, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Price Breakdown</Text>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, isDarkMode && styles.darkSecondaryText]}>
              Daily rate ({booking.rentalPeriod?.duration || 1} day{(booking.rentalPeriod?.duration || 1) !== 1 ? 's' : ''})
            </Text>
            <Text style={[styles.priceValue, isDarkMode && styles.darkText]}>
              ${booking.priceBreakdown?.dailyRate * (booking.rentalPeriod?.duration || 1) || booking.car.price}
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, isDarkMode && styles.darkSecondaryText]}>Service fee</Text>
            <Text style={[styles.priceValue, isDarkMode && styles.darkText]}>
              ${booking.priceBreakdown?.serviceFee || 25}
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, isDarkMode && styles.darkSecondaryText]}>Insurance</Text>
            <Text style={[styles.priceValue, isDarkMode && styles.darkText]}>
              ${booking.priceBreakdown?.insurance || 30}
            </Text>
          </View>
          <View style={[styles.priceItem, styles.totalPrice]}>
            <Text style={[styles.totalLabel, isDarkMode && styles.darkText]}>Total</Text>
            <Text style={[styles.totalValue, isDarkMode && styles.darkText]}>
              ${booking.priceBreakdown?.total || (booking.car.price + 55)}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.sectionCard, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <Text style={[styles.paymentIcon, isDarkMode && styles.darkText]}>💳</Text>
            <Text style={[styles.paymentText, isDarkMode && styles.darkText]}>
              {booking.paymentMethod === 'card' ? 'Credit Card' : 'Cash'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {(booking.status === 'in progress' || booking.status === 'confirmed') && (
        <View style={[styles.actionsContainer, isDarkMode && styles.darkActionsContainer]}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onModify}>
            <Text style={styles.secondaryButtonText}>Modify</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onExtend}>
            <Text style={styles.secondaryButtonText}>Extend</Text>
          </TouchableOpacity>
        </View>
      )}
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
  backButton: {
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  bookingId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  carCard: {
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
  carImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 15,
  },
  carInfo: {
    alignItems: 'center',
  },
  carName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  carSpecs: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  periodItem: {
    flex: 1,
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  periodDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  periodTime: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    paddingHorizontal: 20,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#666',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 15,
  },
  darkActionsContainer: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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

export default BookingDetailsScreen; 