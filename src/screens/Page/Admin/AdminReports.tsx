import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getAllUsers, getAdminOrders, User, Order } from '../../../services/admin.service';

const screenWidth = Dimensions.get('window').width - 40;

// Define interfaces for typechecking
interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    total: 0,
    roles: {
      admin: 0,
      shipper: 0,
      customer: 0
    }
  });
  
  const [orderData, setOrderData] = useState({
    total: 0,
    status: {
      pending: 0,
      processing: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [users, orders] = await Promise.all([
        getAllUsers(),
        getAdminOrders()
      ]);
      
      // Process user data
      const roleCount = {
        admin: 0,
        shipper: 0,
        customer: 0
      };
      
      users.forEach((user: User) => {
        const role = user.role?.toLowerCase() || 'customer';
        if (role === 'admin') roleCount.admin++;
        else if (role === 'shipper') roleCount.shipper++;
        else roleCount.customer++;
      });
      
      setUserData({
        total: users.length,
        roles: roleCount
      });
      
      // Process order data
      const statusCount = {
        pending: 0,
        processing: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0
      };
      
      orders.forEach((order: Order) => {
        const status = order.status?.toLowerCase() || 'pending';
        if (status === 'pending') statusCount.pending++;
        else if (status === 'processing') statusCount.processing++;
        else if (status === 'shipping') statusCount.shipping++;
        else if (status === 'delivered') statusCount.delivered++;
        else if (status === 'cancelled') statusCount.cancelled++;
      });
      
      setOrderData({
        total: orders.length,
        status: statusCount
      });
      
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: StatCardProps) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-gray-500">{title}</Text>
          <Text className="text-2xl font-bold text-gray-900">{value}</Text>
        </View>
        <View className={`w-12 h-12 rounded-full ${color} items-center justify-center`}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
      </View>
    </View>
  );

  // Simple data structure for the chart
  const chartData = {
    labels: ["Đang chờ", "Xử lý", "Vận chuyển", "Đã giao", "Đã hủy"],
    datasets: [
      {
        data: [
          orderData.status.pending,
          orderData.status.processing,
          orderData.status.shipping,
          orderData.status.delivered,
          orderData.status.cancelled
        ]
      }
    ]
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-3 text-gray-500">Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-r from-indigo-700 to-indigo-500 pt-16 pb-8 px-5 rounded-b-3xl shadow-lg mb-5">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-white mb-2">Báo cáo thống kê</Text>
            <Text className="text-white opacity-80">Phân tích dữ liệu hệ thống</Text>
          </View>
          <TouchableOpacity 
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            onPress={loadData}
          >
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="px-5">
        <Text className="text-lg font-bold text-gray-800 mb-4">Thống kê tổng quan</Text>
        
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1">
            <StatCard 
              title="Tổng số người dùng" 
              value={userData.total} 
              icon="people"
              color="bg-blue-500" 
            />
          </View>
          <View className="flex-1">
            <StatCard 
              title="Tổng số đơn hàng" 
              value={orderData.total} 
              icon="cart" 
              color="bg-purple-500" 
            />
          </View>
        </View>
        
        <Text className="text-lg font-bold text-gray-800 mb-4">Phân tích người dùng</Text>
        
        <View className="bg-white rounded-xl p-4 mb-5 shadow-sm">
          <Text className="text-gray-800 font-medium mb-3">Phân loại người dùng</Text>
          
          <View className="flex-row mt-4 justify-around">
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Ionicons name="shield" size={32} color="#3B82F6" />
              </View>
              <Text className="text-gray-800 font-medium">Admin</Text>
              <Text className="text-2xl font-bold text-blue-600">{userData.roles.admin}</Text>
            </View>
            
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-purple-100 items-center justify-center mb-2">
                <Ionicons name="bicycle" size={32} color="#8B5CF6" />
              </View>
              <Text className="text-gray-800 font-medium">Shipper</Text>
              <Text className="text-2xl font-bold text-purple-600">{userData.roles.shipper}</Text>
            </View>
            
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-pink-100 items-center justify-center mb-2">
                <Ionicons name="people" size={32} color="#EC4899" />
              </View>
              <Text className="text-gray-800 font-medium">Khách hàng</Text>
              <Text className="text-2xl font-bold text-pink-600">{userData.roles.customer}</Text>
            </View>
          </View>
          
          <View className="mt-6 pt-4 border-t border-gray-100">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Tỷ lệ khách hàng:</Text>
              <Text className="font-medium">{userData.total > 0 ? Math.round(userData.roles.customer / userData.total * 100) : 0}%</Text>
            </View>
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <View 
                className="h-full bg-pink-500 rounded-full" 
                style={{ width: `${userData.total > 0 ? Math.round(userData.roles.customer / userData.total * 100) : 0}%` }} 
              />
            </View>
          </View>
        </View>
        
        <Text className="text-lg font-bold text-gray-800 mb-4">Phân tích đơn hàng</Text>
        
        <View className="bg-white rounded-xl p-4 mb-5 shadow-sm">
          <Text className="text-gray-800 font-medium mb-3">Trạng thái đơn hàng</Text>
          <BarChart
            data={chartData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              propsForLabels: {
                fontSize: 10
              }
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
            verticalLabelRotation={30}
            fromZero
          />
          
          <View className="flex-row flex-wrap mt-4">
            <View className="w-1/2 mb-3 pr-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                <Text className="text-gray-700">Đang chờ: {orderData.status.pending}</Text>
              </View>
            </View>
            
            <View className="w-1/2 mb-3 pl-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                <Text className="text-gray-700">Xử lý: {orderData.status.processing}</Text>
              </View>
            </View>
            
            <View className="w-1/2 mb-3 pr-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-indigo-500 mr-2" />
                <Text className="text-gray-700">Vận chuyển: {orderData.status.shipping}</Text>
              </View>
            </View>
            
            <View className="w-1/2 mb-3 pl-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                <Text className="text-gray-700">Đã giao: {orderData.status.delivered}</Text>
              </View>
            </View>
            
            <View className="w-1/2 mb-3">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                <Text className="text-gray-700">Đã hủy: {orderData.status.cancelled}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View className="h-20" />
      </View>
    </ScrollView>
  );
};

export default AdminReports;