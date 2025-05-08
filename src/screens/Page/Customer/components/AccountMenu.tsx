import React from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../../../services/auth.service';

interface AccountMenuProps {
  visible: boolean;
  onClose: () => void;
}

const AccountMenu: React.FC<AccountMenuProps> = ({ visible, onClose }) => {
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: onClose
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }]
              });
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person',
      title: 'Thông tin cá nhân',
      onPress: () => {
        Alert.alert('Thông báo', 'Chức năng đang phát triển');
        onClose();
      }
    },
    {
      icon: 'shopping-bag',
      title: 'Đơn hàng của tôi',
      onPress: () => {
        navigation.navigate('OrderHistory' as never);
        onClose();
      }
    },
    {
      icon: 'location-on',
      title: 'Địa chỉ của tôi',
      onPress: () => {
        Alert.alert('Thông báo', 'Chức năng đang phát triển');
        onClose();
      }
    },
    {
      icon: 'settings',
      title: 'Cài đặt tài khoản',
      onPress: () => {
        Alert.alert('Thông báo', 'Chức năng đang phát triển');
        onClose();
      }
    },
    {
      icon: 'help',
      title: 'Trợ giúp & Hỗ trợ',
      onPress: () => {
        Alert.alert('Thông báo', 'Chức năng đang phát triển');
        onClose();
      }
    },
    {
      icon: 'logout',
      title: 'Đăng xuất',
      onPress: handleLogout,
      color: '#EF4444'
    }
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-start items-end pt-[70px] pr-[10px]"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-white rounded-xl p-2 w-60 shadow-xl elevation-5">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center px-4 py-3 rounded-lg active:bg-gray-100"
              onPress={item.onPress}
            >
              <MaterialIcons 
                name={item.icon as any} 
                size={22} 
                color={item.color || '#374151'} 
              />
              <Text 
                className={`ml-3 font-medium ${item.color ? 'text-red-500' : 'text-gray-700'}`}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default AccountMenu; 