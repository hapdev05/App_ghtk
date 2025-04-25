import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getShipperOrders } from "../../../services/shipper.service";
import ShipperOrderManagement from './ShipperOrderManagement';
import { useNavigation } from '@react-navigation/native';

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

const ShipperDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const orders = await getShipperOrders();
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

  const getOrderStats = () => {
    if (!orders || !Array.isArray(orders)) {
      return {
        totalOrders: 0,
        delivering: 0,
        completed: 0,
        totalRevenue: 0
      };
    }
    
    const stats = {
      totalOrders: orders.length,
      delivering: orders.filter(order => order.status === 'Đang giao').length,
      completed: orders.filter(order => order.status === 'Đã giao').length,
      totalRevenue: orders.reduce((sum, order) => sum + order.price, 0)
    };
    return stats;
  };

  const stats = getOrderStats();

  const renderStatsCard = (icon: keyof typeof MaterialIcons.glyphMap, title: string, value: string | number, bgColor: string) => (
    <View className={`${bgColor} p-5 rounded-2xl flex-1 mx-1.5 shadow-lg`}>
      <View className="flex-row items-center justify-between mb-2">
        <MaterialIcons name={icon} size={28} color="#fff" />
        <Text className="text-white text-xl font-bold">{value}</Text>
      </View>
      <Text className="text-white text-base font-medium">{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Đang tải...</Text>
      </View>
    );
  }

  const sections = [
    {
      title: 'stats',
      data: [{
        statsCards: [
          {
            icon: 'local-shipping' as keyof typeof MaterialIcons.glyphMap,
            title: 'Đang giao',
            value: stats.delivering,
            bgColor: 'bg-blue-500',
          },
          {
            icon: 'check-circle' as keyof typeof MaterialIcons.glyphMap,
            title: 'Đã hoàn thành',
            value: stats.completed,
            bgColor: 'bg-green-500'
          },
          {
            icon: 'assignment' as keyof typeof MaterialIcons.glyphMap,
            title: 'Tổng đơn hàng',
            value: stats.totalOrders,
            bgColor: 'bg-purple-500'
          },
          {
            icon: 'attach-money' as keyof typeof MaterialIcons.glyphMap,
            title: 'Doanh thu',
            value: `${stats.totalRevenue.toLocaleString()}đ`,
            bgColor: 'bg-orange-500'
          }
        ]
      }]
    },
    {
      title: 'orders',
      data: [{}]
    }
  ];

  const renderItem = ({ item, section }: { item: any, section: { title: string } }) => {
    if (section.title === 'stats') {
      return (
        <View className="px-5 pt-4">
          <Text className="text-2xl font-bold text-gray-900 mb-5">Tổng quan</Text>
          <View className="flex-row mb-3 flex-wrap">
            {item.statsCards.slice(0, 2).map((card: any, index: number) => (
              <View key={index} className="w-1/2 mb-3">
                {renderStatsCard(card.icon, card.title, card.value, card.bgColor)}
              </View>
            ))}
          </View>
          <View className="flex-row mb-6 flex-wrap">
            {item.statsCards.slice(2, 4).map((card: any, index: number) => (
              <View key={index} className="w-1/2 mb-3">
                {renderStatsCard(card.icon, card.title, card.value, card.bgColor)}
              </View>
            ))}
          </View>
        </View>
      );
    }
    return <ShipperOrderManagement />;
  };

  return (
    <View className="flex-1 bg-gray-50 mt-10">
      <View className="bg-white px-5 py-4 flex-row items-center border-b border-gray-200 shadow-sm">
        <View className="h-12 w-12 bg-blue-100 rounded-full items-center justify-center shadow-sm">
          <MaterialIcons name="person" size={28} color="#3B82F6" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-gray-900">Nguyễn Văn A</Text>
          <View className="flex-row items-center mt-1">
            <MaterialIcons name="local-shipping" size={18} color="#4B5563" />
            <Text className="text-gray-600 ml-2 text-base">Shipper</Text>
          </View>
        </View>
      </View>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        renderSectionHeader={() => null}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

export default ShipperDashboard;