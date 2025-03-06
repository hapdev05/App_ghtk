import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { getAllUsers, deleteUser, updateUserRole, User } from '../../../services/admin.service'
import { Ionicons } from '@expo/vector-icons'

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users')
      console.error(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchUsers()
  }

  const handleDeleteUser = (email: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(email)
              fetchUsers()
              Alert.alert('Success', 'User deleted successfully')
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user')
              console.error(error)
            }
          }
        }
      ]
    )
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setModalVisible(true)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      await updateUserRole(selectedUser.email, newRole)
      setModalVisible(false)
      fetchUsers()
      Alert.alert('Success', 'User role updated successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to update user role')
      console.error(error)
    }
  }

  const renderItem = ({ item }: { item: User }) => (
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
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-9 h-9 rounded-full bg-red-500 justify-center items-center"
          onPress={() => handleDeleteUser(item.email)}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-blue-600 p-4 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-white">User Management</Text>
        <TouchableOpacity className="p-1" onPress={handleRefresh}>
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
          onRefresh={handleRefresh}
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
                onPress={handleUpdateRole}
              >
                <Text className="font-bold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default AdminDashboard