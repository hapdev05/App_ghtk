import React, { useState, useEffect } from 'react'
import { getAllUsers, deleteUser, updateUserRole, User } from '../../../services/admin.service'
import { UserManagement } from './components/UserManagement'

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers()
      setUsers(fetchedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadUsers()
    setRefreshing(false)
  }

  const handleDeleteUser = async (email: string) => {
    try {
      await deleteUser(email)
      setUsers(users.filter(user => user.email !== email))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.role || 'customer')
    setModalVisible(true)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      await updateUserRole(selectedUser.email, newRole)
      setUsers(users.map(user => 
        user.email === selectedUser.email 
          ? { ...user, role: newRole }
          : user
      ))
      setModalVisible(false)
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  return (
    <UserManagement
      users={users}
      loading={loading}
      refreshing={refreshing}
      modalVisible={modalVisible}
      selectedUser={selectedUser}
      newRole={newRole}
      onRefresh={handleRefresh}
      onDeleteUser={handleDeleteUser}
      onOpenEditModal={openEditModal}
      onUpdateRole={handleUpdateRole}
      setModalVisible={setModalVisible}
      setNewRole={setNewRole}
    />
  )
}

export default AdminDashboard