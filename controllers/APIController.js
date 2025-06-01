/*
 * Cars API Documentation
 * 
 * /v1/cars GET
 * https://api.api-ninjas.com/v1/cars
 * 
 * Get car data from given parameters. Returns a list of car models (and their information) that satisfy the parameters.
 * 
 * Parameters:
 * - make (optional): Vehicle manufacturer (e.g. audi or toyota)
 * - model (optional): Vehicle model (e.g. a4 or corolla)
 * - fuel_type (optional): Type of fuel used. Possible values: gas, diesel, electricity
 * - drive (optional): Drive transmission. Possible values: fwd (front-wheel drive), rwd (rear-wheel drive), awd (all-wheel drive), 4wd (four-wheel drive)
 * - cylinders (optional): Number of cylinders in engine. Possible values: 2, 3, 4, 5, 6, 8, 10, 12, 16
 * - transmission (optional): Type of transmission. Possible values: manual, automatic
 * - year (optional): Vehicle model year (e.g. 2018)
 * - min_city_mpg (optional): Minimum city fuel consumption (in miles per gallon)
 * - max_city_mpg (optional): Maximum city fuel consumption (in miles per gallon)
 * - min_hwy_mpg (optional): Minimum highway fuel consumption (in miles per gallon)
 * - max_hwy_mpg (optional): Maximum highway fuel consumption (in miles per gallon)
 * - min_comb_mpg (optional): Minimum combination (city and highway) fuel consumption (in miles per gallon)
 * - max_comb_mpg (optional): Maximum combination (city and highway) fuel consumption (in miles per gallon)
 * - limit (optional Premium Only): How many results to return. Must be between 1 and 50. Default is 1
 * - offset (optional Premium Only): Number of results to skip. Used for pagination. Default is 0
 * 
 * Headers:
 * - X-Api-Key (required): API Key associated with your account
 * 
 * Response:
 * - city_mpg (premium only): City fuel consumption in miles per gallon
 * - highway_mpg (premium only): Highway fuel consumption in miles per gallon
 * - combination_mpg (premium only): Combined city and highway fuel consumption in miles per gallon
 * - class: Vehicle class category (e.g. "midsize car", "suv", etc.)
 * - cylinders: Number of cylinders in the engine
 * - displacement: Engine displacement in liters
 * - drive: Drive type (e.g. "fwd" for front-wheel drive, "awd" for all-wheel drive, etc.)
 * - fuel_type: Type of fuel the vehicle uses (e.g. "gas", "diesel", etc.)
 * - make: Vehicle manufacturer (e.g. "toyota")
 * - model: Vehicle model name (e.g. "camry")
 * - transmission: Transmission type (e.g. "a" for automatic, "m" for manual)
 * - year: Vehicle model year
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
      // Remove premium-only parameters that might cause issues
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