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
// Initialize Firebase first
import './services/firebaseConfig';
import { APIController } from './controllers/APIController';
import CarCard from './components/CarCard';
import CarImageDemo from './components/CarImageDemo';
import LoadingSpinner from './components/LoadingSpinner';
import CatalogueScreen from './screens/CatalogueScreen';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import BottomNavigation from './components/BottomNavigation';
import AuthService from './services/AuthService';
import DarkModeUtil from './utils/DarkModeUtil';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // Start with home screen
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Initialize app with dark mode and auth state
    initializeApp();

    // Listen to authentication state changes
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const initializeApp = async () => {
    try {
      // Load dark mode preference
      const darkMode = await DarkModeUtil.getDarkMode();
      setIsDarkMode(darkMode);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const handleDarkModeToggle = async () => {
    try {
      const newMode = await DarkModeUtil.toggleDarkMode();
      setIsDarkMode(newMode);
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await AuthService.logout();
            if (result.success) {
              setIsAuthenticated(false);
              setActiveTab('home'); // Reset to home tab
            } else {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleTabPress = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleNavigate = (screen) => {
    setActiveTab(screen);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} isDarkMode={isDarkMode} />;
      
      case 'catalog':
        return <CatalogueScreen isDarkMode={isDarkMode} />;
      
      case 'favourites':
        return (
          <FavoritesScreen 
            key={`favorites-${activeTab}`}
            isDarkMode={isDarkMode} 
            isActive={activeTab === 'favourites'} 
          />
        );
      
      case 'profile':
        return (
          <ProfileScreen 
            onLogout={handleLogout} 
            onNavigate={handleNavigate} 
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleDarkModeToggle}
          />
        );
      
      default:
        return <HomeScreen onNavigate={handleNavigate} isDarkMode={isDarkMode} />;
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#121212" : "#fff"} />
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} isDarkMode={isDarkMode} />;
  }

  // Show main app if authenticated
  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#121212" : "#fff"} />
      
      {/* Main Content */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} isDarkMode={isDarkMode} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  logoutButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkText: {
    color: '#fff',
  },
  darkSecondaryText: {
    color: '#999',
  },
});
