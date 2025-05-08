import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { StatusBar } from 'expo-status-bar';
import OrderItem from './OrderItem';
import { getCustomerOrders } from '../../../../services/customer.service';

type RootStackParamList = {
  OrderDetailScreen: { orderId: number };
  CreateOrder: undefined;
};

interface Order {
  orderId: number;
  orderName: string;
  username: string;
  price: number;
  status: string;
  packagePhotos: string[];
  sender: {
    name: string;
    phone: string;
    address: string;
  };
  recipient: {
    name: string;
    phone: string;
    address: string;
  };
  createdAt?: string;
  description?: string;
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getCustomerOrders();
      setOrders(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      return () => {};
    }, [])
  );

  const viewOrderDetails = (order: Order) => {
    // Chuyển đến màn hình OrderDetailScreen với orderId
    navigation.navigate('OrderDetailScreen', { orderId: order.orderId });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f39c12'; // Màu cam
      case 'processing':
        return '#3498db'; // Màu xanh dương
      case 'shipped':
        return '#2ecc71'; // Màu xanh lá
      case 'delivered':
        return '#27ae60'; // Màu xanh lá đậm
      case 'cancelled':
        return '#e74c3c'; // Màu đỏ
      default:
        return '#95a5a6'; // Màu xám
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <MaterialIcons name="pending-actions" size={18} color="#f39c12" />;
      case 'processing':
        return <MaterialIcons name="sync" size={18} color="#3498db" />;
      case 'shipped':
        return <FontAwesome5 name="shipping-fast" size={16} color="#2ecc71" />;
      case 'delivered':
        return <MaterialIcons name="check-circle" size={18} color="#27ae60" />;
      case 'cancelled':
        return <MaterialIcons name="cancel" size={18} color="#e74c3c" />;
      default:
        return <MaterialIcons name="help" size={18} color="#95a5a6" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3498db" />
        <Text className="mt-3 text-base text-gray-600">Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <View className="pt-12 pb-4 px-5 bg-white border-b border-gray-100 border-solid">
        <Text className="text-xl font-bold text-gray-800">Lịch sử đơn hàng</Text>
      </View>

      {!loading && orders.length === 0 ? (
        <View className="flex-1 justify-center flex items-center p-5">
          <Ionicons name="document-text-outline" size={64} color="#bdc3c7" />
          <Text className="text-base text-gray-600 mt-3 mb-5">Bạn chưa có đơn hàng nào</Text>
          <TouchableOpacity
            className="bg-blue-500 px-5 py-3 rounded-lg"
            onPress={() => navigation.navigate('CreateOrder')}
          >
            <Text className="text-white font-semibold">Tạo đơn hàng mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="p-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3498db']}
              tintColor="#3498db"
            />
          }
        >
          {orders.map((item) => (
            <OrderItem
              key={item.orderId.toString()}
              item={item}
              onPress={viewOrderDetails}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              getStatusIcon={getStatusIcon}
              formatDate={formatDate}
              formatPrice={formatPrice}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default OrderHistory;