import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

interface OrderItemProps {
  item: Order;
  onPress: (order: Order) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
  formatDate: (dateString?: string) => string;
  formatPrice: (price: number) => string;
}

const OrderItem: React.FC<OrderItemProps> = ({
  item,
  onPress,
  getStatusColor,
  getStatusText,
  getStatusIcon,
  formatDate,
  formatPrice
}) => {
  return (
    <TouchableOpacity
      className="mb-4 rounded-xl overflow-hidden bg-white shadow-sm"
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        className="rounded-xl"
      >
        <View className="flex flex-row justify-between items-center px-4 pt-4 pb-2">
          <View className="flex-1 mr-2">
            <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
              {item.orderName}
            </Text>
            <View className="mt-1">
              <Text className="text-sm text-gray-500">#{item.orderId}</Text>
            </View>
          </View>
          <View className={`flex flex-row items-center px-2 py-1 rounded-full bg-opacity-20`} style={{ backgroundColor: getStatusColor(item.status) + '20' }}>
            <View className="mr-1">
              {getStatusIcon(item.status)}
            </View>
            <Text className="text-sm font-semibold" style={{ color: getStatusColor(item.status) }}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View className="px-4 pb-2">
          <View className="flex flex-row justify-between mb-2">
            <View className="flex flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#7f8c8d" className="mr-1" />
              <Text className="text-sm text-gray-600">{formatDate(item.createdAt)}</Text>
            </View>
            <View className="flex flex-row items-center">
              <Ionicons name="cash-outline" size={16} color="#7f8c8d" className="mr-1" />
              <Text className="text-sm text-gray-600">{formatPrice(item.price)}</Text>
            </View>
          </View>

          <View className="flex flex-row items-center mt-1">
            <View className="flex-1 flex flex-row items-center">
              <Ionicons name="person-outline" size={16} color="#7f8c8d" className="mr-1" />
              <Text className="text-sm text-gray-700" numberOfLines={1}>
                {item.sender.name}
              </Text>
            </View>
            <View className="px-2">
              <Ionicons name="arrow-forward" size={14} color="#bdc3c7" />
            </View>
            <View className="flex-1 flex flex-row items-center">
              <Ionicons name="location-outline" size={16} color="#7f8c8d" className="mr-1" />
              <Text className="text-sm text-gray-700" numberOfLines={1}>
                {item.recipient.name}
              </Text>
            </View>
          </View>
        </View>

        {item.packagePhotos && item.packagePhotos.length > 0 && (
          <View className="mt-2 relative">
            <Image
              source={{ uri: item.packagePhotos[0] }}
              className="w-full h-32 rounded-lg"
              resizeMode="cover"
            />
            {item.packagePhotos.length > 1 && (
              <View className="absolute right-2 bottom-2 bg-black bg-opacity-60 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">+{item.packagePhotos.length - 1}</Text>
              </View>
            )}
          </View>
        )}

        <View className="flex flex-row items-center justify-end px-4 py-2 border-t border-gray-100 border-solid">
          <Text className="text-sm text-blue-500 mr-1">Xem chi tiết</Text>
          <Ionicons name="chevron-forward" size={16} color="#3498db" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default OrderItem;