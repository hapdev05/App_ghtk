import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://fa6e-2001-ee0-4b49-c580-bc32-ded9-8e98-e594.ngrok-free.app/api';

// Lấy danh sách đơn hàng của khách hàng
export const getCustomerOrders = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xem lịch sử đơn hàng');
    }

    const response = await axios.get(`${API_URL}/customer/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(response.data.message || 'Lỗi khi lấy lịch sử đơn hàng');
    }

    // Kiểm tra và chuyển đổi dữ liệu trả về thành mảng Order[]
    let ordersArray = Array.isArray(response.data) ? response.data : Object.values(response.data);
    
    // Đảm bảo mỗi phần tử trong mảng có đúng cấu trúc của Order
    ordersArray = ordersArray.map(order => ({
      orderId: order.orderId,
      orderName: order.orderName,
      username: order.username,
      price: order.price,
      status: order.status,
      packagePhotos: order.packagePhotos || [],
      sender: {
        name: order.sender?.name || '',
        phone: order.sender?.phone || '',
        address: order.sender?.address || ''
      },
      recipient: {
        name: order.recipient?.name || '',
        phone: order.recipient?.phone || '',
        address: order.recipient?.address || ''
      },
      createdAt: order.createdAt,
      description: order.description
    }));
    
    console.log('✅ Get Customer Orders Success:', {
      status: response.status,
      count: ordersArray.length,
      data: ordersArray
    });
    return ordersArray;
  } catch (error: any) {
    console.error('❌ Error fetching customer orders:', error);
    throw new Error(error.response?.data?.error || error.message || 'Không thể lấy lịch sử đơn hàng');
  }
};

// Xem chi tiết đơn hàng
export const getCustomerOrderDetails = async (orderId: number) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xem chi tiết đơn hàng');
    }

    const response = await axios.get(`${API_URL}/customer/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 400) {
      throw new Error(response.data.message || 'Lỗi khi lấy chi tiết đơn hàng');
    }

    console.log('✅ Get Customer Order Details Success:', {
      status: response.status,
      orderId,
      
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching customer order details:', error);
    throw new Error(error.response?.data?.error || error.message || 'Không thể lấy chi tiết đơn hàng');
  }
};