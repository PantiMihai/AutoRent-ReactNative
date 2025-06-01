import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK_MODE_KEY = 'DARK_MODE_PREFERENCE';

export class DarkModeUtil {
  static async getDarkMode() {
    try {
      const value = await AsyncStorage.getItem(DARK_MODE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error getting dark mode preference:', error);
      return false; // Default to light mode
    }
  }

  static async setDarkMode(isDarkMode) {
    try {
      await AsyncStorage.setItem(DARK_MODE_KEY, isDarkMode.toString());
      return true;
    } catch (error) {
      console.error('Error setting dark mode preference:', error);
      return false;
    }
  }

  static async toggleDarkMode() {
    try {
      const currentMode = await this.getDarkMode();
      const newMode = !currentMode;
      await this.setDarkMode(newMode);
      return newMode;
    } catch (error) {
      console.error('Error toggling dark mode:', error);
      return false;
    }
  }
}

export default DarkModeUtil; 