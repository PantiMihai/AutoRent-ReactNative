import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { generateCarImageUrl } from '../services/ImageService';
import { RecentlyViewedUtil } from '../utils/RecentlyViewedUtil';
import BookingScreen from './BookingScreen';

const CarDetailsScreen = ({ car, onBack, onToggleFavorite, isFavorite }) => {
  const [showBooking, setShowBooking] = useState(false);

  if (!car) return null;

  // Add car to recently viewed when component mounts
  useEffect(() => {
    RecentlyViewedUtil.addToRecentlyViewed(car);
  }, [car]);

  const handleBookNow = () => {
    setShowBooking(true);
  };

  const handleCloseBooking = () => {
    setShowBooking(false);
  };

  const handleBookingConfirmed = useCallback(() => {
    console.log('Booking confirmed - staying on car details');
    // Just close the booking screen, stay on car details
    setShowBooking(false);
  }, []);

  // Generate rating based on car properties (simulated)
  const generateRating = (car) => {
    let rating = 4.0;
    if (car.year && car.year > 2018) rating += 0.3;
    if (car.fuel_type === 'electric') rating += 0.4;
    if (car.cylinders && car.cylinders >= 6) rating += 0.2;
    if (car.class && car.class.toLowerCase().includes('luxury')) rating += 0.3;
    return Math.min(5.0, rating).toFixed(1);
  };

  // Estimate seats based on car class
  const getSeats = (car) => {
    const carClass = car.class?.toLowerCase() || '';
    if (carClass.includes('compact') || carClass.includes('coupe')) return '2-4';
    if (carClass.includes('suv') || carClass.includes('large')) return '7-8';
    if (carClass.includes('midsize') || carClass.includes('sedan')) return '5';
    return '4-5'; // default
  };

  // Get performance info based on car specs
  const getPerformanceInfo = (car) => {
    const info = [];
    
    // Speed estimate based on car type and specs
    if (car.class?.toLowerCase().includes('sport') || car.cylinders >= 8) {
      info.push({ label: 'Top Speed', value: '250+ km/h', icon: '🏎️' });
    } else if (car.fuel_type === 'electric') {
      info.push({ label: 'Top Speed', value: '200+ km/h', icon: '⚡' });
    } else {
      info.push({ label: 'Top Speed', value: '180+ km/h', icon: '🚗' });
    }

    // Fuel type
    const fuelType = car.fuel_type || 'gasoline';
    info.push({ 
      label: fuelType.charAt(0).toUpperCase() + fuelType.slice(1), 
      value: '', 
      icon: fuelType === 'electric' ? '🔋' : '⛽' 
    });

    // Seats
    info.push({ label: `${getSeats(car)} Seats`, value: '', icon: '👥' });

    return info;
  };

  // Get engine specifications
  const getEngineSpecs = (car) => {
    const specs = [];

    // Engine/Motor type
    if (car.fuel_type === 'electric') {
      specs.push({ label: 'Motor', value: 'Electric Motor' });
    } else {
      const engineType = car.cylinders ? `${car.cylinders}-Cylinder` : 'Standard';
      const displacement = car.displacement ? ` ${car.displacement}L` : '';
      specs.push({ label: 'Engine', value: `${engineType}${displacement}` });
    }

    // Displacement (for non-electric cars)
    if (car.fuel_type !== 'electric' && car.displacement) {
      specs.push({ label: 'Displacement', value: `${car.displacement}L` });
    }

    // Range (for electric cars only)
    if (car.fuel_type === 'electric') {
      specs.push({ label: 'Range', value: '300-400 miles' });
    }

    // Transmission
    const transmission = car.transmission === 'a' ? 'Automatic' : 
                        car.transmission === 'm' ? 'Manual' : 'Automatic';
    specs.push({ label: 'Transmission', value: transmission });

    // Charging time (for electric cars only)
    if (car.fuel_type === 'electric') {
      specs.push({ label: 'Charging', value: '45-60 min' });
    }

    // Drive type
    if (car.drive) {
      const driveType = car.drive.toUpperCase();
      specs.push({ label: 'Drive', value: driveType });
    }

    // Fuel type
    if (car.fuel_type && car.fuel_type !== 'electric') {
      const fuelType = car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1);
      specs.push({ label: 'Fuel Type', value: fuelType });
    }

    // Cylinders (for non-electric cars)
    if (car.fuel_type !== 'electric' && car.cylinders) {
      specs.push({ label: 'Cylinders', value: car.cylinders.toString() });
    }

    return specs;
  };

  const rating = generateRating(car);
  const performanceInfo = getPerformanceInfo(car);
  const engineSpecs = getEngineSpecs(car);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={onToggleFavorite}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Car Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: generateCarImageUrl(car),
              cache: 'force-cache'
            }}
            style={styles.carImage}
            resizeMode="cover"
          />
        </View>

        {/* Car Info Card */}
        <View style={styles.infoCard}>
          {/* Car Name and Rating */}
          <View style={styles.titleSection}>
            <Text style={styles.carName}>{car.make} {car.model}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>

          {/* Performance Info */}
          <View style={styles.performanceContainer}>
            {performanceInfo.map((info, index) => (
              <View key={index} style={styles.performanceItem}>
                <Text style={styles.performanceIcon}>{info.icon}</Text>
                <Text style={styles.performanceLabel}>{info.label}</Text>
                {info.value ? <Text style={styles.performanceValue}>{info.value}</Text> : null}
              </View>
            ))}
          </View>

          {/* Specifications */}
          <View style={styles.specificationsSection}>
            <Text style={styles.specificationsTitle}>Specifications</Text>
            <View style={styles.specificationsContainer}>
              {engineSpecs.map((spec, index) => (
                <View key={index} style={styles.specificationItem}>
                  <View style={styles.specificationLeft}>
                    <View style={styles.specificationIconContainer}>
                      <Text style={styles.specificationIcon}>
                        {spec.label === 'Engine' || spec.label === 'Motor' ? '🔧' :
                         spec.label === 'Range' ? '🔋' :
                         spec.label === 'Displacement' ? '⚙️' :
                         spec.label === 'Transmission' ? '🚗' :
                         spec.label === 'Charging' ? '🔌' :
                         spec.label === 'Drive' ? '🚙' :
                         spec.label === 'Fuel Type' ? '⛽' :
                         spec.label === 'Cylinders' ? '🔩' : '📋'}
                      </Text>
                    </View>
                    <Text style={styles.specificationLabel}>{spec.label}</Text>
                  </View>
                  <Text style={styles.specificationValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Price and Book Button */}
          <View style={styles.bookingSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${car.price}</Text>
              <Text style={styles.priceUnit}>/day</Text>
            </View>
            <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showBooking}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseBooking}
      >
        <BookingScreen
          car={car}
          onBack={handleCloseBooking}
          onBookingConfirmed={handleBookingConfirmed}
        />
      </Modal>
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
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#333',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    flex: 1,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  carName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  specificationsSection: {
    marginBottom: 32,
  },
  specificationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  specificationsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  specificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  specificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specificationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  specificationIcon: {
    fontSize: 16,
  },
  specificationLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  specificationValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  bookingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CarDetailsScreen; 