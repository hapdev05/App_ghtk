import axios from 'axios';

const API_URL = 'https://e1cc-2001-ee0-4b4b-d9e0-d429-cb71-1b7-5670.ngrok-free.app/api'; 

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
    throw error;
  }
};