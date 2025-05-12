import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Alert,
  Image,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getShipperOrders, updateOrderStatus } from "../../../services/shipper.service";

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
  createdAt: string;
  description: string;
}

const ShipperOrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getFullPhotoUrl = (photoUrl: string) => {
    if (photoUrl.startsWith('http')) return photoUrl;
    return `https://605a-2001-ee0-4b49-c580-797a-942-f6d6-e6f2.ngrok-free.app/data/img/${photoUrl}`;
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getShipperOrders();
      // Đảm bảo luôn truyền đúng mảng đơn hàng vào state
      if (Array.isArray(response)) {
        setOrders(response);
      } else if (response && Array.isArray(response.orders)) {
        setOrders(response.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  } 

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order =>
        order.orderId === orderId
          ? { ...order, status: newStatus }
          : order
      ));
      Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return 'text-green-600 bg-green-100';
      case 'Đang giao':
        return 'text-blue-600 bg-blue-100';
      case 'Đã giao':
        return 'text-green-600 bg-green-100';
      case 'Đã huỷ':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-900';
    }
  };

  const renderOrderItem = (item: Order) => (
    <View key={item.orderId} className="bg-white p-4 mx-3 my-1.5 rounded-xl shadow-sm">
      <View className="flex flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100 border-solid">
        <View>
          <Text className="text-lg font-bold text-gray-900">{item.orderName}</Text>
          <Text className="text-sm text-gray-500 mt-1">Mã đơn: {item.orderId}</Text>
        </View>
        <Text className={`px-3 py-1.5 rounded-full ${getStatusColor(item.status)} bg-opacity-10 font-medium`}>
          {item.status}
        </Text>
      </View>

      <View className="mb-4">
        <View className="flex flex-row items-center mb-2">
          <MaterialIcons name="person" size={18} color="#4B5563" />
          <Text className="text-base text-gray-700 ml-2">Người đặt: {item.username}</Text>
        </View>
        <View className="flex flex-row items-center mb-2">
          <MaterialIcons name="local-shipping" size={18} color="#4B5563" />
          <Text className="text-base text-gray-700 ml-2">Địa chỉ giao: {item.recipient.address}</Text>
        </View>
        <View className="flex flex-row items-center">
          <MaterialIcons name="attach-money" size={18} color="#4B5563" />
          <Text className="text-base text-gray-700 ml-2">Giá: {item.price.toLocaleString()}đ</Text>
        </View>
      </View>

      <View className="flex flex-row justify-end items-center pt-2 border-t border-gray-100 border-solid">
        <TouchableOpacity
          className="flex flex-row items-center bg-blue-600 px-3 py-2 rounded-lg mr-2"
          onPress={() => {
            setSelectedOrder(item);
            setModalVisible(true);
          }}
        >
          <MaterialIcons name="info" size={20} color="#fff" />
          <Text className="text-white font-semibold ml-1.5">Chi tiết</Text>
        </TouchableOpacity>

        {item.status === 'Đã xác nhận' && (
          <TouchableOpacity
            className="flex flex-row items-center bg-blue-500 px-3 py-2 rounded-lg"
            onPress={() => handleUpdateOrderStatus(item.orderId, 'Đang giao')}
          >
            <MaterialIcons name="local-shipping" size={20} color="#fff" />
            <Text className="text-white font-semibold ml-1.5">Bắt đầu giao</Text>
          </TouchableOpacity>
        )}

        {item.status === 'Đang giao' && (
          <TouchableOpacity
            className="flex flex-row items-center bg-green-500 px-3 py-2 rounded-lg"
            onPress={() => handleUpdateOrderStatus(item.orderId, 'Đã giao')}
          >
            <MaterialIcons name="check" size={20} color="#fff" />
            <Text className="text-white font-semibold ml-1.5">Hoàn thành</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {loading ? (
        <View className="flex-1 justify-center flex items-center">
          <Text className="text-gray-600 text-lg">Đang tải...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center flex items-center">
          <MaterialIcons name="inbox" size={48} color="#9CA3AF" />
          <Text className="text-gray-600 text-lg mt-4">Chưa có đơn hàng nào</Text>
          <TouchableOpacity
            className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
            onPress={handleRefresh}
          >
            <Text className="text-white font-medium">Làm mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          {orders.map(item => renderOrderItem(item))}
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center flex items-center bg-black/50">
          <View className="bg-white w-11/12 rounded-2xl p-5 shadow-xl">
            {selectedOrder && (
              <>
                <Text className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Chi tiết đơn hàng #{selectedOrder.orderId}
                </Text>
                
                <Text className="text-lg font-semibold text-gray-800 mt-3 mb-2">Thông tin người gửi:</Text>
                <Text className="text-base text-gray-700 mb-1">Tên: {selectedOrder.sender.name}</Text>
                <Text className="text-base text-gray-700 mb-1">SĐT: {selectedOrder.sender.phone}</Text>
                <Text className="text-base text-gray-700 mb-4">Địa chỉ: {selectedOrder.sender.address}</Text>

                <Text className="text-lg font-semibold text-gray-800 mb-2">Thông tin người nhận:</Text>
                <Text className="text-base text-gray-700 mb-1">Tên: {selectedOrder.recipient.name}</Text>
                <Text className="text-base text-gray-700 mb-1">SĐT: {selectedOrder.recipient.phone}</Text>
                <Text className="text-base text-gray-700 mb-4">Địa chỉ: {selectedOrder.recipient.address}</Text>

                {selectedOrder.packagePhotos && selectedOrder.packagePhotos.length > 0 && (
                  <>
                    <Text className="text-lg font-semibold text-gray-800 mb-2">Hình ảnh đơn hàng:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 h-32">
                      {selectedOrder.packagePhotos.map((photo, index) => (
                          <Image
                            key={index}
                            source={{ uri: getFullPhotoUrl(photo) }}
                            style={{ width: 128, height: 128 }}
                            className="rounded-lg mr-2"
                            resizeMode="cover"
                          />
                      ))}
                    </ScrollView>
                  </>
                )}

                <TouchableOpacity
                  className="bg-red-500 py-3 rounded-lg mt-2"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-bold text-center">Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShipperOrderManagement;