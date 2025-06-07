/*
 * Cars API Documentation
 * 
 * /v1/cars GET
 * https://api.api-ninjas.com/v1/cars
*/

const API_BASE_URL = 'https://api.api-ninjas.com/v1';
const API_KEY = 'UqIy6EAWZrrgtcoav9+hSA==dfbnGvdGSiaf3oqG';

// Common car models to fetch random data
const POPULAR_CAR_MODELS = [
  'camry', 'corolla', 'civic', 'accord', 'f150', 'silverado', 'ram', 'escape',
  'cr-v', 'rav4', 'highlander', 'pilot', 'explorer', 'tahoe', 'suburban',
  'altima', 'sentra', 'maxima', 'rogue', 'pathfinder'
];

export class APIController {
  static async fetchCarData(params = {}) {
    try {
      // Remove premium-only parameters 
      const filteredParams = { ...params };
      delete filteredParams.limit;
      delete filteredParams.offset;
      
      const queryParams = new URLSearchParams(filteredParams).toString();
      const url = `${API_BASE_URL}/cars${queryParams ? `?${queryParams}` : ''}`;
      
      console.log('Fetching from URL:', url);
      console.log('With headers:', { 'X-Api-Key': API_KEY.substring(0, 10) + '...' });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': API_KEY,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching car data:', error);
      throw error;
    }
  }

  static async fetchRandomCars(count = 5) {
    try {
      const promises = [];
      const selectedModels = POPULAR_CAR_MODELS
        .sort(() => 0.5 - Math.random())
        .slice(0, count);

      console.log('Fetching cars for models:', selectedModels);

      for (const model of selectedModels) {
        // Only pass the model parameter, no premium features
        promises.push(this.fetchCarData({ model }));
      }

      const results = await Promise.all(promises);
      const cars = results.flat().filter(car => car && Object.keys(car).length > 0);
      console.log('Final car results:', cars);
      return cars;
    } catch (error) {
      console.error('Error fetching random cars:', error);
      throw error;
    }
  }

  static async searchCars(searchParams) {
    try {
      return await this.fetchCarData(searchParams);
    } catch (error) {
      console.error('Error searching cars:', error);
      throw error;
    }
  }

  // Test method to verify API connection
  static async testAPIConnection() {
    try {
      console.log('Testing API connection...');
      const result = await this.fetchCarData({ model: 'camry' });
      console.log('API test successful:', result);
      return true;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  }
} 