import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

const AuthScreen = ({ onAuthSuccess, isDarkMode = false }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleNavigateToRegister = () => {
    setIsLoginMode(false);
  };

  const handleNavigateToLogin = () => {
    setIsLoginMode(true);
  };

  const handleLoginSuccess = () => {
    onAuthSuccess();
  };

  const handleRegisterSuccess = () => {
    // After successful registration, go back to login
    setIsLoginMode(true);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {isLoginMode ? (
        <LoginScreen 
          onNavigateToRegister={handleNavigateToRegister}
          onLoginSuccess={handleLoginSuccess}
          isDarkMode={isDarkMode}
        />
      ) : (
        <RegisterScreen 
          onNavigateToLogin={handleNavigateToLogin}
          onRegisterSuccess={handleRegisterSuccess}
          isDarkMode={isDarkMode}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
});

export default AuthScreen; 