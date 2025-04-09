import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import shape from '../../assets/images/shape.png'
import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import { login } from '../../services/auth.service'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateUsername = (username: string) => {
    if (!username) {
      setUsernameError('Username is required')
      return false
    }
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters')
      return false
    }
    setUsernameError('')
    return true
  }

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError('Please enter both username and password')
      return
    }

    setIsLoading(true)
    setLoginError('')

    try {
      const response = await login(username, password)
      setIsLoading(false)

      // Lưu token vào AsyncStorage
      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token)
      }

      // Lấy role từ response API
      const userRole = response.user.role || 'customer';
      
      // Điều hướng dựa vào role
      switch(userRole) {
        case 'admin':
          navigation.navigate('AdminDashboard');
          break;
        case 'customer':
          navigation.navigate('CustomerHome');
          break;
        case 'shipper':
          navigation.navigate('ShipperDashboard');
          break;
        default:
          navigation.navigate('CustomerHome');
      }
      
      // Log thông tin để debug
      console.log('Login Success:', {
        role: userRole,
        username: response.user.userName,
        token: response.token ? 'Token received' : 'No token'
      });
      
    } catch (err: any) {
      setIsLoading(false)
      setLoginError(err.message || 'Failed to login. Please try again.')
      Alert.alert('Login Error', err.message || 'Failed to login. Please try again.')
    }
  }

  const handleUsernameChange = (text: string) => {
    setUsername(text)
    if (usernameError) validateUsername(text)
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text)
    if (passwordError) validatePassword(text)
  }

  return (
    <View className="flex-1 bg-white">
      <View className="w-full">
        <Image source={shape}  resizeMode="cover" />
      </View>
      
      <View className="pl-12">
        <Text className="text-4xl font-bold pl-14 pt-20">Login SFlash</Text>
      </View>

      <View className="px-12 mt-10 space-y-6">
        <View className="space-y-2" >
          <Text className="text-gray-600 text-base ml-4">Username</Text>
          <TextInput 
            placeholder="Enter your username"
            className="bg-gray-100 rounded-full px-6 py-3 text-base"
            placeholderTextColor="#999"
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
          />
          {usernameError && (<Text className="text-red-500 text-xs">{usernameError}</Text>)}
        </View>

        <View className="space-y-2">
          <Text className="text-gray-600 text-base ml-4">Password</Text>
          <TextInput 
            placeholder="Enter your password"
            secureTextEntry
            className="bg-gray-100 rounded-full px-6 py-3 text-base"
            placeholderTextColor="#999"
            value={password}
            onChangeText={handlePasswordChange}
          />
        </View>
        {passwordError && (<Text className="text-red-500 text-xs">{passwordError}</Text>)}
        <TouchableOpacity>
          <Text className="text-blue-500 text-right mr-4" onPress={()=>navigation.navigate("Forgot")}>Forgot Password?</Text>
        </TouchableOpacity>

        {loginError && (<Text className="text-red-500 text-xs text-center">{loginError}</Text>)}
        
        <TouchableOpacity 
          className={`${isLoading ? 'bg-blue-300' : 'bg-blue-500'} rounded-full py-4`} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Don't have an account? </Text>
          <TouchableOpacity>
            <Text className="text-blue-500 font-semibold" onPress={()=>navigation.navigate('Register')}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default LoginScreen