import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CarCard = ({ car }) => {
  if (!car) return null;

  return (
    <View style={styles.card}>
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