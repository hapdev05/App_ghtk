import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { getCustomerOrderDetails } from '../../../../services/customer.service';
import MapView, { Marker } from 'react-native-maps';
import { forwardGeoCode } from '../../../../services/geocoding.service';

interface OrderDetailRouteParams {
  orderId: number;
}

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

interface Location {
  lat: number;
  long: number;
}

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as OrderDetailRouteParams;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipientLocation, setRecipientLocation] = useState<Location | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  useEffect(() => {
    if (order?.recipient?.address) {
      fetchRecipientLocation(order.recipient.address);
    }
  }, [order]);

  const fetchRecipientLocation = async (address: string) => {
    try {
      setLoadingLocation(true);
      const location = await forwardGeoCode(address);
      if (location) {
        setRecipientLocation(location);
      } else {
        console.log('Không thể chuyển đổi địa chỉ sang tọa độ');
      }
    } catch (error) {
      console.error('Lỗi khi lấy tọa độ từ địa chỉ:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const details = await getCustomerOrderDetails(params.orderId);
      setOrder(details);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
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
        return <Ionicons name="time" size={18} color="#f39c12" />;
      case 'processing':
        return <Ionicons name="sync" size={18} color="#3498db" />;
      case 'shipped':
        return <Ionicons name="car" size={18} color="#2ecc71" />;
      case 'delivered':
        return <Ionicons name="checkmark-circle" size={18} color="#27ae60" />;
      case 'cancelled':
        return <Ionicons name="close-circle" size={18} color="#e74c3c" />;
      default:
        return <Ionicons name="help" size={18} color="#95a5a6" />;
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3498db" />
        <Text className="mt-3 text-base text-gray-600">Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text className="mt-3 text-base text-gray-600">Không tìm thấy thông tin đơn hàng</Text>
        <TouchableOpacity 
          className="mt-5 bg-blue-500 px-5 py-3 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex flex-row items-center pt-12 pb-4 px-5 border-b border-gray-100 border-solid bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#34495e" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Chi tiết đơn hàng</Text>
      </View>
      
      <ScrollView className="flex-1">
        <View>
          {recipientLocation ? (
            <MapView 
              className='w-full h-[270px]'
              initialRegion={{
                latitude: recipientLocation.lat,
                longitude: recipientLocation.long,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: recipientLocation.lat,
                  longitude: recipientLocation.long
                }}
                title="Địa chỉ người nhận"
                description={order?.recipient.address}
              />
            </MapView>
          ) : (
            <View className="w-full h-[270px] bg-gray-200 justify-center items-center">
              {loadingLocation ? (
                <ActivityIndicator size="large" color="#3498db" />
              ) : (
                <Text className="text-gray-500">Không thể hiển thị bản đồ</Text>
              )}
            </View>
          )}
        </View>
        
        <View className="p-4">
          <View className="mb-5 bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-base font-bold text-gray-800 mb-3">Thông tin đơn hàng</Text>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Mã đơn hàng:</Text>
              <Text className="flex-1 text-sm text-gray-800">#{order.orderId}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Tên đơn hàng:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.orderName}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Ngày tạo:</Text>
              <Text className="flex-1 text-sm text-gray-800">{formatDate(order.createdAt)}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Giá trị:</Text>
              <Text className="flex-1 text-sm text-gray-800">{formatPrice(order.price)}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Trạng thái:</Text>
              <View className="flex flex-row items-center px-2 py-1 rounded-full bg-opacity-20" style={{ backgroundColor: getStatusColor(order.status) + '20' }}>
                <View className="mr-1">
                  {getStatusIcon(order.status)}
                </View>
                <Text className="text-sm font-semibold" style={{ color: getStatusColor(order.status) }}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>
            {order.description && (
              <View className="flex flex-row items-center mb-2">
                <Text className="w-32 text-sm text-gray-600">Mô tả:</Text>
                <Text className="flex-1 text-sm text-gray-800">{order.description}</Text>
              </View>
            )}
          </View>

          <View className="mb-5 bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-base font-bold text-gray-800 mb-3">Thông tin người gửi</Text>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Tên:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.sender.name}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Số điện thoại:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.sender.phone}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Địa chỉ:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.sender.address}</Text>
            </View>
          </View>

          <View className="mb-5 bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-base font-bold text-gray-800 mb-3">Thông tin người nhận</Text>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Tên:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.recipient.name}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Số điện thoại:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.recipient.phone}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Địa chỉ:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.recipient.address}</Text>
            </View>
          </View>

          {order.packagePhotos && order.packagePhotos.length > 0 && (
            <View className="mb-5 bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-base font-bold text-gray-800 mb-3">Hình ảnh gói hàng</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                {order.packagePhotos.map((item, index) => (
                  <Image
                    key={`photo-${index}`}
                    source={{ uri: item.startsWith('http') ? item : `https://fa6e-2001-ee0-4b49-c580-bc32-ded9-8e98-e594.ngrok-free.app/data/img/${item}` }}
                    className="w-60 h-60 rounded-lg mr-2"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetailScreen; 