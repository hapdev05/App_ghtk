import axios from 'axios';

const API_URL = 'http://10.0.2.2:3000/api';

interface RegisterData {
  email: string;
  password: string;
  username: string; 
  idUser?: string; 
}

export const register = async (data: RegisterData) => {
  console.log('🚀 Calling Register API:', {
    url: `${API_URL}/register`,
    data: { ...data, password: '****' } 
  });
  
  try {
    const response = await axios.post(`${API_URL}/register`, {
      userName: data.username,
      idUser: `user_${Date.now()}`,
      email: data.email,
      password: data.password
    });

    console.log('✅ Register Success:', {
      status: response.status,
      data: response.data
    });
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.status === 400) {
      throw new Error('Dữ liệu đăng ký không hợp lệ');
    } else if (error.response?.status === 409) {
      throw new Error('Email hoặc username đã tồn tại');
    } else if (!error.response) {
      throw new Error('Không thể kết nối đến server');
    } else {
      throw new Error('Lỗi đăng ký: ' + (error.response?.data?.message || error.message));
    }
  }
}