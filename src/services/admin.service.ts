import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://bf55-2001-ee0-4b4b-d9e0-7c49-b62c-bdac-7a16.ngrok-free.app/api/admin';

// Interface cho order
export interface Order {
  orderId: number;
  orderName: string;
  username: string;
  price: number;
  status: string;
  packagePhotos: string[];
  sender: {
    name: string;
    phone: string;
    address: string;
  };
  recipient: {
    name: string;
    phone: string;
    address: string;
  };
}

// Interface cho user
export interface User {
  idUser: number;
  userName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  firebaseUid: string;
}

// User Management APIs
export const getAllUsers = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('You are not logged in');
    }

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

export const updateUserRole = async (email: string, newRole: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('You are not logged in');
    }

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

export const deleteUser = async (email: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('You are not logged in');
    }

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

// Order Management APIs
export const getAdminOrders = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('You are not logged in');
    }

    const response = await axios.get(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Get Admin Orders Success:', {
      status: response.status,
      count: response.data.orders?.length || 0
    });
    
    return response.data.orders || [];
  } catch (error: any) {
    console.error('❌ Error getting orders:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to get orders');
  }
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('You are not logged in');
    }

    const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
      status
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Update Order Status Success:', {
      status: response.status,
      orderId,
      newStatus: status
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating order status:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to update order status');
  }
};

export const assignShipper = async (orderId: number, shipperId: number) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('You are not logged in');
    }

    const response = await axios.put(`${API_URL}/orders/${orderId}/assign`, {
      shipperId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Assign Shipper Success:', {
      status: response.status,
      orderId,
      shipperId
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error assigning shipper:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to assign shipper');
  }
};
