import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../../../services/admin.service';
import { UserCard } from './UserCard';

interface UserManagementProps {
  users: User[];
  loading: boolean;
  refreshing: boolean;
  modalVisible: boolean;
  selectedUser: User | null;
  newRole: string;
  onRefresh: () => void;
  onUpdateRole: () => void;
  onDeleteUser: (email: string) => void;
  onOpenEditModal: (user: User) => void;
  setModalVisible: (visible: boolean) => void;
  setNewRole: (role: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  loading,
  refreshing,
  modalVisible,
  selectedUser,
  newRole,
  onRefresh,
  onUpdateRole,
  onDeleteUser,
  onOpenEditModal,
  setModalVisible,
  setNewRole,
}) => {
  const renderItem = ({ item }: { item: User }) => (
    <UserCard 
      item={item}
      onEdit={onOpenEditModal}
      onDelete={onDeleteUser}
    />
  );

  return (
    <View className="flex-1 bg-gray-100 pt-10">
      <View className="bg-blue-600 p-4 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-white">User Management</Text>
        <TouchableOpacity className="p-1" onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0066cc" />
          <Text className="mt-2.5 text-base text-gray-600">Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.email}
          contentContainerStyle={{ padding: 2.5 }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-5">
              <Text className="text-base text-gray-600 text-center">No users found</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 bg-white rounded-lg p-5 shadow-lg">
            <Text className="text-lg font-bold mb-1">Edit User Role</Text>
            <Text className="text-sm text-gray-600 mb-4">{selectedUser?.email}</Text>
            
            <View className="flex-row justify-between mb-5">
              <TouchableOpacity 
                className={`flex-1 p-2.5 rounded border mx-1 items-center ${
                  newRole === 'admin' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}
                onPress={() => setNewRole('admin')}
              >
                <Text className={`text-sm ${
                  newRole === 'admin' ? 'text-white' : 'text-gray-700'
                }`}>Admin</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`flex-1 p-2.5 rounded border mx-1 items-center ${
                  newRole === 'customer' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}
                onPress={() => setNewRole('customer')}
              >
                <Text className={`text-sm ${
                  newRole === 'customer' ? 'text-white' : 'text-gray-700'
                }`}>Customer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`flex-1 p-2.5 rounded border mx-1 items-center ${
                  newRole === 'shipper' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}
                onPress={() => setNewRole('shipper')}
              >
                <Text className={`text-sm ${
                  newRole === 'shipper' ? 'text-white' : 'text-gray-700'
                }`}>Shipper</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-2.5 py-2 rounded bg-gray-100 min-w-[80px] items-center mr-2.5"
                onPress={() => setModalVisible(false)}
              >
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-2.5 py-2 rounded bg-blue-600 min-w-[80px] items-center"
                onPress={onUpdateRole}
              >
                <Text className="font-bold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
