import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { getCustomerOrderDetails } from '../../../../services/customer.service';
import MapView, { Marker, Region, Polyline, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { forwardGeoCode } from '../../../../services/geocoding.service';
import { getDirections } from '../../../../services/directions.service';
import { Platform } from 'react-native';

interface OrderDetailRouteParams {
  orderId: number;
}

interface Order {
  orderId: number;
  orderName: string;
  username: string;
  price: number;
  status: string;
  packagePhotos: string[];
  sender: {
    name: string;
    phone: string;
    address: string;
  };
  recipient: {
    name: string;
    phone: string;
    address: string;
  };
  createdAt?: string;
  description?: string;
  shipperLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
}

interface Location {
  lat: number;
  long: number;
}

interface RouteData {
  distance: string;
  duration: string;
  coordinates: { latitude: number; longitude: number }[];
}

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as OrderDetailRouteParams;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipientLocation, setRecipientLocation] = useState<Location | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [isShipping, setIsShipping] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  useEffect(() => {
    if (order) {
      // Kiểm tra nếu đơn hàng đang trong trạng thái giao hàng
      console.log("Trạng thái đơn hàng:", order.status);
      
      // Kiểm tra tất cả các dạng có thể có của trạng thái "đang giao"
      const status = order.status.toLowerCase();
      const isShippingStatus = status === 'đang giao' || 
                               status === 'shipped' || 
                               status === 'shipping' || 
                               status.includes('giao');
      
      console.log("Kết quả kiểm tra trạng thái:", isShippingStatus);
      setIsShipping(isShippingStatus);
      
      if (order.recipient?.address) {
        fetchRecipientLocation(order.recipient.address);
      }
    }
  }, [order]);

  // Cập nhật vùng hiển thị trên bản đồ khi có vị trí người nhận hoặc vị trí shipper
  useEffect(() => {
    if (isShipping && (recipientLocation || order?.shipperLocation)) {
      updateMapRegion();
    }
  }, [recipientLocation, order?.shipperLocation, isShipping]);

  // Thêm useEffect để lấy tuyến đường khi có vị trí shipper và người nhận
  useEffect(() => {
    if (isShipping && recipientLocation && order?.shipperLocation) {
      fetchRouteDirections();
    }
  }, [recipientLocation, order?.shipperLocation, isShipping]);

  const updateMapRegion = () => {
    if (!recipientLocation && !order?.shipperLocation) {
      console.log('Không có dữ liệu vị trí để hiển thị bản đồ');
      return;
    }

    let regionLatitude, regionLongitude;

    // Nếu có cả hai vị trí, lấy điểm giữa làm trung tâm bản đồ
    if (recipientLocation && order?.shipperLocation) {
      regionLatitude = (recipientLocation.lat + order.shipperLocation.latitude) / 2;
      regionLongitude = (recipientLocation.long + order.shipperLocation.longitude) / 2;
      console.log('Cả 2 vị trí: ', { recipientLocation, shipperLocation: order.shipperLocation });
    } 
    // Nếu chỉ có vị trí người nhận
    else if (recipientLocation) {
      regionLatitude = recipientLocation.lat;
      regionLongitude = recipientLocation.long;
      console.log('Chỉ có vị trí người nhận: ', recipientLocation);
    } 
    // Nếu chỉ có vị trí shipper
    else if (order?.shipperLocation) {
      regionLatitude = order.shipperLocation.latitude;
      regionLongitude = order.shipperLocation.longitude;
      console.log('Chỉ có vị trí shipper: ', order.shipperLocation);
    }

    // Tính toán delta để vừa vặn với cả hai vị trí trên bản đồ
    let latDelta = 0.005;
    let longDelta = 0.005;

    if (recipientLocation && order?.shipperLocation) {
      const latDistance = Math.abs(recipientLocation.lat - order.shipperLocation.latitude);
      const longDistance = Math.abs(recipientLocation.long - order.shipperLocation.longitude);
      latDelta = Math.max(0.005, latDistance * 1.5);
      longDelta = Math.max(0.005, longDistance * 1.5);
    }

    const newRegion = {
      latitude: regionLatitude || 0,
      longitude: regionLongitude || 0,
      latitudeDelta: latDelta,
      longitudeDelta: longDelta,
    };
    
    console.log('Thiết lập mapRegion:', newRegion);
    setMapRegion(newRegion);
  };

  const fetchRecipientLocation = async (address: string) => {
    try {
      setLoadingLocation(true);
      const location = await forwardGeoCode(address);
      if (location) {
        setRecipientLocation(location);
      } else {
        console.log('Không thể chuyển đổi địa chỉ sang tọa độ');
      }
    } catch (error) {
      console.error('Lỗi khi lấy tọa độ từ địa chỉ:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const details = await getCustomerOrderDetails(params.orderId);
      setOrder(details);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Hàm đảm bảo tất cả tọa độ đều là số (cho iOS)
  const ensureNumericCoordinates = (coordinates: Array<{latitude: any, longitude: any}>) => {
    return coordinates.map(point => ({
      latitude: typeof point.latitude === 'number' ? point.latitude : parseFloat(point.latitude),
      longitude: typeof point.longitude === 'number' ? point.longitude : parseFloat(point.longitude)
    }));
  };

  // Hàm lấy tuyến đường từ shipper đến người nhận
  const fetchRouteDirections = async () => {
    if (!recipientLocation || !order?.shipperLocation) return;
    
    try {
      setLoadingRoute(true);
      
      const originCoords = {
        lat: order.shipperLocation.latitude,
        long: order.shipperLocation.longitude
      };
      
      const destinationCoords = {
        lat: recipientLocation.lat,
        long: recipientLocation.long
      };
      
      console.log('Đang lấy tuyến đường từ:', originCoords, 'đến:', destinationCoords);
      
      const result = await getDirections(originCoords, destinationCoords);
      
      if (result && result.polylinePoints && result.polylinePoints.length > 0) {
        // Đảm bảo định dạng tọa độ đúng cho cả iOS và Android
        const coordinates = ensureNumericCoordinates(result.polylinePoints);
        
        setRouteData({
          distance: result.distance.text,
          duration: result.duration.text,
          coordinates: coordinates
        });
        
        console.log('Đã tìm thấy tuyến đường với', coordinates.length, 'điểm');
        
        // Điều chỉnh bản đồ để hiển thị toàn bộ tuyến đường
        if (mapRef.current) {
          try {
            setTimeout(() => {
              mapRef.current?.fitToCoordinates(
                coordinates,
                {
                  edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                  animated: true
                }
              );
            }, 500);
          } catch (error) {
            console.error('Lỗi khi điều chỉnh bản đồ:', error);
          }
        }
      } else {
        console.log('Không tìm thấy tuyến đường hoặc tuyến đường không có điểm nào');
      }
    } catch (error) {
      console.error('Lỗi khi lấy tuyến đường:', error);
    } finally {
      setLoadingRoute(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f39c12'; // Màu cam
      case 'processing':
        return '#3498db'; // Màu xanh dương
      case 'shipped':
        return '#2ecc71'; // Màu xanh lá
      case 'delivered':
        return '#27ae60'; // Màu xanh lá đậm
      case 'cancelled':
        return '#e74c3c'; // Màu đỏ
      default:
        return '#95a5a6'; // Màu xám
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Ionicons name="time" size={18} color="#f39c12" />;
      case 'processing':
        return <Ionicons name="sync" size={18} color="#3498db" />;
      case 'shipped':
        return <Ionicons name="car" size={18} color="#2ecc71" />;
      case 'delivered':
        return <Ionicons name="checkmark-circle" size={18} color="#27ae60" />;
      case 'cancelled':
        return <Ionicons name="close-circle" size={18} color="#e74c3c" />;
      default:
        return <Ionicons name="help" size={18} color="#95a5a6" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
  };

  const formatShipperUpdateTime = (updatedAt?: string) => {
    if (!updatedAt) return 'N/A';
    const date = new Date(updatedAt);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3498db" />
        <Text className="mt-3 text-base text-gray-600">Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text className="mt-3 text-base text-gray-600">Không tìm thấy thông tin đơn hàng</Text>
        <TouchableOpacity 
          className="mt-5 bg-blue-500 px-5 py-3 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex flex-row items-center pt-12 pb-4 px-5 border-b border-gray-100 border-solid bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#34495e" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Chi tiết đơn hàng</Text>
      </View>
      
      <ScrollView className="flex-1">
        {/* DEBUG: Chỉ hiển thị khi đang gỡ lỗi, sau đó có thể bỏ */}
        {/* <View className="px-4 py-2 bg-yellow-100">
          <Text className="text-gray-700">Trạng thái: {order?.status} (isShipping: {isShipping ? 'true' : 'false'})</Text>
        </View> */}
        
        {isShipping && (
          <View style={{ height: 270 }}>
            {(recipientLocation || order?.shipperLocation) && mapRegion ? (
              <MapView 
                ref={mapRef}
                provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
                style={{ width: '100%', height: '100%' }}
                initialRegion={mapRegion}
                region={mapRegion}
                mapType={Platform.OS === 'ios' ? 'standard' : 'standard'}
                rotateEnabled={true}
                pitchEnabled={true}
                showsUserLocation={false}
                loadingEnabled={true}
              >
                {/* Hiển thị tuyến đường - iOS cần strokeColor khác */}
                {routeData && routeData.coordinates.length > 0 && (
                  <>
                    {/* Đường nền - chỉ cho iOS, tạo hiệu ứng đường đậm hơn */}
                    {Platform.OS === 'ios' && (
                      <Polyline
                        coordinates={routeData.coordinates}
                        strokeWidth={7}
                        strokeColor={'rgba(74, 137, 243, 0.3)'}
                        zIndex={0}
                      />
                    )}
                    
                    {/* Đường chính */}
                    <Polyline
                      coordinates={routeData.coordinates}
                      strokeWidth={Platform.OS === 'ios' ? 4 : 5}
                      strokeColor={Platform.OS === 'ios' ? '#4a89f3' : '#3B82F6'}
                      tappable={false}
                      zIndex={1}
                    />
                  </>
                )}
                
                {recipientLocation && (
                  <Marker
                    coordinate={{
                      latitude: recipientLocation.lat,
                      longitude: recipientLocation.long
                    }}
                    title="Địa chỉ người nhận"
                    description={order?.recipient.address}
                    pinColor="#e74c3c" // Màu đỏ cho vị trí người nhận
                  >
                    <View className="items-center justify-center">
                      <Ionicons name="location" size={36} color="#FF3B30" />
                    </View>
                  </Marker>
                )}
                {order?.shipperLocation && (
                  <Marker
                    coordinate={{
                      latitude: order.shipperLocation.latitude,
                      longitude: order.shipperLocation.longitude
                    }}
                    title="Vị trí shipper"
                    description={`Cập nhật lúc: ${formatShipperUpdateTime(order.shipperLocation.updatedAt)}`}
                    pinColor="#3498db" // Màu xanh cho vị trí shipper
                  >
                    <View className="bg-blue-500 p-2 rounded-full border-2 border-white">
                      <Ionicons name="car" size={16} color="#fff" />
                    </View>
                  </Marker>
                )}
              </MapView>
            ) : (
              <View className="w-full h-[270px] bg-gray-200 justify-center items-center">
                {loadingLocation || loadingRoute ? (
                  <ActivityIndicator size="large" color="#3498db" />
                ) : (
                  <View className="p-4 items-center">
                    <Text className="text-gray-500 mb-2">Không thể hiển thị bản đồ</Text>
                    <Text className="text-xs text-gray-400">
                      {recipientLocation ? 'Có vị trí người nhận' : 'Không có vị trí người nhận'} | 
                      {order?.shipperLocation ? 'Có vị trí shipper' : 'Không có vị trí shipper'} | 
                      {mapRegion ? 'Có region' : 'Không có region'}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Hiển thị thông tin tuyến đường */}
            {routeData && (
              <View className="px-4 py-3 bg-blue-50">
                <View className="flex-row items-center">
                  <Ionicons name="car" size={18} color="#3B82F6" />
                  <Text className="text-blue-600 ml-2 font-medium">
                    Khoảng cách: {routeData.distance} ({routeData.duration})
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
        
        <View className="p-4">
          <View className="mb-5 bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-base font-bold text-gray-800 mb-3">Thông tin đơn hàng</Text>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Mã đơn hàng:</Text>
              <Text className="flex-1 text-sm text-gray-800">#{order.orderId}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Tên đơn hàng:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.orderName}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Ngày tạo:</Text>
              <Text className="flex-1 text-sm text-gray-800">{formatDate(order.createdAt)}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Giá trị:</Text>
              <Text className="flex-1 text-sm text-gray-800">{formatPrice(order.price)}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Trạng thái:</Text>
              <View className="flex flex-row items-center px-2 py-1 rounded-full bg-opacity-20" style={{ backgroundColor: getStatusColor(order.status) + '20' }}>
                <View className="mr-1">
                  {getStatusIcon(order.status)}
                </View>
                <Text className="text-sm font-semibold" style={{ color: getStatusColor(order.status) }}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>
            {order.description && (
              <View className="flex flex-row items-center mb-2">
                <Text className="w-32 text-sm text-gray-600">Mô tả:</Text>
                <Text className="flex-1 text-sm text-gray-800">{order.description}</Text>
              </View>
            )}
          </View>

          <View className="mb-5 bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-base font-bold text-gray-800 mb-3">Thông tin người gửi</Text>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Tên:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.sender.name}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Số điện thoại:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.sender.phone}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Địa chỉ:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.sender.address}</Text>
            </View>
          </View>

          <View className="mb-5 bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-base font-bold text-gray-800 mb-3">Thông tin người nhận</Text>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Tên:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.recipient.name}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Số điện thoại:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.recipient.phone}</Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <Text className="w-32 text-sm text-gray-600">Địa chỉ:</Text>
              <Text className="flex-1 text-sm text-gray-800">{order.recipient.address}</Text>
            </View>
          </View>

          {order.packagePhotos && order.packagePhotos.length > 0 && (
            <View className="mb-5 bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-base font-bold text-gray-800 mb-3">Hình ảnh gói hàng</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                {order.packagePhotos.map((item, index) => (
                  <Image
                    key={`photo-${index}`}
                    source={{ uri: item.startsWith('http') ? item : `https://fa6e-2001-ee0-4b49-c580-bc32-ded9-8e98-e594.ngrok-free.app/data/img/${item}` }}
                    className="w-60 h-60 rounded-lg mr-2"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetailScreen; 