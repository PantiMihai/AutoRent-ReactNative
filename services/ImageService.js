/**
 * Fast Car Image Service
 * 
 * This service provides fast-loading car images using static image sources:
 * 1. Unsplash car images (real photos)
 * 2. Placeholder car images as fallback
 * 3. Brand-specific fallbacks
 */

// Car brand to image mapping for better accuracy
const BRAND_IMAGE_MAP = {
  'toyota': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop&auto=format',
  'honda': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop&auto=format',
  'ford': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop&auto=format',
  'chevrolet': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&auto=format',
  'bmw': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop&auto=format',
  'mercedes': 'https://images.unsplash.com/photo-1618843479619-f3d0d81e3b84?w=400&h=300&fit=crop&auto=format',
  'audi': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&auto=format',
  'volkswagen': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&auto=format',
  'nissan': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop&auto=format',
  'hyundai': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=300&fit=crop&auto=format',
  'kia': 'https://images.unsplash.com/photo-1549399736-4bd34277ce0e?w=400&h=300&fit=crop&auto=format',
  'subaru': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop&auto=format',
  'mazda': 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&h=300&fit=crop&auto=format',
  'lexus': 'https://images.unsplash.com/photo-1563720360-3c5d50dceaf0?w=400&h=300&fit=crop&auto=format',
  'infiniti': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop&auto=format',
  'acura': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop&auto=format',
  'cadillac': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&auto=format',
  'lincoln': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&auto=format',
  'jeep': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop&auto=format',
  'ram': 'https://images.unsplash.com/photo-1563720360-3c5d50dceaf0?w=400&h=300&fit=crop&auto=format',
  'gmc': 'https://images.unsplash.com/photo-1563720360-3c5d50dceaf0?w=400&h=300&fit=crop&auto=format',
};

// Car type specific images
const CAR_TYPE_IMAGES = {
  'suv': [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1602883571715-ad0c2e19c0e0?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&auto=format',
  ],
  'sedan': [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop&auto=format',
  ],
  'sport': [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&auto=format',
  ],
  'default': [
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop&auto=format',
  ]
};

/**
 * Generate a car image URL from car data using fast static images
 * @param {Object} car - Car object from API Ninjas
 * @param {string} style - Image style preference (optional)
 * @returns {string} Image URL
 */
export const generateCarImageUrl = (car, style = 'default') => {
  if (!car) {
    return null;
  }

  const carMake = car.make?.toLowerCase() || '';
  const carType = car.type?.toLowerCase() || 'default';

  // Try brand-specific image first
  if (BRAND_IMAGE_MAP[carMake]) {
    return BRAND_IMAGE_MAP[carMake];
  }

  // Try type-specific images
  const typeImages = CAR_TYPE_IMAGES[carType] || CAR_TYPE_IMAGES['default'];
  
  // Use car properties to generate a consistent but pseudo-random selection
  const carHash = generateCarHash(car);
  const imageIndex = carHash % typeImages.length;
  
  return typeImages[imageIndex];
};

/**
 * Generate a simple hash from car properties for consistent image selection
 * @param {Object} car - Car object
 * @returns {number} Simple hash number
 */
const generateCarHash = (car) => {
  const str = `${car.make || ''}${car.model || ''}${car.year || ''}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Generate multiple car image URLs (legacy compatibility)
 * @param {Object} car - Car object from API Ninjas  
 * @param {string} style - Image style (optional)
 * @returns {Object} Object with different style URLs
 */
export const generateCarImageSet = (car, style = 'default') => {
  if (!car) return {};

  const carType = car.type?.toLowerCase() || 'default';
  const typeImages = CAR_TYPE_IMAGES[carType] || CAR_TYPE_IMAGES['default'];

  return {
    front: typeImages[0] || CAR_TYPE_IMAGES['default'][0],
    side: typeImages[1] || CAR_TYPE_IMAGES['default'][1],
    rear: typeImages[2] || CAR_TYPE_IMAGES['default'][2],
    angle: generateCarImageUrl(car, style),
  };
};

/**
 * Legacy compatibility - paint colors (not used with static images)
 */
export const PAINT_COLORS = {
  PEARL_WHITE: 'white',
  METALLIC_BLACK: 'black', 
  SILVER: 'silver',
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  GRAY: 'gray',
  YELLOW: 'yellow',
};

/**
 * Legacy compatibility - viewing angles (not used with static images)
 */
export const VIEW_ANGLES = {
  FRONT: 'front',
  SIDE: 'side',
  REAR: 'rear',
  PERSPECTIVE: 'angle',
};

/**
 * Get a random paint color (legacy compatibility)
 * @returns {string} Random paint color
 */
export const getRandomPaintColor = () => {
  const colors = Object.values(PAINT_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Get a random viewing angle (legacy compatibility)
 * @returns {string} Random viewing angle
 */
export const getRandomAngle = () => {
  const angles = Object.values(VIEW_ANGLES);
  return angles[Math.floor(Math.random() * angles.length)];
};

/**
 * Preload critical car images for better performance
 * @param {Array} cars - Array of car objects
 */
export const preloadCarImages = (cars) => {
  cars.slice(0, 6).forEach(car => {
    const imageUrl = generateCarImageUrl(car);
    if (imageUrl) {
      // Preload image
      const img = new Image();
      img.src = imageUrl;
    }
  });
}; 