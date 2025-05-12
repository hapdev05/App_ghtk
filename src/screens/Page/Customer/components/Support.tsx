import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Support = () => {
  const navigation = useNavigation();

  const handleContact = (method: string) => {
    switch (method) {
      case 'phone':
        Linking.openURL('tel:+84338557398');
        break;
      case 'email':
        Linking.openURL('mailto:supportghtk@gmail.com');
        break;
      case 'facebook':
        Linking.openURL('https://www.facebook.com/GHTK.VN/');
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 pt-10">
      {/* Header */}
      <View className="bg-white px-4 py-4 flex-row items-center mb-4 shadow-sm">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mr-4"
        >
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Hỗ trợ</Text>
      </View>

      {/* Giới thiệu */}
      <View className="bg-white mx-4 rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Giới thiệu</Text>
        <Text className="text-base text-gray-700 mb-2">
          Chào mừng bạn đến với dịch vụ hỗ trợ của chúng tôi!
        </Text>
        <Text className="text-base text-gray-700 mb-2">
          GHTK là đơn vị vận chuyển hàng đầu Việt Nam, chuyên cung cấp dịch vụ giao hàng nhanh chóng, 
          an toàn với chi phí hợp lý cho các đối tác thương mại điện tử và cá nhân.
        </Text>
        <Text className="text-base text-gray-700">
          Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc và hỗ trợ bạn 24/7.
        </Text>
      </View>

      {/* Liên hệ hỗ trợ */}
      <View className="bg-white mx-4 rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Liên hệ hỗ trợ</Text>
        
        <TouchableOpacity 
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={() => handleContact('phone')}
        >
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
            <FontAwesome name="phone" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-base font-medium text-gray-800">Hotline</Text>
            <Text className="text-sm text-gray-500">+84338557398 (8h - 21h)</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={() => handleContact('email')}
        >
          <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
            <MaterialIcons name="email" size={20} color="#10B981" />
          </View>
          <View>
            <Text className="text-base font-medium text-gray-800">Email</Text>
            <Text className="text-sm text-gray-500">supportghtk@gmail.com</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-row items-center py-3"
          onPress={() => handleContact('facebook')}
        >
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
            <FontAwesome name="facebook" size={20} color="#1877F2" />
          </View>
          <View>
            <Text className="text-base font-medium text-gray-800">Facebook</Text>
            <Text className="text-sm text-gray-500">Fanpage GHTK</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      {/* FAQ */}
      <View className="bg-white mx-4 rounded-xl p-4 shadow-sm mb-8">
        <Text className="text-lg font-bold text-gray-800 mb-3">Câu hỏi thường gặp</Text>
        
        <TouchableOpacity className="py-3 border-b border-gray-100">
          <Text className="text-base font-medium text-gray-800">Làm thế nào để theo dõi đơn hàng?</Text>
          <Text className="text-sm text-gray-500 mt-1">Bạn có thể theo dõi đơn hàng bằng cách nhập mã vận đơn vào mục "Tra cứu đơn hàng".</Text>
        </TouchableOpacity>

        <TouchableOpacity className="py-3 border-b border-gray-100">
          <Text className="text-base font-medium text-gray-800">Phí vận chuyển được tính như thế nào?</Text>
          <Text className="text-sm text-gray-500 mt-1">Phí vận chuyển được tính dựa trên khoảng cách, trọng lượng và kích thước hàng hóa.</Text>
        </TouchableOpacity>

        <TouchableOpacity className="py-3">
          <Text className="text-base font-medium text-gray-800">Tôi có thể thay đổi địa chỉ giao hàng không?</Text>
          <Text className="text-sm text-gray-500 mt-1">Có, bạn có thể thay đổi địa chỉ giao hàng trước khi đơn hàng được xử lý.</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Support; 