import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert, Image, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'

const CreateOrder = () => {
  const navigation = useNavigation<any>()
  
  // Yêu cầu quyền truy cập camera và thư viện ảnh khi component được tải
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert('Thông báo', 'Cần quyền truy cập camera và thư viện ảnh để sử dụng đầy đủ tính năng của ứng dụng');
        }
      }
    })();
  }, []);

  // State for form fields
  const [orderName, setOrderName] = useState('')
  const [description, setDescription] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [senderAddress, setSenderAddress] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [price, setPrice] = useState('')
  const [packagePhotos, setPackagePhotos] = useState<string[]>([])

  // Validation state
  const [errors, setErrors] = useState({
    orderName: '',
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    price: ''
  })

  // Handle form submission
  const handleSubmit = () => {
    // Reset errors
    const newErrors = {
      orderName: '',
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      recipientName: '',
      recipientPhone: '',
      recipientAddress: '',
      price: ''
    }

    // Validate fields
    let isValid = true

    if (!orderName.trim()) {
      newErrors.orderName = 'Vui lòng nhập tên đơn hàng'
      isValid = false
    }

    if (!senderName.trim()) {
      newErrors.senderName = 'Vui lòng nhập tên người gửi'
      isValid = false
    }

    if (!senderPhone.trim()) {
      newErrors.senderPhone = 'Vui lòng nhập số điện thoại người gửi'
      isValid = false
    } else if (!/^\d{10}$/.test(senderPhone)) {
      newErrors.senderPhone = 'Số điện thoại không hợp lệ (10 số)'
      isValid = false
    }

    if (!senderAddress.trim()) {
      newErrors.senderAddress = 'Vui lòng nhập địa chỉ gửi'
      isValid = false
    }

    if (!recipientName.trim()) {
      newErrors.recipientName = 'Vui lòng nhập tên người nhận'
      isValid = false
    }

    if (!recipientPhone.trim()) {
      newErrors.recipientPhone = 'Vui lòng nhập số điện thoại người nhận'
      isValid = false
    } else if (!/^\d{10}$/.test(recipientPhone)) {
      newErrors.recipientPhone = 'Số điện thoại không hợp lệ (10 số)'
      isValid = false
    }

    if (!recipientAddress.trim()) {
      newErrors.recipientAddress = 'Vui lòng nhập địa chỉ nhận'
      isValid = false
    }

    if (!price.trim()) {
      newErrors.price = 'Vui lòng nhập giá'
      isValid = false
    } else if (isNaN(Number(price))) {
      newErrors.price = 'Giá phải là số'
      isValid = false
    }

    setErrors(newErrors)

    if (isValid) {
      // Process form submission
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc chắn muốn tạo đơn hàng này?',
        [
          {
            text: 'Hủy',
            style: 'cancel'
          },
          {
            text: 'Xác nhận',
            onPress: () => {
              // Here you would typically send data to API
              console.log({
                orderName,
                description,
                sender: {
                  name: senderName,
                  phone: senderPhone,
                  address: senderAddress
                },
                recipient: {
                  name: recipientName,
                  phone: recipientPhone,
                  address: recipientAddress
                },
                price: Number(price),
                packagePhotos
              })
              
              // Show success message
              Alert.alert('Thành công', 'Đơn hàng đã được tạo thành công', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('CustomerHome')
                }
              ])
            }
          }
        ]
      )
    }
  }

  return (
    <View className="flex-1 bg-gray-100 pt-10">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4 flex-row items-center shadow-sm">
        <TouchableOpacity 
          className="p-2 mr-4" 
          onPress={() => navigation.goBack()}
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Tạo đơn hàng mới</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Form */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Thông tin đơn hàng</Text>
          
          {/* Order Name */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Tên đơn hàng <Text className="text-red-500">*</Text></Text>
            <TextInput
              className={`border ${errors.orderName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
              placeholder="Nhập tên đơn hàng"
              value={orderName}
              onChangeText={setOrderName}
            />
            {errors.orderName ? <Text className="text-red-500 text-xs mt-1">{errors.orderName}</Text> : null}
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Mô tả</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Nhập mô tả đơn hàng"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Sender Information */}
          <View className="mb-4">
            <Text className="text-lg font-medium text-gray-800 mb-2">Thông tin người gửi</Text>
            
            {/* Sender Name */}
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Tên người gửi <Text className="text-red-500">*</Text></Text>
              <TextInput
                className={`border ${errors.senderName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                placeholder="Nhập tên người gửi"
                value={senderName}
                onChangeText={setSenderName}
              />
              {errors.senderName ? <Text className="text-red-500 text-xs mt-1">{errors.senderName}</Text> : null}
            </View>
            
            {/* Sender Phone */}
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Số điện thoại <Text className="text-red-500">*</Text></Text>
              <TextInput
                className={`border ${errors.senderPhone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                placeholder="Nhập số điện thoại người gửi"
                value={senderPhone}
                onChangeText={setSenderPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.senderPhone ? <Text className="text-red-500 text-xs mt-1">{errors.senderPhone}</Text> : null}
            </View>
            
            {/* Sender Address */}
            <View>
              <Text className="text-gray-700 mb-1">Địa chỉ gửi <Text className="text-red-500">*</Text></Text>
              <TextInput
                className={`border ${errors.senderAddress ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                placeholder="Nhập địa chỉ gửi hàng"
                value={senderAddress}
                onChangeText={setSenderAddress}
              />
              {errors.senderAddress ? <Text className="text-red-500 text-xs mt-1">{errors.senderAddress}</Text> : null}
            </View>
          </View>

          {/* Recipient Information */}
          <View className="mb-4">
            <Text className="text-lg font-medium text-gray-800 mb-2">Thông tin người nhận</Text>
            
            {/* Recipient Name */}
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Tên người nhận <Text className="text-red-500">*</Text></Text>
              <TextInput
                className={`border ${errors.recipientName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                placeholder="Nhập tên người nhận"
                value={recipientName}
                onChangeText={setRecipientName}
              />
              {errors.recipientName ? <Text className="text-red-500 text-xs mt-1">{errors.recipientName}</Text> : null}
            </View>
            
            {/* Recipient Phone */}
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Số điện thoại <Text className="text-red-500">*</Text></Text>
              <TextInput
                className={`border ${errors.recipientPhone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                placeholder="Nhập số điện thoại người nhận"
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.recipientPhone ? <Text className="text-red-500 text-xs mt-1">{errors.recipientPhone}</Text> : null}
            </View>
            
            {/* Recipient Address */}
            <View>
              <Text className="text-gray-700 mb-1">Địa chỉ nhận <Text className="text-red-500">*</Text></Text>
              <TextInput
                className={`border ${errors.recipientAddress ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
                placeholder="Nhập địa chỉ nhận hàng"
                value={recipientAddress}
                onChangeText={setRecipientAddress}
              />
              {errors.recipientAddress ? <Text className="text-red-500 text-xs mt-1">{errors.recipientAddress}</Text> : null}
            </View>
          </View>

          {/* Price */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Giá (VNĐ) <Text className="text-red-500">*</Text></Text>
            <TextInput
              className={`border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2`}
              placeholder="Nhập giá đơn hàng"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            {errors.price ? <Text className="text-red-500 text-xs mt-1">{errors.price}</Text> : null}
          </View>

          {/* Package Photos */}
          <View className="mb-4">
            <Text className="text-lg font-medium text-gray-800 mb-2">Hình ảnh đơn hàng</Text>
            <Text className="text-gray-500 text-xs mb-3">Chụp ảnh đơn hàng để người giao hàng dễ nhận diện</Text>
            
            {/* Photo Grid */}
            <View className="flex-row flex-wrap mb-3">
              {packagePhotos.map((photo, index) => (
                <View key={index} className="mr-2 mb-2 relative">
                  <Image 
                    source={{ uri: photo }} 
                    className="w-20 h-20 rounded-md" 
                  />
                  <TouchableOpacity 
                    className="absolute top-1 right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center"
                    onPress={() => {
                      const newPhotos = [...packagePhotos];
                      newPhotos.splice(index, 1);
                      setPackagePhotos(newPhotos);
                    }}
                  >
                    <Text className="text-white text-xs font-bold">X</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              {/* Add Photo Button */}
              {packagePhotos.length < 4 && (
                <TouchableOpacity 
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md items-center justify-center"
                  onPress={() => {
                                      Alert.alert(
                      'Chọn hình ảnh',
                      'Bạn muốn thêm hình ảnh từ:',
                      [
                        {
                          text: 'Máy ảnh',
                          onPress: async () => {
                            try {
                              // Mở camera
                              const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                              });
                              
                              if (!result.canceled && result.assets && result.assets.length > 0) {
                                setPackagePhotos([...packagePhotos, result.assets[0].uri]);
                              }
                            } catch (error) {
                              console.error('Lỗi khi chụp ảnh:', error);
                              Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại sau.');
                            }
                          }
                        },
                        {
                          text: 'Thư viện ảnh',
                          onPress: async () => {
                            try {
                              // Mở thư viện ảnh
                              const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                              });
                              
                              if (!result.canceled && result.assets && result.assets.length > 0) {
                                setPackagePhotos([...packagePhotos, result.assets[0].uri]);
                              }
                            } catch (error) {
                              console.error('Lỗi khi chọn ảnh:', error);
                              Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại sau.');
                            }
                          }
                        },
                        {
                          text: 'Hủy',
                          style: 'cancel'
                        }
                      ]
                    );
                  }}
                >
                  <Text className="text-3xl text-gray-400">+</Text>
                  <Text className="text-xs text-gray-500">Chụp ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <Text className="text-gray-500 text-xs">• Tối đa 4 ảnh</Text>
            <Text className="text-gray-500 text-xs">• Ảnh rõ nét giúp đảm bảo giao hàng chính xác</Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-4 bg-white shadow-lg">
        <TouchableOpacity 
          className="bg-blue-500 py-3 rounded-lg items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-lg">Tạo đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CreateOrder