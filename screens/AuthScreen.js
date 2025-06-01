import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

const AuthScreen = ({ onAuthSuccess }) => {
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
    <View style={styles.container}>
      {isLoginMode ? (
        <LoginScreen 
          onNavigateToRegister={handleNavigateToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <RegisterScreen 
          onNavigateToLogin={handleNavigateToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AuthScreen; 