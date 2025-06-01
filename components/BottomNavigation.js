import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BottomNavigation = ({ activeTab, onTabPress, isDarkMode = false }) => {
  const tabs = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'catalog', label: 'Catalog', icon: '🚗' },
    { key: 'favourites', label: 'Favourites', icon: '🤍' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  const getTabIcon = (tab) => {
    if (tab.key === 'favourites') {
      return activeTab === tab.key ? '❤️' : '🤍';
    }
    return tab.icon;
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabIcon,
            activeTab === tab.key && styles.tabIconActive
          ]}>
            {getTabIcon(tab)}
          </Text>
          <Text style={[
            styles.tabLabel,
            isDarkMode && styles.darkTabLabel,
            activeTab === tab.key && styles.tabLabelActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
  darkContainer: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  darkTabLabel: {
    color: '#aaa',
  },
  tabLabelActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default BottomNavigation; 