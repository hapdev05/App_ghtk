import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getCustomerInfo, CustomerInfo } from '../../../../services/user.service';
import { PieChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface OrderStats {
  pending: number;
  completed: number;
  cancelled: number;
  total: number;
  monthlyOrders: {
    month: string;
    count: number;
  }[];
}

const Statistics = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    pending: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
    monthlyOrders: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Lấy thông tin khách hàng từ API
      const info = await getCustomerInfo();
      setCustomerInfo(info);

      // Giả lập dữ liệu thống kê (trong thực tế sẽ lấy từ API)
      setOrderStats({
        pending: info.pendingOrders || 5,
        completed: info.completedOrders || 15,
        cancelled: 2,
        total: (info.totalOrders || 22),
        monthlyOrders: [
          { month: 'T1', count: 3 },
          { month: 'T2', count: 4 },
          { month: 'T3', count: 2 },
          { month: 'T4', count: 5 },
          { month: 'T5', count: 3 },
          { month: 'T6', count: 7 }
        ]
      });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const pieData = [
    {
      name: 'Đang xử lý',
      population: orderStats.pending,
      color: '#3B82F6',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Hoàn thành',
      population: orderStats.completed,
      color: '#10B981',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: 'Đã hủy',
      population: orderStats.cancelled,
      color: '#EF4444',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }
  ];

  const barData = {
    labels: orderStats.monthlyOrders.map(item => item.month),
    datasets: [
      {
        data: orderStats.monthlyOrders.map(item => item.count)
      }
    ]
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Đang tải thống kê...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 pt-10"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-white px-4 py-4 flex-row items-center mb-4 shadow-sm">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mr-4"
        >
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Thống kê đơn hàng</Text>
      </View>

      {/* Tổng quan */}
      <View className="bg-white mx-4 rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Tổng quan</Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-500">{orderStats.total}</Text>
            <Text className="text-sm text-gray-500 mt-1">Tổng đơn</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-500">{orderStats.pending}</Text>
            <Text className="text-sm text-gray-500 mt-1">Đang xử lý</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-500">{orderStats.completed}</Text>
            <Text className="text-sm text-gray-500 mt-1">Hoàn thành</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-red-500">{orderStats.cancelled}</Text>
            <Text className="text-sm text-gray-500 mt-1">Đã hủy</Text>
          </View>
        </View>
      </View>

      {/* Biểu đồ tròn */}
      <View className="bg-white mx-4 rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Phân bổ trạng thái</Text>
        <View className="items-center">
          <PieChart
            data={pieData}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </View>

      {/* Biểu đồ cột */}
      <View className="bg-white mx-4 rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Đơn hàng theo tháng</Text>
        <View className="items-center">
          <BarChart
            data={barData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            fromZero
            showBarTops
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>
      </View>

      {/* Thống kê chi tiết */}
      <View className="bg-white mx-4 rounded-xl p-4 shadow-sm mb-8">
        <Text className="text-lg font-bold text-gray-800 mb-3">Chi tiết thống kê</Text>
        <View className="border-b border-gray-100 pb-2 mb-2">
          <Text className="text-base text-gray-700">Tỷ lệ hoàn thành: <Text className="font-bold text-green-500">{Math.round((orderStats.completed / orderStats.total) * 100)}%</Text></Text>
        </View>
        <View className="border-b border-gray-100 pb-2 mb-2">
          <Text className="text-base text-gray-700">Tỷ lệ hủy: <Text className="font-bold text-red-500">{Math.round((orderStats.cancelled / orderStats.total) * 100)}%</Text></Text>
        </View>
        <View>
          <Text className="text-base text-gray-700">Trung bình đơn hàng/tháng: <Text className="font-bold text-blue-500">{Math.round(orderStats.total / 6)}</Text></Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Statistics; 