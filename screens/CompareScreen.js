import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { generateCarImageUrl } from '../services/ImageService';

const CompareScreen = ({ cars, onClose, onRemoveCar, isDarkMode = false }) => {
  if (!cars || cars.length === 0) {
    return (
      <View style={[styles.emptyContainer, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>No Cars to Compare</Text>
        <Text style={[styles.emptyText, isDarkMode && styles.darkSecondaryText]}>
          Select up to 2 cars from the catalog to compare their features.
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Back to Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCarColumn = (car, index) => (
    <View key={car.id} style={styles.carColumn}>
      {/* Car Image */}
      <View style={[styles.carImageContainer, isDarkMode && styles.darkCarImageContainer]}>
        <Image
          source={{ 
            uri: generateCarImageUrl(car),
            cache: 'force-cache'
          }}
          style={styles.carImage}
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => onRemoveCar(car.id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Car Details */}
      <View style={[styles.carDetails, isDarkMode && styles.darkCarDetails]}>
        <Text style={[styles.carName, isDarkMode && styles.darkText]}>{car.make} {car.model}</Text>
        <Text style={styles.carPrice}>${car.price}/day</Text>
        
        <View style={[styles.specItem, isDarkMode && styles.darkSpecItem]}>
          <Text style={[styles.specLabel, isDarkMode && styles.darkSecondaryText]}>Year</Text>
          <Text style={[styles.specValue, isDarkMode && styles.darkText]}>{car.year || 'N/A'}</Text>
        </View>
        
        <View style={[styles.specItem, isDarkMode && styles.darkSpecItem]}>
          <Text style={[styles.specLabel, isDarkMode && styles.darkSecondaryText]}>Type</Text>
          <Text style={[styles.specValue, isDarkMode && styles.darkText]}>{car.type || 'N/A'}</Text>
        </View>
        
        <View style={[styles.specItem, isDarkMode && styles.darkSpecItem]}>
          <Text style={[styles.specLabel, isDarkMode && styles.darkSecondaryText]}>Class</Text>
          <Text style={[styles.specValue, isDarkMode && styles.darkText]}>{car.class || 'N/A'}</Text>
        </View>
        
        <View style={[styles.specItem, isDarkMode && styles.darkSpecItem]}>
          <Text style={[styles.specLabel, isDarkMode && styles.darkSecondaryText]}>Fuel Type</Text>
          <Text style={[styles.specValue, isDarkMode && styles.darkText]}>{car.fuel_type || 'Gasoline'}</Text>
        </View>
        
        <View style={[styles.specItem, isDarkMode && styles.darkSpecItem]}>
          <Text style={[styles.specLabel, isDarkMode && styles.darkSecondaryText]}>Drive</Text>
          <Text style={[styles.specValue, isDarkMode && styles.darkText]}>{car.drive?.toUpperCase() || 'N/A'}</Text>
        </View>
        
        <View style={[styles.specItem, isDarkMode && styles.darkSpecItem]}>
          <Text style={[styles.specLabel, isDarkMode && styles.darkSecondaryText]}>Transmission</Text>
          <Text style={[styles.specValue, isDarkMode && styles.darkText]}>
            {car.transmission === 'a' ? 'Automatic' : 
             car.transmission === 'm' ? 'Manual' : 'N/A'}
          </Text>
        </View>
        
        <View style={[styles.specItem, isDarkMode && styles.darkSpecItem]}>
          <Text style={[styles.specLabel, isDarkMode && styles.darkSecondaryText]}>Cylinders</Text>
          <Text style={[styles.specValue, isDarkMode && styles.darkText]}>{car.cylinders || 'N/A'}</Text>
        </View>
        
        {car.displacement && (
          <View style={[styles.specItem, isDarkMode && styles.darkSpecItem]}>
            <Text style={[styles.specLabel, isDarkMode && styles.darkSecondaryText]}>Displacement</Text>
            <Text style={[styles.specValue, isDarkMode && styles.darkText]}>{car.displacement}L</Text>
          </View>
        )}
        
        <View style={[styles.specItem, isDarkMode && styles.darkSpecItem]}>
          <Text style={[styles.specLabel, isDarkMode && styles.darkSecondaryText]}>Fuel Type</Text>
          <Text style={[styles.specValue, isDarkMode && styles.darkText]}>{car.fuel_type || 'Gasoline'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Compare Cars</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Compare Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.compareContainer}>
          {cars.map((car, index) => renderCarColumn(car, index))}
          
          {/* Add placeholder for second car if only one selected */}
          {cars.length === 1 && (
            <View style={styles.placeholderColumn}>
              <View style={[styles.placeholderBox, isDarkMode && styles.darkPlaceholderBox]}>
                <Text style={[styles.placeholderText, isDarkMode && styles.darkSecondaryText]}>+</Text>
                <Text style={[styles.placeholderLabel, isDarkMode && styles.darkSecondaryText]}>Add another car to compare</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  compareContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  carColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  carImageContainer: {
    height: 150,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  carDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  carPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 16,
    textAlign: 'center',
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  specLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    textAlign: 'right',
  },
  placeholderColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  placeholderBox: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#ccc',
    marginBottom: 8,
  },
  placeholderLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  darkCarDetails: {
    backgroundColor: '#2a2a2a',
  },
  darkSpecItem: {
    borderBottomColor: '#333',
  },
  darkPlaceholderBox: {
    backgroundColor: '#2a2a2a',
    borderColor: '#333',
  },
  darkCarImageContainer: {
    backgroundColor: '#2a2a2a',
  },
});

export default CompareScreen; 