import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { getShipperOrders, updateOrderStatus } from '../../services/shipper.service';
import { useNavigation } from '@react-navigation/native';

interface Order {
  id: number;
  status: string;
  sender: {
    name: string;
    address: string;
  };
  receiver: {
    name: string;
    address: string;
  };
  createdAt: string;
}

export default function ShipperDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchOrders = async () => {
    try {
      const data = await getShipperOrders();
      setOrders(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders(); // Refresh list after update
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
        <Text style={styles.orderStatus}>{item.status}</Text>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.addressSection}>
          <Text style={styles.label}>Người gửi:</Text>
          <Text>{item.sender.name}</Text>
          <Text style={styles.address}>{item.sender.address}</Text>
        </View>

        <View style={styles.addressSection}>
          <Text style={styles.label}>Người nhận:</Text>
          <Text>{item.receiver.name}</Text>
          <Text style={styles.address}>{item.receiver.address}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.button, styles.pickupButton]}
            onPress={() => handleUpdateStatus(item.id, 'picked_up')}
          >
            <Text style={styles.buttonText}>Nhận đơn</Text>
          </TouchableOpacity>
        )}

        {item.status === 'picked_up' && (
          <TouchableOpacity
            style={[styles.button, styles.deliverButton]}
            onPress={() => handleUpdateStatus(item.id, 'delivered')}
          >
            <Text style={styles.buttonText}>Đã giao hàng</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách đơn hàng</Text>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 14,
    color: '#666',
  },
  orderInfo: {
    marginBottom: 12,
  },
  addressSection: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  address: {
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  pickupButton: {
    backgroundColor: '#4CAF50',
  },
  deliverButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});