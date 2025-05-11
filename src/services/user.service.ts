import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://fa6e-2001-ee0-4b49-c580-bc32-ded9-8e98-e594.ngrok-free.app/api';

// Interface cho thông tin Customer
export interface CustomerInfo {
  username: string;
  pendingOrders: number;
  completedOrders: number;
  totalOrders: number;
}

// Interface cho thông tin Shipper
export interface ShipperInfo {
  username: string;
  deliveringOrders: number;
  completedOrders: number;
  totalOrders: number;
}

// Lấy thông tin Customer
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xem thông tin');
    }

    const response = await axios.get(`${API_URL}/user/customer/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Get Customer Info Success:', {
      status: response.status,
      data: response.data
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching customer info:', error);
    throw new Error(error.response?.data?.error || error.message || 'Không thể lấy thông tin khách hàng');
  }
};

// Lấy thông tin Shipper
export const getShipperInfo = async (): Promise<ShipperInfo> => {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xem thông tin');
    }

    const response = await axios.get(`${API_URL}/user/shipper/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Get Shipper Info Success:', {
      status: response.status,
      data: response.data
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching shipper info:', error);
    throw new Error(error.response?.data?.error || error.message || 'Không thể lấy thông tin shipper');
  }
}; 