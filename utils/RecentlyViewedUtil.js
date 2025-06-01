import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENTLY_VIEWED_KEY = 'recentlyViewedCars';
const MAX_RECENT_ITEMS = 5;

export const RecentlyViewedUtil = {
  // Add a car to recently viewed list
  addToRecentlyViewed: async (car) => {
    try {
      // Add rating and price if not present (for demo purposes)
      const carWithExtras = {
        ...car,
        rating: car.rating || (4.0 + Math.random() * 1.0).toFixed(1),
        price: car.price || Math.floor(Math.random() * 50) + 50,
        viewedAt: new Date().toISOString(),
      };

      // Get existing recently viewed cars
      const existingData = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      let recentlyViewed = existingData ? JSON.parse(existingData) : [];

      // Remove the car if it already exists (to avoid duplicates)
      recentlyViewed = recentlyViewed.filter(
        (item) => !(item.make === car.make && item.model === car.model && item.year === car.year)
      );

      // Add the new car to the beginning of the list
      recentlyViewed.unshift(carWithExtras);

      // Keep only the most recent items
      recentlyViewed = recentlyViewed.slice(0, MAX_RECENT_ITEMS);

      // Save back to AsyncStorage
      await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
      
      console.log('Added to recently viewed:', carWithExtras.make, carWithExtras.model);
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  },

  // Get recently viewed cars
  getRecentlyViewed: async () => {
    try {
      const data = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting recently viewed:', error);
      return [];
    }
  },

  // Clear all recently viewed cars
  clearRecentlyViewed: async () => {
    try {
      await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
      console.log('Recently viewed cleared');
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  },
}; 