import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { forwardGeoCode } from '../../../services/geocoding.service';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

interface Location {
  lat: number;
  long: number;
}

const LocationSearch = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const navigation = useNavigation();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Tìm kiếm địa điểm</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập địa chỉ (vd: 123 Nguyễn Huệ, Quận 1, TP.HCM)"
          value={address}
          onChangeText={setAddress}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialIcons name="search" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {location ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Tọa độ: {location.lat}, {location.long}</Text>
          
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.lat,
              longitude: location.long,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.lat,
                longitude: location.long,
              }}
              title={address}
            />
          </MapView>
          
          <TouchableOpacity style={styles.directionButton}>
            <MaterialIcons name="directions" size={20} color="#fff" />
            <Text style={styles.directionButtonText}>Chỉ đường</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="location-searching" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            Nhập địa chỉ và tìm kiếm để hiển thị tọa độ và bản đồ
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#3B82F6',
  },
  backButton: {
    padding: 4,
  },
  rightPlaceholder: {
    width: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '600',
  },
  map: {
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
  },
  directionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
});

export default LocationSearch; 