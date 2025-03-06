import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type MenuItem = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const menuItems: MenuItem[] = [
  { id: 'users', title: 'User Management', icon: 'people-outline' },
  { id: 'orders', title: 'Orders', icon: 'cart-outline' },
  { id: 'delivery', title: 'Delivery', icon: 'bicycle-outline' },
  { id: 'reports', title: 'Reports', icon: 'bar-chart-outline' },
  { id: 'settings', title: 'Settings', icon: 'settings-outline' },
];

const AdminMenu = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 p-6 pb-8">
        <Text className="text-2xl font-bold text-white">Admin Dashboard</Text>
        <Text className="text-white opacity-80">Manage your application</Text>
      </View>

      {/* Menu Grid */}
      <View className="px-4 -mt-4">
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white w-[48%] rounded-xl p-4 mb-4 shadow-sm"
              onPress={() => navigation.navigate(item.id as never)}
            >
              <View className="bg-blue-50 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name={item.icon} size={24} color="#2563EB" />
              </View>
              <Text className="text-gray-900 font-semibold">{item.title}</Text>
              <Text className="text-gray-500 text-sm mt-1">
                View and manage {item.title.toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View className="mt-4 px-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Quick Stats</Text>
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-gray-500">Total Users</Text>
              <Text className="text-2xl font-bold text-gray-900">1,234</Text>
            </View>
            <Ionicons name="trending-up" size={24} color="#10B981" />
          </View>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-500">Active Orders</Text>
              <Text className="text-2xl font-bold text-gray-900">56</Text>
            </View>
            <Ionicons name="time-outline" size={24} color="#F59E0B" />
          </View>
        </View>
      </View>
      <TouchableOpacity 
        className="mx-4 mt-6 bg-red-50 p-4 rounded-xl flex-row items-center"
        onPress={() => {
        }}
      >
        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        <Text className="ml-3 text-red-600 font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminMenu;
