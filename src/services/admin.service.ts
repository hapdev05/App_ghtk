import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.17:3000/api/admin';

// Interface cho user`
export interface User {
  idUser: number;
  userName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  firebaseUid: string;
}

// Lấy danh sách tất cả users
export const getAllUsers = async () => {
  try {
    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('You are not logged in');
    }

    // Gửi token để xác thực quyền admin
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Get All Users Success:', {
      status: response.status,
      count: response.data.users?.length || 0,
      users: response.data.users
    });
    
    // Đảm bảo mỗi user có role, nếu không thì gán mặc định là 'customer'
    const users = (response.data.users || []).map((user: User) => ({
      ...user,
      role: user.role || 'customer'
    }));
    
    return users;
  } catch (error: any) {
    console.error('❌ Error getting users:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to get users');
  }
};

// Cập nhật role của user
export const updateUserRole = async (email: string, newRole: string) => {
  try {
    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('You are not logged in');
    }

    // Gửi token để xác thực quyền admin
    const response = await axios.put(`${API_URL}/user/role`, {
      email,
      newRole
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Update User Role Success:', {
      status: response.status,
      email,
      newRole
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating user role:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to update user role');
  }
};

// Xóa user
export const deleteUser = async (email: string) => {
  try {
    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('You are not logged in');
    }

    // Gửi token để xác thực quyền admin
    const response = await axios.delete(`${API_URL}/user`, {
      data: { email },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Delete User Success:', {
      status: response.status,
      email
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error deleting user:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to delete user');
  }
};
