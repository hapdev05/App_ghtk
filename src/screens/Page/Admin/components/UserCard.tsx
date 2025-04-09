import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../../../services/admin.service';

interface UserCardProps {
  item: User;
  onEdit: (user: User) => void;
  onDelete: (email: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ item, onEdit, onDelete }) => {
  return (
    <View className="bg-white rounded-lg p-4 mb-2.5 flex-row justify-between shadow-sm">
      <View className="flex-1">
        <Text className="text-lg font-bold mb-1">{item.userName}</Text>
        <Text className="text-sm text-gray-500 mb-1">{item.email}</Text>
        <View className="flex-row items-center">
          <Text className={`text-xs py-0.5 px-2 rounded-full font-bold ${
            item.role === 'admin' ? 'bg-red-100 text-red-700' :
            item.role === 'shipper' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {(item.role || 'customer').toUpperCase()}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity 
          className="w-9 h-9 rounded-full bg-green-500 justify-center items-center mr-2"
          onPress={() => onEdit(item)}
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-9 h-9 rounded-full bg-red-500 justify-center items-center"
          onPress={() => onDelete(item.email)}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
