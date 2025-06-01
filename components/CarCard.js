import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { generateCarImageUrl } from '../services/ImageService';

const CarCard = ({ car }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!car) return null;

  // Generate car image URL with fast static images
  const imageUrl = generateCarImageUrl(car);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <View style={styles.card}>
      {/* Car Image Section */}
      <View style={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <View style={styles.imageLoading}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.loadingText}>Loading image...</Text>
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
              resizeMode="cover" // Changed from contain to cover for better visual
            />
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>🚗</Text>
            <Text style={styles.placeholderText}>
              {imageError ? 'Image not available' : 'No image'}
            </Text>
          </View>
        )}
      </View>

      {/* Car Information Section */}
      <View style={styles.header}>
        <Text style={styles.make}>{car.make?.toUpperCase() || 'N/A'}</Text>
        <Text style={styles.model}>{car.model?.toUpperCase() || 'N/A'}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Year:</Text>
          <Text style={styles.value}>{car.year || 'N/A'}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Class:</Text>
          <Text style={styles.value}>{car.class || 'N/A'}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Fuel Type:</Text>
          <Text style={styles.value}>{car.fuel_type || 'N/A'}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Drive:</Text>
          <Text style={styles.value}>{car.drive?.toUpperCase() || 'N/A'}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Transmission:</Text>
          <Text style={styles.value}>
            {car.transmission === 'a' ? 'Automatic' : 
             car.transmission === 'm' ? 'Manual' : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Cylinders:</Text>
          <Text style={styles.value}>{car.cylinders || 'N/A'}</Text>
        </View>
        
        {car.displacement && (
          <View style={styles.row}>
            <Text style={styles.label}>Displacement:</Text>
            <Text style={styles.value}>{car.displacement}L</Text>
          </View>
        )}
        
        {car.city_mpg && (
          <View style={styles.row}>
            <Text style={styles.label}>City MPG:</Text>
            <Text style={styles.value}>{car.city_mpg}</Text>
          </View>
        )}
        
        {car.highway_mpg && (
          <View style={styles.row}>
            <Text style={styles.label}>Highway MPG:</Text>
            <Text style={styles.value}>{car.highway_mpg}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
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
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  make: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  model: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
});

export default CarCard; 