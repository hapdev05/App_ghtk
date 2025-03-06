import axios from 'axios';

const API_URL = 'http://10.0.2.2:3000/api';

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
    data: { ...data, password: '****' } 
  });
  
  try {
    const response = await axios.post(`${API_URL}/register`, {
      userName: data.username,
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
    console.error('❌ Register Error:', error);
    throw error;
  }
};

export const login = async (username: string, password: string) => {
  console.log('🚀 Calling Login API:', {
    url: `${API_URL}/login`,
    data: { username, password: '****' }
  });
  
  try {
    const response = await axios.post(`${API_URL}/login`, {
      userName: username,
      password: password
    });

    console.log('✅ Login Success:', {
      status: response.status,
      data: response.data
    });
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Login Error:', error);
    throw error;
  }
};