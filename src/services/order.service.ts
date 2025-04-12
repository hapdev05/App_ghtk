import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { getAuthToken } from '../config/auth.config';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'https://e1cc-2001-ee0-4b4b-d9e0-d429-cb71-1b7-5670.ngrok-free.app/api';

interface DecodedToken {
  userId: number;
  email: string;
  role: string;
  userName: string;
  iat: number;
  exp: number;
}

interface OrderData {
  orderName: string;
  description?: string;
  username: string;
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
  price: number;
  packagePhotos?: string[];
  orderId?: number;
  status?: string;
  createdAt?: string;
}

/**
 * Tạo đơn hàng mới
 * @param orderData Dữ liệu đơn hàng
 * @returns Kết quả từ API
 */
export const createOrder = async (orderData: OrderData) => {
  console.log('🚀 Calling Create Order API:', {
    url: `${API_URL}/orders`,
    data: { ...orderData, packagePhotos: orderData.packagePhotos ? `${orderData.packagePhotos.length} photos` : 'No photos' }
  });

  try {
    // Chuẩn bị dữ liệu để gửi
    const requestData: {
      orderName: string;
      description?: string;
      username: string;
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
      price: number;
      packagePhotos: string[];
    } = {
      orderName: orderData.orderName,
      description: orderData.description,
      username: orderData.username,
      sender: {
        name: orderData.sender.name,
        phone: orderData.sender.phone,
        address: orderData.sender.address
      },
      recipient: {
        name: orderData.recipient.name,
        phone: orderData.recipient.phone,
        address: orderData.recipient.address
      },
      price: orderData.price,
      packagePhotos: []
    };

    // Xử lý và chuyển đổi ảnh sang base64
    if (orderData.packagePhotos && orderData.packagePhotos.length > 0) {
      const base64Photos = [];
      const MAX_BASE64_SIZE = 1024 * 1024; // 1MB

      for (let i = 0; i < orderData.packagePhotos.length; i++) {
        const photoUri = orderData.packagePhotos[i];
        const fileInfo = await FileSystem.getInfoAsync(photoUri);

        if (fileInfo.exists) {
          // Nén ảnh với kích thước nhỏ hơn và tỷ lệ nén cao hơn
          const manipResult = await ImageManipulator.manipulateAsync(
            photoUri,
            [{ resize: { width: 800 } }],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
          );

          const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
            encoding: FileSystem.EncodingType.Base64
          });

          // Kiểm tra kích thước base64 string
          if (base64.length > MAX_BASE64_SIZE) {
            console.warn(`Ảnh ${i + 1} có kích thước quá lớn (${Math.round(base64.length / 1024)}KB). Có thể gây lỗi khi gửi.`);
          }

          base64Photos.push(`data:image/jpeg;base64,${base64}`);
        }
      }
      requestData.packagePhotos = base64Photos;
    }

    // Lấy token xác thực
    const token = await getAuthToken();
    if (!token) {
      console.error('Token không tồn tại trong AsyncStorage');
      throw new Error('Vui lòng đăng nhập để thực hiện chức năng này');
    }

    // Giải mã token để lấy thông tin user
    let decodedToken: DecodedToken;
    try {
      decodedToken = jwtDecode<DecodedToken>(token);
      requestData.username = decodedToken.userName;
    } catch (tokenError) {
      console.error('Lỗi khi xử lý token:', tokenError);
      throw new Error('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
    }

    // Gửi request
    const response = await axios.post(`${API_URL}/orders`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Chấp nhận status từ 200-499
      },
    });

    console.log('✅ Create Order Success:', {
      status: response.status,
      data: response.data
    });

    if (response.status >= 400) {
      throw new Error(response.data.message || response.data.error || 'Lỗi khi tạo đơn hàng');
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Create Order Error:', error);
    throw error;
  }
};

/**
 * Lấy danh sách đơn hàng
 * @returns Danh sách đơn hàng
 */
export const getOrders = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('Token không tồn tại trong AsyncStorage');
      throw new Error('Vui lòng đăng nhập để thực hiện chức năng này');
    }

    const response = await axios.get(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status >= 400) {
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách đơn hàng');
    }

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error('❌ Get Orders Error:', error);
    throw error;
  }
};