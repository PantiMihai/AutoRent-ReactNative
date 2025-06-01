import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { APIController } from './controllers/APIController';
import CarCard from './components/CarCard';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First test the API connection
      console.log('Testing API connection...');
      const testResult = await APIController.testAPIConnection();
      
      if (testResult) {
        console.log('API connection successful, fetching random cars...');
        const carData = await APIController.fetchRandomCars(3); // Reduced count to avoid rate limits
        console.log('Received car data:', carData);
        setCars(carData);
      } else {
        throw new Error('API connection test failed');
      }
    } catch (error) {
      console.error('Failed to load cars:', error);
      setError(error.message);
      Alert.alert(
        'Error', 
        `Failed to load car data: ${error.message}\n\nThis might be due to API key issues or rate limits. Please check the console for more details.`
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshCars = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const carData = await APIController.fetchRandomCars(3);
      setCars(carData);
    } catch (error) {
      console.error('Failed to refresh cars:', error);
      setError(error.message);
      Alert.alert(
        'Error', 
        `Failed to refresh car data: ${error.message}`
      );
    } finally {
      setRefreshing(false);
    }
  };

  const renderCarItem = ({ item }) => <CarCard car={item} />;

  if (loading) {
    return <LoadingSpinner message="Loading AutoRent cars..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AutoRent</Text>
        <Text style={styles.headerSubtitle}>Discover Amazing Cars</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshCars}>
          <Text style={styles.refreshButtonText}>
            {refreshing ? 'Loading...' : 'Load New Cars'}
          </Text>
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.debugButton} onPress={() => {
              console.log('Current state - Cars:', cars.length, 'Error:', error);
              Alert.alert('Debug Info', `Cars loaded: ${cars.length}\nError: ${error || 'None'}`);
            }}>
              <Text style={styles.debugButtonText}>Show Debug Info</Text>
            </TouchableOpacity>
          </View>
        )}

        {cars.length > 0 ? (
          <FlatList
            data={cars}
            renderItem={renderCarItem}
            keyExtractor={(item, index) => `${item.make}-${item.model}-${index}`}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={refreshCars}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {error ? 'Failed to load cars' : 'No cars found'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadCars}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 8,
  },
  debugButton: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
