import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { generateCarImageUrl } from '../services/ImageService';

const RatingScreen = ({ booking, onBack, onSubmitReview, isDarkMode = false }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  if (!booking) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={[styles.backIcon, isDarkMode && styles.darkText]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Rate your experience</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>No booking found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDateRange = (startDate, endDate) => {
    const formatDate = (date) => {
      const options = { month: 'short', day: 'numeric' };
      return new Date(date).toLocaleDateString('en-US', options);
    };
    
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    const year = new Date(endDate).getFullYear();
    return `${start} - ${end}, ${year}`;
  };

  const handleStarPress = (starIndex) => {
    setRating(starIndex + 1);
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    const reviewData = {
      rating,
      review: review.trim(),
      reviewDate: new Date().toISOString(),
    };

    onSubmitReview(reviewData);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starButton}
          onPress={() => handleStarPress(i)}
          activeOpacity={0.7}
        >
          <Text style={[styles.star, i < rating ? styles.starFilled : styles.starEmpty]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[styles.backIcon, isDarkMode && styles.darkText]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Rate your experience</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Car Details Card */}
        <View style={[styles.carCard, isDarkMode && styles.darkCard]}>
          <Image
            source={{ 
              uri: generateCarImageUrl(booking.car),
              cache: 'force-cache'
            }}
            style={styles.carImage}
            resizeMode="cover"
          />
          <View style={styles.carInfo}>
            <Text style={[styles.carName, isDarkMode && styles.darkText]}>
              {booking.car.make} {booking.car.model} {booking.car.year || ''}
            </Text>
            <Text style={[styles.carDates, isDarkMode && styles.darkSecondaryText]}>
              {formatDateRange(booking.rentalPeriod?.startDate, booking.rentalPeriod?.endDate)}
            </Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={[styles.ratingQuestion, isDarkMode && styles.darkText]}>
            How was your rental experience?
          </Text>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
        </View>

        {/* Review Text Input */}
        <View style={styles.reviewSection}>
          <Text style={[styles.reviewLabel, isDarkMode && styles.darkText]}>
            Share your experience (optional)
          </Text>
          <TextInput
            style={[styles.reviewInput, isDarkMode && styles.darkInput]}
            placeholder="What did you like or dislike about this rental?"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            multiline
            numberOfLines={6}
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]} 
          onPress={handleSubmitReview}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  darkHeader: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  carCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
  },
  carImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  carDates: {
    fontSize: 14,
    color: '#666',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  ratingQuestion: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 40,
  },
  starFilled: {
    color: '#2196F3',
  },
  starEmpty: {
    color: '#333',
  },
  reviewSection: {
    marginBottom: 40,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 15,
  },
  reviewInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  darkInput: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  darkText: {
    color: '#fff',
  },
  darkSecondaryText: {
    color: '#aaa',
  },
});

export default RatingScreen; 