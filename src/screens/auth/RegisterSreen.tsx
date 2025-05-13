import { View, Text, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useState } from 'react';
import shape from "../../assets/images/shape.png"
import { useNavigation } from '@react-navigation/native';
import { register } from '../../services/auth.service';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

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
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingTop: height * 0.15 }}
        >
          <View className="px-6 pt-8">
            <Text className="text-3xl font-bold text-center">Đăng ký tài khoản</Text>
          </View>

          <View className="px-6 mt-6 space-y-4 flex-1">
            <View className="space-y-1">
              <Text className="text-gray-600 text-base ml-4">Tên tài khoản</Text>
              <TextInput 
                placeholder="Nhập tên tài khoản"
                className="bg-gray-100 rounded-full px-5 py-3 text-base"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View className="space-y-1">
              <Text className="text-gray-600 text-base ml-4">Email</Text>
              <TextInput 
                placeholder="Nhập email"
                className="bg-gray-100 rounded-full px-5 py-3 text-base"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="space-y-1">
              <Text className="text-gray-600 text-base ml-4">Mật khẩu</Text>
              <TextInput 
                placeholder="Nhập mật khẩu"
                secureTextEntry
                className={`bg-gray-100 rounded-full px-5 py-3 text-base ${passwordError ? 'border-2 border-red-500' : ''}`}
                placeholderTextColor="#999"
                value={password}
                onChangeText={handlePasswordChange}
              />
              {passwordError ? (
                <Text className="text-red-500 text-sm ml-4">{passwordError}</Text>
              ) : null}
            </View>
            
            <View className="space-y-1">
              <Text className="text-gray-600 text-base ml-4">Xác nhận mật khẩu</Text>
              <TextInput 
                placeholder="Nhập xác nhận mật khẩu"
                secureTextEntry
                className={`bg-gray-100 rounded-full px-5 py-3 text-base ${!passwordMatch && confirmPassword ? 'border-2 border-red-500' : ''}`}
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
              />
              {!passwordMatch && confirmPassword ? (
                <Text className="text-red-500 text-sm ml-4">Mật khẩu không khớp</Text>
              ) : null}
            </View>
            
            <View className="pt-4">
              <TouchableOpacity 
                className="bg-blue-500 rounded-full py-3.5" 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-lg font-semibold">
                    Đăng ký
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View className="flex-row justify-center pt-4 pb-6">
              <Text className="text-gray-600">Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-blue-500 font-semibold">Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;