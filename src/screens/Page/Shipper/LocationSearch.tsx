import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { forwardGeoCode, reverseGeoCode } from '../../../services/geocoding.service';
import { getDirections } from '../../../services/directions.service';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { styled } from 'nativewind';

interface Location {
  lat: number;
  long: number;
}

interface LocationResult {
  address: string;
  city: string;
  country: string;
  items: Array<{
    position: {
      lat: number;
      lng: number;
    };
    title: string;
    // Các thuộc tính khác
  }>;
  postalCode: string;
}

interface RouteData {
  distance: string;
  duration: string;
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
}

// Tạo các styled components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const LocationSearch = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [shipperLocation, setShipperLocation] = useState<Location | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const navigation = useNavigation();
  const watchIdRef = useRef<number | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    // extractLocationFromLoginData();

    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto'
    });

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Tính khoảng cách giữa hai điểm (km)
  const calculateDistance = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = toRad(endLat - startLat);
    const dLon = toRad(endLng - startLng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(startLat)) * Math.cos(toRad(endLat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Làm tròn đến 2 chữ số thập phân
  };

  const toRad = (value: number) => {
    return value * Math.PI / 180;
  };

  useEffect(() => {
    Geolocation.getCurrentPosition(position => {
      if (position.coords) {
        fetchLocationAddress(position.coords.latitude, position.coords.longitude);
      }
    });
  }, []);
  
  const fetchLocationAddress = async (lat: number, long: number) => {
    try {
      const result = await reverseGeoCode({ lat, long });
      if (result) {
        setCurrentLocation(result.address);
        setCurrentAddress(result.address);
        // Lưu vị trí hiện tại của shipper
        const newLocation = { lat, long };
        setShipperLocation(newLocation);
        
        // Cập nhật vị trí trên bản đồ
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: lat,
            longitude: long,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }, 1000);
        }
        
        console.log('Current location:', result);
      }
    } catch (error) {
      console.error('Error getting location address:', error);
    }
  };
  const startLocationTracking = () => {
    if (watchIdRef.current !== null) {
      stopLocationTracking();
      return;
    }

    setIsTracking(true);
    Alert.alert('Thông báo', 'Đang bắt đầu theo dõi vị trí của bạn...');

    try {
      watchIdRef.current = Geolocation.watchPosition(
        position => {
          const { latitude, longitude, accuracy: posAccuracy } = position.coords;
          const newLocation = {
            lat: latitude,
            long: longitude
          };
          
          console.log('Vị trí mới:', newLocation, 'Độ chính xác:', posAccuracy);
          
          setShipperLocation(newLocation);
          setAccuracy(posAccuracy);
          
          // Cập nhật khoảng cách nếu đang hiển thị tuyến đường
          if (showRoute && location) {
            try {
              const dist = calculateDistance(
                latitude, longitude, 
                location.lat, location.long
              );
              setDistance(dist);
              
              // Nếu khoảng cách thay đổi đáng kể (>100m), cập nhật tuyến đường
              if (Math.abs(dist - (distance || 0)) > 0.1) {
                fetchDirections(newLocation, location).catch(err => {
                  console.error('Lỗi khi cập nhật tuyến đường:', err);
                });
              }
            } catch (err) {
              console.error('Lỗi khi tính khoảng cách:', err);
            }
          }
          
          if (mapRef.current) {
            try {
              mapRef.current.animateToRegion({
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
              }, 1000);
            } catch (err) {
              console.error('Lỗi khi di chuyển bản đồ:', err);
            }
          }
        },
        error => {
          console.error('Lỗi khi theo dõi vị trí:', error);
          Alert.alert('Lỗi', 'Không thể theo dõi vị trí: ' + error.message);
          setIsTracking(false);
          watchIdRef.current = null;
        },
        { 
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 5000,
          fastestInterval: 2000,
          timeout: 10000 // Timeout 10 giây để tránh treo app
        }
      );
    } catch (error) {
      console.error('Lỗi khi khởi tạo theo dõi vị trí:', error);
      Alert.alert('Lỗi', 'Không thể bắt đầu theo dõi vị trí. Vui lòng thử lại sau.');
      setIsTracking(false);
    }
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
      Alert.alert('Thông báo', 'Đã dừng theo dõi vị trí');
    }
  };

  const handleSearch = async () => {
    if (!address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return;
    }

    setLoading(true);
    try {
      const coordinates = await forwardGeoCode(address);
      if (coordinates) {
        setLocation(coordinates);
        setShowRoute(false); // Ẩn tuyến đường khi tìm địa điểm mới
        setRouteData(null);
        
        // Tính khoảng cách nếu có vị trí shipper
        if (shipperLocation) {
          const dist = calculateDistance(
            shipperLocation.lat, shipperLocation.long,
            coordinates.lat, coordinates.long
          );
          setDistance(dist);
        }
        
        console.log('Tìm thấy tọa độ:', coordinates);
      } else {
        Alert.alert('Thông báo', 'Không tìm thấy tọa độ cho địa chỉ này');
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm tọa độ:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm địa chỉ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getMapRegion = () => {
    if (location && shipperLocation) {
      const minLat = Math.min(location.lat, shipperLocation.lat);
      const maxLat = Math.max(location.lat, shipperLocation.lat);
      const minLng = Math.min(location.long, shipperLocation.long);
      const maxLng = Math.max(location.long, shipperLocation.long);
      
      const latDelta = (maxLat - minLat) * 1.5 || 0.01;
      const lngDelta = (maxLng - minLng) * 1.5 || 0.01;
      
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(0.01, latDelta),
        longitudeDelta: Math.max(0.01, lngDelta)
      };
    } else if (location) {
      return {
        latitude: location.lat,
        longitude: location.long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      };
    } else if (shipperLocation) {
      return {
        latitude: shipperLocation.lat,
        longitude: shipperLocation.long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      };
    } 
    
    return {
      latitude: 21.028511,
      longitude: 105.804817,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1
    };
  };

  // Lấy tuyến đường từ HERE Directions API
  const fetchDirections = async (start: Location, end: Location) => {
    if (!start || !end) {
      console.error('Start or end location is missing');
      return;
    }
    
    setLoadingRoute(true);
    try {
      console.log('Fetching directions from:', start, 'to:', end);
      const result = await getDirections(start, end);
      
      if (result && result.polylinePoints && result.polylinePoints.length > 0) {
        setRouteData({
          distance: result.distance.text,
          duration: result.duration.text,
          coordinates: result.polylinePoints
        });
        console.log('Found route with', result.polylinePoints.length, 'points');
        
        // Điều chỉnh bản đồ để hiển thị toàn bộ tuyến đường
        if (mapRef.current) {
          try {
            setTimeout(() => {
              mapRef.current?.fitToCoordinates(
                result.polylinePoints,
                {
                  edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
                  animated: true
                }
              );
            }, 500);
          } catch (error) {
            console.error('Lỗi khi điều chỉnh bản đồ:', error);
          }
        }
      } else {
        console.log('No route found or route has no points');
        Alert.alert('Thông báo', 'Không thể tìm đường đi đến địa điểm này');
      }
    } catch (error) {
      console.error('Error when fetching directions:', error);
      // Hiển thị thông báo lỗi nhưng không làm crash app
      if (!loadingRoute) {
        // Chỉ hiển thị alert nếu người dùng đang chủ động tìm đường
        // Tránh thông báo liên tục khi đang theo dõi vị trí
        Alert.alert('Lỗi', 'Không thể tìm đường đi. Vui lòng thử lại sau.');
      }
    } finally {
      setLoadingRoute(false);
    }
  };

  // Tìm tuyến đường tối ưu
  const showOptimalRoute = async () => {
    if (!location || !shipperLocation) {
      Alert.alert('Thông báo', 'Không thể tìm đường đi vì thiếu thông tin vị trí');
      return;
    }

    try {
      if (!showRoute) {
        // Bắt đầu tìm tuyến đường
        setShowRoute(true);
        setLoadingRoute(true);
        
        await fetchDirections(shipperLocation, location);
      } else {
        // Tắt hiển thị tuyến đường
        setShowRoute(false);
        setRouteData(null);
      }
    } catch (error) {
      console.error('Lỗi khi tìm tuyến đường:', error);
      Alert.alert('Lỗi', 'Không thể tìm tuyến đường. Vui lòng thử lại sau.');
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-100 mt-7">
      <StyledView className="flex-row items-center justify-between p-4 bg-blue-500">
        <StyledTouchableOpacity 
          className="p-1"
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </StyledTouchableOpacity>
        <StyledText className="text-lg font-bold text-white text-center">
          Tìm kiếm địa điểm
        </StyledText>
        <StyledTouchableOpacity 
          className="p-1"
          onPress={startLocationTracking}
        >
          <MaterialIcons 
            name={isTracking ? "location-disabled" : "my-location"} 
            size={24} 
            color="#fff" 
          />
        </StyledTouchableOpacity>
      </StyledView>

      {shipperLocation && (
        <StyledView className="flex-row items-center bg-blue-50 p-3 border-b border-gray-200">
          <MaterialIcons name="location-on" size={18} color="#3B82F6" />
          <StyledText className="ml-2 text-sm text-gray-600 flex-1">
            Vị trí của bạn: {currentAddress || 'Đang theo dõi'}
            {accuracy !== null && isTracking && ` (±${Math.round(accuracy)}m)`}
          </StyledText>
        </StyledView>
      )}

      <StyledView className="flex-row p-4 mb-2">
        <StyledTextInput
          className="flex-1 h-12 bg-white rounded-lg px-4 text-base shadow-sm"
          placeholder="Nhập địa chỉ đích (vd: 123 Nguyễn Huệ, Quận 1, TP.HCM)"
          value={address}
          onChangeText={setAddress}
        />
        <StyledTouchableOpacity
          className="w-12 h-12 bg-blue-500 rounded-lg ml-2 justify-center items-center"
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialIcons name="search" size={24} color="#fff" />
          )}
        </StyledTouchableOpacity>
      </StyledView>

      <StyledView className="flex-1 mx-4 mb-4">
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
          style={{...StyleSheet.absoluteFillObject, borderRadius: 8}}
          region={getMapRegion()}
          showsUserLocation={isTracking}
          showsMyLocationButton={false}
          followsUserLocation={isTracking}
          showsCompass={true}
          loadingEnabled={true}
          showsTraffic={false}
        >
          {/* Hiển thị tuyến đường chính */}
          {showRoute && routeData && routeData.coordinates.length > 0 && (
            <Polyline
              coordinates={routeData.coordinates}
              strokeWidth={5}
              strokeColor="#3B82F6"
              lineDashPattern={undefined}
              lineJoin="round"
              lineCap="round"
              geodesic={true}
            />
          )}

          {/* Hiển thị marker điểm bắt đầu */}
          {shipperLocation && !isTracking && (
            <Marker
              coordinate={{
                latitude: shipperLocation.lat,
                longitude: shipperLocation.long,
              }}
              title="Vị trí của bạn"
              description={currentAddress}
              pinColor="blue"
            >
              <StyledView className="bg-blue-500 p-2 rounded-full border-2 border-white">
                <MaterialIcons name="directions-car" size={24} color="white" />
              </StyledView>
            </Marker>
          )}
          
          {/* Hiển thị marker điểm đích */}
          {location && (
            <Marker
              coordinate={{
                latitude: location.lat,
                longitude: location.long,
              }}
              title={address || "Điểm đích"}
              description="Địa điểm đích"
              pinColor="red"
            >
              <StyledView className="items-center justify-center">
                <MaterialIcons name="place" size={36} color="#FF3B30" />
              </StyledView>
            </Marker>
          )}

          {/* Hiển thị các điểm trung gian quan trọng trên tuyến đường (nếu có) */}
          {showRoute && routeData && routeData.coordinates.length > 5 && 
            routeData.coordinates
              .filter((_, index) => 
                // Chỉ hiển thị một số điểm trung gian để tránh quá nhiều marker
                index !== 0 && 
                index !== routeData.coordinates.length - 1 && 
                index % Math.max(2, Math.floor(routeData.coordinates.length / 5)) === 0
              )
              .map((coord, index) => (
                <Marker
                  key={`waypoint-${index}`}
                  coordinate={coord}
                  anchor={{x: 0.5, y: 0.5}}
                >
                  <StyledView className="w-2 h-2 bg-blue-500 rounded-full border border-white" />
                </Marker>
              ))
          }
        </MapView>
        
        {location && (
          <StyledView className="absolute bottom-0 left-0 right-0 bg-white rounded-lg p-4 mx-4 my-4 shadow-md">
            <StyledView className="flex-row items-center mb-4">
              <MaterialIcons name="place" size={24} color="#FF3B30" />
              <StyledView className="flex-1 ml-3">
                <StyledText className="text-base font-semibold text-gray-800 mb-1" numberOfLines={1}>
                  {address || "Điểm đích"}
                </StyledText>
                
                {routeData ? (
                  <StyledView className="flex-row items-center">
                    <MaterialIcons name="directions-car" size={16} color="#3B82F6" />
                    <StyledText className="text-sm text-gray-600 ml-1">
                      {routeData.distance} ({routeData.duration})
                    </StyledText>
                  </StyledView>
                ) : distance !== null ? (
                  <StyledView className="flex-row items-center">
                    <MaterialIcons name="timeline" size={16} color="#3B82F6" />
                    <StyledText className="text-sm text-gray-600 ml-1">
                      {distance} km
                    </StyledText>
                  </StyledView>
                ) : null}
              </StyledView>
            </StyledView>
            
            <StyledTouchableOpacity 
              className={`flex-row items-center justify-center p-3 rounded-lg ${
                showRoute 
                  ? 'bg-blue-600' 
                  : loadingRoute 
                    ? 'bg-blue-400' 
                    : 'bg-blue-500'
              }`}
              onPress={showOptimalRoute}
              disabled={loadingRoute}
            >
              {loadingRoute ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialIcons 
                    name="directions" 
                    size={20} 
                    color="#fff" 
                  />
                  <StyledText className="text-white font-bold ml-2">
                    {showRoute ? 'Ẩn đường đi' : 'Hiện tuyến đường'}
                  </StyledText>
                </>
              )}
            </StyledTouchableOpacity>

            {showRoute && routeData && (
              <StyledView className="mt-3">
                <StyledTouchableOpacity 
                  className="flex-row items-center justify-center bg-green-500 p-3 rounded-lg"
                  onPress={() => {
                    if (!isTracking) startLocationTracking();
                    Alert.alert('Thông báo', 'Bắt đầu hành trình! Vị trí của bạn sẽ được theo dõi tự động');
                  }}
                >
                  <MaterialIcons name="play-arrow" size={24} color="#fff" />
                  <StyledText className="text-white font-bold ml-2">Bắt đầu hành trình</StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            )}
          </StyledView>
        )}

        {isTracking && (
          <StyledTouchableOpacity 
            className="absolute top-4 right-4 flex-row items-center bg-red-500 py-2 px-3 rounded-full shadow-md"
            onPress={stopLocationTracking}
          >
            <MaterialIcons name="stop-circle" size={20} color="#fff" />
            <StyledText className="text-white font-bold ml-1 text-xs">Dừng theo dõi</StyledText>
          </StyledTouchableOpacity>
        )}
      </StyledView>
    </StyledSafeAreaView>
  );
};

export default LocationSearch; 