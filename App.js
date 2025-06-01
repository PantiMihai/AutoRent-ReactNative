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
import CarImageDemo from './components/CarImageDemo';
import LoadingSpinner from './components/LoadingSpinner';
import CatalogueScreen from './screens/CatalogueScreen';
import BottomNavigation from './components/BottomNavigation';

// Placeholder screens for other tabs
const HomeScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderTitle}>🏠 Home</Text>
    <Text style={styles.placeholderText}>Welcome to AutoRent!</Text>
    <Text style={styles.placeholderSubtext}>Find your perfect car rental</Text>
  </View>
);

const FavouritesScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderTitle}>❤️ Favourites</Text>
    <Text style={styles.placeholderText}>Your favorite cars</Text>
    <Text style={styles.placeholderSubtext}>Cars you've marked as favorites will appear here</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderTitle}>👤 Profile</Text>
    <Text style={styles.placeholderText}>Your Profile</Text>
    <Text style={styles.placeholderSubtext}>Manage your account and preferences</Text>
  </View>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog'); // Start with catalog as shown in Figma
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showDemo, setShowDemo] = useState(false);

  // Keep the original demo functionality for the Home tab
  useEffect(() => {
    if (activeTab === 'home') {
      loadCars();
    }
  }, [activeTab]);

  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing API connection...');
      const testResult = await APIController.testAPIConnection();
      
      if (testResult) {
        console.log('API connection successful, fetching random cars...');
        const carData = await APIController.fetchRandomCars(3);
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

  const handleTabPress = (tabKey) => {
    setActiveTab(tabKey);
  };

  const renderCarItem = ({ item }) => <CarCard car={item} />;

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <View style={styles.homeContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>AutoRent</Text>
              <Text style={styles.headerSubtitle}>
                {showDemo ? 'Image Customization Demo' : 'Discover Amazing Cars'}
              </Text>
            </View>

            <View style={styles.content}>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.refreshButton} onPress={refreshCars}>
                  <Text style={styles.refreshButtonText}>
                    {refreshing ? 'Loading...' : 'Load New Cars'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.demoButton, showDemo && styles.demoButtonActive]} 
                  onPress={() => setShowDemo(!showDemo)}
                >
                  <Text style={[styles.demoButtonText, showDemo && styles.demoButtonTextActive]}>
                    {showDemo ? 'Show Gallery' : 'Show Demo'}
                  </Text>
                </TouchableOpacity>
              </View>

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

              {loading ? (
                <LoadingSpinner message="Loading AutoRent cars..." />
              ) : cars.length > 0 ? (
                showDemo ? (
                  <FlatList
                    data={cars.slice(0, 1)}
                    renderItem={({ item }) => <CarImageDemo car={item} />}
                    keyExtractor={(item, index) => `demo-${item.make}-${item.model}-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                  />
                ) : (
                  <FlatList
                    data={cars}
                    renderItem={renderCarItem}
                    keyExtractor={(item, index) => `${item.make}-${item.model}-${index}`}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={refreshCars}
                    contentContainerStyle={styles.listContainer}
                  />
                )
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
          </View>
        );
      
      case 'catalog':
        return <CatalogueScreen />;
      
      case 'favourites':
        return <FavouritesScreen />;
      
      case 'profile':
        return <ProfileScreen />;
      
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Main Content */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenContainer: {
    flex: 1,
  },
  homeContainer: {
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
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    gap: 8,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#fff',
    borderColor: '#2196F3',
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonActive: {
    backgroundColor: '#2196F3',
  },
  demoButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButtonTextActive: {
    color: '#fff',
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
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  placeholderTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
