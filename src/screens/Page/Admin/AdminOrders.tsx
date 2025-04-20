import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Alert,
  Image,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getAdminOrders, updateOrderStatus, assignShipper } from '../../../services/admin.service';

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
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [shipperModalVisible, setShipperModalVisible] = useState(false);
  const [availableShippers, setAvailableShippers] = useState([]);

  const getFullPhotoUrl = (photoUrl: string) => {
    if (photoUrl.startsWith('http')) return photoUrl;
    return `https://bf55-2001-ee0-4b4b-d9e0-7c49-b62c-bdac-7a16.ngrok-free.app/data/img/${photoUrl}`;
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const orders = await getAdminOrders();
      console.log('✅ Orders data:', {
        count: orders?.length || 0,
        firstOrder: orders[0],
        hasPhotos: orders[0]?.packagePhotos?.length > 0,
        photoUrls: orders[0]?.packagePhotos
      });
      setOrders(orders);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

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

  const handleAssignShipper = async (orderId: number, shipperId: number) => {
    try {
      await assignShipper(orderId, shipperId);
      await loadOrders();
      setShipperModalVisible(false);
      Alert.alert('Thành công', 'Đã phân công shipper');
    } catch (error) {
      console.error('Error assigning shipper:', error);
      Alert.alert('Lỗi', 'Không thể phân công shipper');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ xác nhận':
        return 'text-amber-500';
      case 'Đã xác nhận':
        return 'text-green-500';
      case 'Đang giao':
        return 'text-blue-500';
      case 'Đã giao':
        return 'text-green-500';
      case 'Đã hủy':
        return 'text-red-500';
      default:
        return 'text-gray-900';
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View className="bg-white p-4 mx-3 my-1.5 rounded-xl shadow-sm">
      <View className="flex flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100 border-solid">
        <Text className="text-lg font-bold text-gray-900">{item.orderName}</Text>
        <Text className={`px-2.5 py-1 rounded-full bg-gray-50 ${getStatusColor(item.status)}`}>
          {item.status}
        </Text>
      </View>

      <Text className="text-base text-gray-700 mb-1.5">Mã đơn: #{item.orderId}</Text>
      <Text className="text-base text-gray-700 mb-1.5">Người đặt: {item.username}</Text>
      <Text className="text-base text-gray-700 mb-3">Giá: {item.price.toLocaleString()}đ</Text>

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

        {item.status === 'Chờ xác nhận' && (
          <TouchableOpacity
            className="flex flex-row items-center bg-green-500 px-3 py-2 rounded-lg"
            onPress={() => handleUpdateOrderStatus(item.orderId, 'Đã xác nhận')}
          >
            <MaterialIcons name="check" size={20} color="#fff" />
            <Text className="text-white font-semibold ml-1.5">Xác nhận</Text>
          </TouchableOpacity>
        )}

        {item.status === 'Đã xác nhận' && (
          <TouchableOpacity
            className="flex flex-row items-center bg-blue-500 px-3 py-2 rounded-lg"
            onPress={() => {
              setSelectedOrder(item);
              setShipperModalVisible(true);
            }}
          >
            <MaterialIcons name="local-shipping" size={20} color="#fff" />
            <Text className="text-white font-semibold ml-1.5">Phân công</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.orderId.toString()}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={shipperModalVisible}
        onRequestClose={() => setShipperModalVisible(false)}
      >
        <View className="flex-1 justify-center flex items-center bg-black/50">
          <View className="bg-white w-11/12 rounded-2xl p-5 shadow-xl">
            <Text className="text-xl font-bold text-gray-900 mb-4 text-center">Phân công shipper</Text>
            {availableShippers.map((shipper: any) => (
              <TouchableOpacity
                key={shipper.id}
                className="p-3 border border-gray-200 border-solid rounded-lg mb-2 active:bg-gray-50"
                onPress={() => handleAssignShipper(selectedOrder?.orderId || 0, shipper.id)}
              >
                <Text className="text-base font-semibold text-gray-800">{shipper.name}</Text>
                <Text className="text-sm text-gray-600 mt-1">{shipper.phone}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className="bg-red-500 py-3 rounded-lg mt-2"
              onPress={() => setShipperModalVisible(false)}
            >
              <Text className="text-white font-bold text-center">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminOrders;