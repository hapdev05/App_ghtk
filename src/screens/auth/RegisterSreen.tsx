import { View, Text, TouchableOpacity, TextInput,Image } from 'react-native';
import shape from "../../assets/images/shape.png"
import { useNavigation } from '@react-navigation/native';
const RegisterScreen = () => {
  const navigation = useNavigation<any>();
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
        <View className="space-y-2">
          <Text className="text-gray-600 text-base ml-4">Confirm password</Text>
          <TextInput 
            placeholder="Enter confirm password"
            className="bg-gray-100 rounded-full px-6 py-3 text-base"
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity className="bg-blue-500 rounded-full py-4">
          <Text className="text-white text-center text-lg font-semibold">
          Register
          </Text>
        </TouchableOpacity>
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Do have an account? </Text>
          <TouchableOpacity>
            <Text className="text-blue-500 font-semibold" onPress={()=>navigation.navigate('Login')}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;