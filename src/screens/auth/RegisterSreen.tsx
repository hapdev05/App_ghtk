import { View, Text, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import shape from "../../assets/images/shape.png"
import { useNavigation } from '@react-navigation/native';
import { register } from '../../services/auth.service';
const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };
  const checkPassword = (password: string): string => {
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (!/(?=.*[a-z])/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ thường';
    if (!/(?=.*[A-Z])/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    if (!/(?=.*\d)/.test(password)) return 'Mật khẩu phải có ít nhất 1 số';
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)';
    return '';
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(checkPassword(text));
    if (confirmPassword) {
      setPasswordMatch(text === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setPasswordMatch(password === text);
  };
  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    
    if (!isValidEmail(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }
    if (passwordError) {
      Alert.alert('Lỗi', passwordError);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      setLoading(true);
      const response = await register({ email, password, username });
      Alert.alert('Thành công', `Đăng ký tài khoản thành công\n\nUsername: ${username}\nEmail: ${email}`, [
        {
          text: 'Đăng nhập ngay',
          onPress: () => navigation.navigate('Login')
        }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };
  return (
    <View className="flex-1 bg-white">
      <View className="w-full">
        <Image source={shape}  resizeMode="cover" />
      </View>
      
      <View className="pl-12">
        <Text className="text-4xl font-bold pl-8 pt-20">Register SFlash</Text>
      </View>

      <View className="px-12 mt-10 space-y-6">
        <View className="space-y-2">
          <Text className="text-gray-600 text-base ml-4">Username</Text>
          <TextInput 
            placeholder="Enter your username"
            className="bg-gray-100 rounded-full px-6 py-3 text-base"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View className="space-y-2">
          <Text className="text-gray-600 text-base ml-4">Email</Text>
          <TextInput 
            placeholder="Enter your email"
            className="bg-gray-100 rounded-full px-6 py-3 text-base"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="space-y-2">
          <Text className="text-gray-600 text-base ml-4">Password</Text>
          <TextInput 
            placeholder="Enter your password"
            secureTextEntry
            className={`bg-gray-100 rounded-full px-6 py-3 text-base ${passwordError ? 'border-2 border-red-500' : ''}`}
            placeholderTextColor="#999"
            value={password}
            onChangeText={handlePasswordChange}
            style={{ fontFamily: 'System' }}
          />
          {passwordError ? (
            <Text className="text-red-500 text-sm ml-4 mt-1">{passwordError}</Text>
          ) : null}
        </View>
        <View className="space-y-2">
          <Text className="text-gray-600 text-base ml-4">Confirm password</Text>
          <TextInput 
            placeholder="Enter confirm password"
            secureTextEntry
            className={`bg-gray-100 rounded-full px-6 py-3 text-base ${!passwordMatch && confirmPassword ? 'border-2 border-red-500' : ''}`}
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            style={{ fontFamily: 'System' }}
          />
          {!passwordMatch && confirmPassword ? (
            <Text className="text-red-500 text-sm ml-4 mt-1">Mật khẩu không khớp</Text>
          ) : null}
        </View>
        <TouchableOpacity 
          className="bg-blue-500 rounded-full py-4" 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center text-lg font-semibold">
              Register
            </Text>
          )}
        </TouchableOpacity>
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Do have an account? </Text>
          <TouchableOpacity>
            <Text className="text-blue-500 font-semibold" onPress={()=>navigation.navigate('Login')}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;