import { View, Text, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import shape from "../../assets/images/shape.png"
import { useNavigation } from '@react-navigation/native'
import { ArrowLeft } from "react-native-feather"

const ForgotPassword = () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSendingCode, setIsSendingCode] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [error, setError] = useState('')
    const [step, setStep] = useState(1) 

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleSendCode = async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address')
            return
        }
        
        setError('')
        setIsSendingCode(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            setStep(2)
            setCountdown(60)
        } catch (err) {
            setError('Failed to send code. Please try again.')
        } finally {
            setIsSendingCode(false)
        }
    }

    const handleResetPassword = async () => {
        if (!otp) {
            setError('Please enter the OTP code')
            return
        }
        
        setError('')
        setIsLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            navigation.navigate('ResetPassword')
        } catch (err) {
            setError('Invalid OTP code. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <View className="flex-1 bg-white">
            <View className="w-full relative">
                <Image source={shape} resizeMode="cover" />
                <TouchableOpacity 
                    className="absolute top-12 left-4 p-2"
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft stroke="#000" width={24} height={24} />
                </TouchableOpacity>
            </View>
            
            <View className="px-12">
                <Text className="text-4xl font-bold pt-20">Forgotten Password</Text>
                <Text className="text-gray-500 mt-4">
                    {step === 1 
                        ? "Enter your email address to receive a verification code" 
                        : "Enter the verification code sent to your email"
                    }
                </Text>
            </View>

            <View className="px-12 mt-10 space-y-6">
                <View className="space-y-2">
                    <Text className="text-gray-600 text-base ml-4">Email</Text>
                    <TextInput 
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        className="bg-gray-100 rounded-full px-6 py-3 text-base"
                        placeholderTextColor="#999"
                        editable={!isSendingCode && step === 1}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                {step === 2 && (
                    <View className="space-y-2">
                        <Text className="text-gray-600 text-base ml-4">OTP Code</Text>
                        <TextInput 
                            placeholder="Enter OTP"
                            value={otp}
                            onChangeText={setOtp}
                            className="bg-gray-100 rounded-full px-6 py-3 text-base"
                            placeholderTextColor="#999"
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>
                )}
                
                {error ? (
                    <Text className="text-red-500 text-center">{error}</Text>
                ) : null}
                {step === 1 ? (
                    <TouchableOpacity 
                        className={`bg-blue-500 rounded-full py-4 ${isSendingCode ? 'opacity-70' : ''}`}
                        onPress={handleSendCode}
                        disabled={isSendingCode}
                    >
                        {isSendingCode ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center text-lg font-semibold">
                                Send Code
                            </Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View className="space-y-4">
                        <TouchableOpacity 
                            className={`bg-blue-500 rounded-full py-4 ${isLoading ? 'opacity-70' : ''}`}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center text-lg font-semibold" >
                                    Verify & Continue
                                </Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleSendCode}
                            disabled={countdown > 0 || isSendingCode}
                            className="items-center"
                        >
                            <Text className={`${countdown > 0 ? 'text-gray-400' : 'text-blue-500'}`}>
                                {countdown > 0 
                                    ? `Resend code in ${countdown}s` 
                                    : 'Resend code'
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    )
}

export default ForgotPassword