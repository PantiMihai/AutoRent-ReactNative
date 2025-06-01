import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { generateCarImageUrl } from '../services/ImageService';

const CarCatalogueCard = ({ 
  car, 
  isFavorite, 
  isInCompare, 
  onToggleFavorite, 
  onToggleCompare,
  onPress,
  isDarkMode = false
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!car) return null;

  // Generate car image with fast static images
  const imageUrl = generateCarImageUrl(car);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <TouchableOpacity 
      style={[styles.card, isDarkMode && styles.darkCard]} 
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Car Image Container */}
      <View style={[styles.imageContainer, isDarkMode && styles.darkImageContainer]}>
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <View style={styles.imageLoading}>
                <ActivityIndicator size="small" color="#2196F3" />
              </View>
            )}
            <Image
              source={{ 
                uri: imageUrl,
                cache: 'force-cache' // Enable image caching for better performance
              }}
              style={[styles.carImage, imageLoading && styles.hiddenImage]}
              onLoad={handleImageLoad}
              onError={handleImageError}
              resizeMode="cover" // Changed from contain to cover for better visual appeal
            />
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>🚗</Text>
          </View>
        )}
        
        {/* Favorite Button */}
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={onToggleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[
            styles.favoriteIcon,
            isFavorite && styles.favoriteIconActive
          ]}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
        
        {/* Compare Indicator */}
        {isInCompare && (
          <View style={styles.compareIndicator}>
            <Text style={styles.compareIndicatorText}>✓</Text>
          </View>
        )}
      </View>

      {/* Car Information */}
      <View style={styles.carInfo}>
        <Text style={[styles.carMake, isDarkMode && styles.darkText]} numberOfLines={1}>
          {car.make} {car.model}
        </Text>
        <Text style={[styles.carType, isDarkMode && styles.darkSecondaryText]}>
          {car.type}
        </Text>
        
        {/* Price and Compare */}
        <View style={styles.bottomRow}>
          <Text style={[styles.price, isDarkMode && styles.darkText]}>
            ${car.price}
            <Text style={[styles.priceUnit, isDarkMode && styles.darkSecondaryText]}> /day</Text>
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.compareButton,
              isDarkMode && styles.darkCompareButton,
              isInCompare && styles.compareButtonActive
            ]}
            onPress={onToggleCompare}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Text style={[
              styles.compareButtonText,
              isDarkMode && styles.darkCompareButtonText,
              isInCompare && styles.compareButtonTextActive
            ]}>
              {isInCompare ? '−' : '+'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  imageContainer: {
    height: 120,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  hiddenImage: {
    opacity: 0,
  },
  imageLoading: {
    position: 'absolute',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  placeholderIcon: {
    fontSize: 32,
    opacity: 0.5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  favoriteIconActive: {
    fontSize: 16,
  },
  compareIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  carInfo: {
    padding: 12,
  },
  carMake: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  carType: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#999',
  },
  compareButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareButtonActive: {
    backgroundColor: '#4CAF50',
  },
  compareButtonText: {
    fontSize: 16,
  },
  compareButtonTextActive: {
    color: '#fff',
  },
  darkCard: {
    backgroundColor: '#333',
  },
  darkImageContainer: {
    backgroundColor: '#444',
  },
  darkText: {
    color: '#fff',
  },
  darkSecondaryText: {
    color: '#ccc',
  },
  darkCompareButton: {
    backgroundColor: '#555',
  },
  darkCompareButtonText: {
    color: '#fff',
  },
});

export default CarCatalogueCard; 