import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import shape from '../../assets/images/shape.png'
import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loginError, setLoginError] = useState('')

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
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
    setLoginError('')
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      navigation.navigate('Home')
    } catch (err) {
      setLoginError('Failed to login. Please try again.')
    }
  }

  const handleEmailChange = (text: string) => {
    setEmail(text)
    if (emailError) validateEmail(text)
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
          <Text className="text-gray-600 text-base ml-4">Email</Text>
          <TextInput 
            placeholder="Enter your email"
            className="bg-gray-100 rounded-full px-6 py-3 text-base"
            placeholderTextColor="#999"
            value={email}
            onChangeText={handleEmailChange}
            
          />
          {emailError && (<Text className="text-red-500 text-xs">{emailError}</Text>)}
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

        <TouchableOpacity className="bg-blue-500 rounded-full py-4" onPress={handleLogin}>
          <Text className="text-white text-center text-lg font-semibold">
            Login
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