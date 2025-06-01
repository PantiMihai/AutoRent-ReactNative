import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { generateCarImageUrl, generateCarImageSet } from '../services/ImageService';

const CarImageDemo = ({ car }) => {
  const [selectedView, setSelectedView] = useState('default');

  if (!car) return null;

  const imageSet = generateCarImageSet(car);
  const currentImage = selectedView === 'default' ? generateCarImageUrl(car) : imageSet[selectedView];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Car Image Preview</Text>
      
      {/* Main Image Display */}
      <View style={styles.imageContainer}>
        {currentImage ? (
          <Image 
            source={{ 
              uri: currentImage,
              cache: 'force-cache'
            }} 
            style={styles.carImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🚗</Text>
            <Text>No image available</Text>
          </View>
        )}
      </View>

      {/* View Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Views:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
          {['default', 'front', 'side', 'rear', 'angle'].map((view) => (
            <TouchableOpacity
              key={view}
              style={[
                styles.viewOption,
                selectedView === view && styles.selectedOption
              ]}
              onPress={() => setSelectedView(view)}
            >
              <Text style={styles.optionText}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Car Info */}
      <View style={styles.carInfo}>
        <Text style={styles.carInfoText}>
          {car.make} {car.model} ({car.year})
        </Text>
        <Text style={styles.carTypeText}>
          Type: {car.type || 'Unknown'}
        </Text>
        <Text style={styles.imageUrlText} numberOfLines={2}>
          Image: Fast-loading static image
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  viewOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  carInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  carInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  carTypeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  imageUrlText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

export default CarImageDemo; 