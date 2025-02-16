
import { View, Text, Image } from 'react-native'
import shape from '../../assets/images/shape.png';
const LoginScreen = () => {
  return (
    <View>
      <View>
        <Image source={shape}></Image>
      </View>
      <View className='pl-12'>
        <Text className='text-4xl font-bold pl-14 pt-20'>Login SFlash</Text>
      </View>
      <View>
        
      </View>
    </View>
  )
}

export default LoginScreen