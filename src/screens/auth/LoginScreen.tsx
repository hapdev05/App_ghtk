import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import shape from '../../assets/images/shape.png'
import { useNavigation } from '@react-navigation/native'

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <View className="flex-1 bg-white">
      <View className="w-full">
        <Image source={shape}  resizeMode="cover" />
      </View>
      
      <View className="pl-12">
        <Text className="text-4xl font-bold pl-14 pt-20">Login SFlash</Text>
      </View>

      <View className="px-12 mt-10 space-y-6">
        <View className="space-y-2">
          <Text className="text-gray-600 text-base ml-4">Email</Text>
          <TextInput 
            placeholder="Enter your email"
            className="bg-gray-100 rounded-full px-6 py-3 text-base"
            placeholderTextColor="#999"
          />
        </View>

        <View className="space-y-2">
          <Text className="text-gray-600 text-base ml-4">Password</Text>
          <TextInput 
            placeholder="Enter your password"
            secureTextEntry
            className="bg-gray-100 rounded-full px-6 py-3 text-base"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity>
          <Text className="text-blue-500 text-right mr-4" onPress={()=>navigation.navigate("Forgot")}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-blue-500 rounded-full py-4">
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