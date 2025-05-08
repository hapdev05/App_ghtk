import axios from 'axios';
import { setAuthToken, checkAsyncStorage, removeAuthToken } from '../config/auth.config'; // Import setAuthToken, checkAsyncStorage và removeAuthToken

const API_URL = 'https://fa6e-2001-ee0-4b49-c580-bc32-ded9-8e98-e594.ngrok-free.app/api';

interface RegisterData {
  email: string;
  password: string;
  username: string;
  idUser?: string;
}

interface LoginData {
  username: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  console.log('🚀 Calling Register API:', {
    url: `${API_URL}/register`,
    data: { ...data, password: '****' },
  });

  try {
    const response = await axios.post(`${API_URL}/register`, {
      userName: data.username,
      email: data.email,
      password: data.password,
    });

    console.log('✅ Register Success:', {
      status: response.status,
      data: response.data,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Register Error:', error);
    throw error;
  }
};

export const login = async (username: string, password: string) => {
  console.log('🚀 Calling Login API:', {
    url: `${API_URL}/login`,
    data: { username, password: '****' },
  });

  try {
    const response = await axios.post(`${API_URL}/login`, {
      userName: username,
      password: password,
    });

    console.log('✅ Login Success:', {
      status: response.status,
      data: response.data,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    const token = response.data.token; // Giả sử API trả về { token: "jwt_token" }
    if (!token) {
      console.error('API không trả về token');
      throw new Error('Đăng nhập thất bại: Không nhận được token');
    }

    await setAuthToken(token); // Lưu token vào AsyncStorage
    await checkAsyncStorage(); // Kiểm tra token đã lưu đúng chưa
    console.log('Đăng nhập thành công, token đã lưu');

    return response.data;
  } catch (error: any) {
    
    throw error;
  }
};

export const logout = async () => {
  try {
    await removeAuthToken();
    console.log('✅ Logout Success: Token đã được xóa');
    return true;
  } catch (error: any) {
    console.error('❌ Logout Error:', error);
    throw error;
  }
};