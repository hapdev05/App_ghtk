import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import AccountMenu from './components/AccountMenu'
import { getCustomerInfo, CustomerInfo } from '../../../services/user.service'
import AvtCus from '../../../assets/images/AvtCus.jpg'
const CustomerHome = () => {
  const navigation = useNavigation<any>();
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy thông tin khách hàng khi component mount
    const fetchCustomerInfo = async () => {
      try {
        setLoading(true);
        const info = await getCustomerInfo();
        setCustomerInfo(info);
        console.log('✅ Thông tin khách hàng:', info);
      } catch (error) {
        console.error('❌ Lỗi khi lấy thông tin khách hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerInfo();
  }, []);

  const menuItems = [
    {
      id: 1,
      title: 'Tạo đơn hàng',
      description: 'Tạo đơn hàng mới để gửi đi',
      icon: '📦',
      screen: 'CreateOrder'
    },
    {
      id: 2,
      title: 'Tra cứu đơn hàng',
      description: 'Xem trạng thái và lịch sử đơn hàng',
      icon: '🔍',
      screen: 'OrderHistory'
    },
    {
      id: 3,
      title: 'Đơn hàng chờ xử lý',
      description: 'Quản lý đơn hàng đang chờ xử lý',
      icon: '⏳',
      screen: 'PendingOrders'
    },
    {
      id: 4,
      title: 'Thống kê',
      description: 'Xem báo cáo và thống kê đơn hàng',
      icon: '📊',
      screen: 'Statistics'
    },
    {
      id: 5,
      title: 'Cài đặt tài khoản',
      description: 'Quản lý thông tin tài khoản',
      icon: '⚙️',
      screen: 'AccountSettings'
    },
    {
      id: 6,
      title: 'Hỗ trợ',
      description: 'Liên hệ với bộ phận hỗ trợ',
      icon: '🛟',
      screen: 'Support'
    }
  ]

  const handleMenuPress = (screen: string) => {
    // Navigation will be implemented when these screens are created
    console.log(`Navigating to ${screen}`)
    // navigation.navigate(screen)
    navigation.navigate(screen)
  }

  return (
    <View className="flex-1 bg-gray-100 pt-10">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View className="bg-white px-4 py-6 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Xin chào, {customerInfo?.username || 'Khách hàng'}</Text>
            <Text className="text-lg text-gray-600">Khách hàng</Text>
          </View>
          <TouchableOpacity 
            className="w-10 h-10 bg-gray-200 rounded-full justify-center items-center"
            onPress={() => setAccountMenuVisible(true)}
          >
            <Image source={AvtCus} className="w-[60px] h-[60px] rounded-full" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View className="flex-row justify-between px-4 py-4">
        <View className="bg-white rounded-xl p-4 flex-1 mr-2 shadow-sm">
          <Text className="text-gray-500">Đơn hàng đang gửi</Text>
          <Text className="text-xl font-bold text-blue-500">
            {loading ? '...' : customerInfo?.pendingOrders || 0}
          </Text>
        </View>
        <View className="bg-white rounded-xl p-4 flex-1 ml-2 shadow-sm">
          <Text className="text-gray-500">Đơn hoàn thành</Text>
          <Text className="text-xl font-bold text-green-500">
            {loading ? '...' : customerInfo?.completedOrders || 0}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-gray-800 mb-4">Dịch vụ</Text>
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm"
              style={{ width: '48%' }}
              onPress={() => handleMenuPress(item.screen)}
            >
              <Text className="text-3xl mb-2">{item.icon}</Text>
              <Text className="text-base font-bold text-gray-800">{item.title}</Text>
              <Text className="text-xs text-gray-500 mt-1">{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="bg-white flex-row justify-around items-center py-4 shadow-lg">
        <TouchableOpacity className="items-center">
          <Text className="text-2xl">🏠</Text>
          <Text className="text-xs font-medium text-blue-500">Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text className="text-2xl">📦</Text>
          <Text className="text-xs text-gray-500">Đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-2xl">📊</Text>
          <Text className="text-xs text-gray-500">Thống kê</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="items-center"
          onPress={() => setAccountMenuVisible(true)}
        >
          <Text className="text-2xl">👤</Text>
          <Text className="text-xs text-gray-500">Tài khoản</Text>
        </TouchableOpacity>
      </View>

      {/* Account Menu Modal */}
      <AccountMenu 
        visible={accountMenuVisible} 
        onClose={() => setAccountMenuVisible(false)} 
      />
    </View>
  )
}

export default CustomerHome