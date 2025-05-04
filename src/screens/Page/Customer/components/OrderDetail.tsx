import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from 'react-native';

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

interface OrderDetailProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
  formatDate: (dateString?: string) => string;
  formatPrice: (price: number) => string;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  visible,
  order,
  onClose,
  getStatusColor,
  getStatusText,
  getStatusIcon,
  formatDate,
  formatPrice
}) => {
  if (!order) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="flex flex-row items-center pt-12 pb-4 px-5 border-b border-gray-100 border-solid bg-white">
          <TouchableOpacity onPress={onClose} className="mr-4">
            <Ionicons name="close" size={24} color="#34495e" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">Chi tiết đơn hàng</Text>
        </View>

        <View className="flex-1 p-4">
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
              <FlatList
                data={order.packagePhotos}
                keyExtractor={(_, index) => `photo-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.startsWith('http') ? item : `https://ab52-14-245-65-79.ngrok-free.app/data/img/${item}` }}
                    className="w-60 h-60 rounded-lg mr-2"
                    resizeMode="cover"
                  />
                )}
                className="py-1"
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default OrderDetail;