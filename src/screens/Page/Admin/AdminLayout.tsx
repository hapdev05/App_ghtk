import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminMenu from './AdminMenu';
import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';

const Tab = createBottomTabNavigator();

const AdminLayout = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Users':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Orders':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminMenu}
        options={{
          title: 'Bảng điều khiển'
        }}
      />
      <Tab.Screen 
        name="Users" 
        component={AdminDashboard}
        options={{
          title: 'Người dùng'
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={AdminOrders}
        options={{
          title: 'Đơn hàng',
          
        }}
      />
    </Tab.Navigator>
  );
};

const PlaceholderScreen = () => (
  <View className="flex-1 justify-center flex items-center bg-gray-50">
    <Text className="text-lg text-gray-600">Coming Soon</Text>
  </View>
);

export default AdminLayout;
