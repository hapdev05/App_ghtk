import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://fa6e-2001-ee0-4b49-c580-bc32-ded9-8e98-e594.ngrok-free.app/api';

// Lấy danh sách đơn hàng được phân công cho shipper
export const getShipperOrders = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xem danh sách đơn hàng');
    }

    const response = await axios.get(`${API_URL}/shipper/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 400) {
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách đơn hàng');
    }

    console.log('✅ Get Shipper Orders Success:', {
      status: response.status,
      count: response.data.length,
      data: response.data
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching shipper orders:', error);
    throw new Error(error.response?.data?.error || error.message || 'Không thể lấy danh sách đơn hàng');
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để cập nhật trạng thái đơn hàng');
    }

    const response = await axios.put(
      `${API_URL}/shipper/orders/${orderId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status >= 400) {
      throw new Error(response.data.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }

    console.log('✅ Update Order Status Success:', {
      status: response.status,
      orderId,
      newStatus: status
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating order status:', error);
    throw new Error(error.response?.data?.error || error.message || 'Không thể cập nhật trạng thái đơn hàng');
  }
};

// Xem chi tiết đơn hàng
export const getOrderDetails = async (orderId: number) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xem chi tiết đơn hàng');
    }

    const response = await axios.get(`${API_URL}/shipper/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 400) {
      throw new Error(response.data.message || 'Lỗi khi lấy chi tiết đơn hàng');
    }

    console.log('✅ Get Order Details Success:', {
      status: response.status,
      orderId
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching order details:', error);
    throw new Error(error.response?.data?.error || error.message || 'Không thể lấy chi tiết đơn hàng');
  }
};

// Cập nhật vị trí hiện tại của shipper lên server
export const updateShipperLocation = async (lat: number, long: number) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để cập nhật vị trí');
    }

    const response = await axios.put(
      `${API_URL}/shipper/location/current`,
      { 
        latitude: lat, 
        longitude: long,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status >= 400) {
      throw new Error(response.data.message || 'Lỗi khi cập nhật vị trí');
    }

    console.log('✅ Update Shipper Location Success:', {
      status: response.status,
      location: { lat, long }
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error updating shipper location:', error);
    // Không throw error để tránh làm crash app khi cập nhật vị trí
    return null;
  }
};