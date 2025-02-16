import { View, Text, Image, TouchableOpacity, Animated, Easing } from 'react-native'
import shape from '../../assets/images/shape.png';
import imageGet from '../../assets/images/imageGet.png';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';

const IntroScreen = () => {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.spring(buttonAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={shape} />
      </Animated.View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text className='text-4xl font-bold pl-14 pt-20'>Welcome to SFlash</Text>
      </Animated.View>
      
      <Animated.View 
        className='pl-16 pt-20'
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Image source={imageGet} />
      </Animated.View>

      <Animated.View 
        className='pl-28'
        style={{
          opacity: buttonAnim,
          transform: [
            { scale: buttonAnim },
            { translateY: slideAnim }
          ],
        }}
      >
        <TouchableOpacity 
          className="bg-blue-400 w-52 py-3 rounded-full mt-32" 
          onPress={() => navigation.navigate('Login')}
        >
          <Text className="text-white font-bold text-lg text-center">Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

export default IntroScreen