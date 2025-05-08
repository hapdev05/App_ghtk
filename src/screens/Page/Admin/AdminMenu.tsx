import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../../services/auth.service';

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

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }]
              });
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'users':
        navigation.navigate('Users' as never);
        break;
      case 'orders':
        // Chuyển đến trang quản lý đơn hàng
        Alert.alert('Thông báo', 'Chức năng đang phát triển');
        break;
      case 'delivery':
        // Chuyển đến trang quản lý giao hàng
        Alert.alert('Thông báo', 'Chức năng đang phát triển');
        break;
      case 'reports':
        // Chuyển đến trang báo cáo
        Alert.alert('Thông báo', 'Chức năng đang phát triển');
        break;
      case 'settings':
        // Hiển thị menu cài đặt với tùy chọn đăng xuất
        Alert.alert(
          'Cài đặt',
          'Chọn tùy chọn',
          [
            {
              text: 'Cài đặt hệ thống',
              onPress: () => Alert.alert('Thông báo', 'Chức năng đang phát triển')
            },
            {
              text: 'Thông tin tài khoản',
              onPress: () => Alert.alert('Thông báo', 'Chức năng đang phát triển')
            },
            {
              text: 'Đăng xuất',
              onPress: handleLogout,
              style: 'destructive'
            },
            {
              text: 'Hủy',
              style: 'cancel'
            }
          ]
        );
        break;
      default:
        break;
    }
  };

  return (
    <View className="flex-1 bg-gray-100 pt-10">
      <View className="bg-blue-600 p-4">
        <Text className="text-2xl font-bold text-white mb-1">Admin Dashboard</Text>
        <Text className="text-white text-opacity-80">Manage your application</Text>
      </View>

      <View className="px-4 -mt-4">
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white w-[48%] rounded-xl p-4 mb-4 shadow-sm"
              onPress={() => handleMenuPress(item.id)}
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
    </View>
  );
};

export default AdminMenu;
