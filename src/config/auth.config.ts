import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_TOKEN_KEY = '@auth_token';

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    console.log('Token lấy được:', token ? 'Có token' : 'Không có token');
    return token;
  } catch (error) {
    console.error('Lỗi khi lấy token:', error);
    return null;
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    console.log('Token đã lưu thành công:', token.slice(0, 10) + '...'); // Chỉ log 10 ký tự đầu để an toàn
  } catch (error) {
    console.error('Lỗi khi lưu token:', error);
    throw new Error('Không thể lưu token vào AsyncStorage');
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    console.log('Token đã được xóa');
  } catch (error) {
    console.error('Lỗi khi xóa token:', error);
  }
};

export const checkAsyncStorage = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    console.log('Token hiện tại trong AsyncStorage:', token ? token.slice(0, 10) + '...' : 'Không có token');
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('Tất cả key trong AsyncStorage:', allKeys);
  } catch (error) {
    console.error('Lỗi kiểm tra AsyncStorage:', error);
  }
};