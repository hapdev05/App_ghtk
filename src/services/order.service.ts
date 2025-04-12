import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const API_URL = 'https://e1cc-2001-ee0-4b4b-d9e0-d429-cb71-1b7-5670.ngrok-free.app/api';

interface OrderData {
  orderName: string;
  description?: string;
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

    // Gửi request
    const response = await axios.post(`${API_URL}/orders`, requestData, {
      headers: {
        'Content-Type': 'application/json',
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
    const response = await axios.get(`${API_URL}/orders`);
    
    if (response.status >= 400) {
      throw new Error(response.data.message || 'Lỗi khi tạo đơn hàng');
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