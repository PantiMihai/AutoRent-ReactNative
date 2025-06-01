# AutoRent - React Native Car Discovery App

AutoRent is a React Native application built with Expo that displays car information using the API Ninjas Cars API. The app showcases random car models with detailed specifications in a clean, modern interface.

## Features

- 🚗 Display random car models from popular manufacturers
- 🔄 Refresh functionality to load new cars
- 📱 Modern, responsive design
- 🎯 Clean card-based UI for car information
- ⚡ Fast API integration with error handling

## Car Information Displayed

- Make and Model
- Year
- Vehicle Class
- Fuel Type
- Drive Type (FWD, RWD, AWD, 4WD)
- Transmission (Automatic/Manual)
- Number of Cylinders
- Engine Displacement
- Fuel Economy (City/Highway MPG when available)

## API Integration

The app uses the [API Ninjas Cars API](https://api-ninjas.com/api/cars) to fetch real car data. The API provides comprehensive information about thousands of vehicle models from over a hundred automakers.

## Installation and Setup

1. Make sure you have Node.js installed
2. Install Expo CLI globally:
   ```bash
   npm install -g @expo/cli
   ```

3. Navigate to the project directory:
   ```bash
   cd AutoRent
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm start
   # or
   expo start
   ```

6. Run on your preferred platform:
   - **Android**: `npm run android` or scan QR code with Expo Go app
   - **iOS**: `npm run ios` (macOS required) or scan QR code with Camera app
   - **Web**: `npm run web`

## Project Structure

```
AutoRent/
├── controllers/
│   └── APIController.js    # API integration and data fetching
├── components/
│   ├── CarCard.js         # Individual car display component
│   └── LoadingSpinner.js  # Loading indicator component
├── App.js                 # Main application component
├── package.json           # Dependencies and scripts
└── README.md             # Project documentation
```

## API Controller

The `APIController.js` includes complete documentation for the Cars API endpoints and provides methods for:
- Fetching car data with various parameters
- Getting random car selections
- Searching cars with specific criteria

## Development

The app is built with:
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **API Ninjas Cars API** - Real car data source

## Screenshots

The app features:
- Blue-themed header with app branding
- Card-based layout for easy car browsing
- Smooth loading states and error handling
- Pull-to-refresh functionality

## Next Steps

This is a basic implementation ready for further enhancements such as:
- Search functionality
- Filtering by car specifications
- Favorites system
- Detailed car views
- Car comparison features

## License

This project is for educational purposes and demonstrates React Native development with external API integration. 