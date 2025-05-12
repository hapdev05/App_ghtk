import axios from 'axios';

// Thay API key của Google Maps bằng API key của HERE Maps
const API_KEY = 'iH79Oa5yjwAgU0hiDV23Ezc3F0rvdF8iZkj92dFa_Jw';

interface Coordinates {
  lat: number;
  long: number;
}

// Định nghĩa các interface cho HERE Routing API
interface HereRoutingResponse {
  routes: HereRoute[];
}

interface HereRoute {
  sections: HereSection[];
}

interface HereSection {
  id: string;
  type: string;
  departure: {
    place: {
      location: {
        lat: number;
        lng: number;
      };
    };
  };
  arrival: {
    place: {
      location: {
        lat: number;
        lng: number;
      };
    };
  };
  polyline: string;
  transport: {
    mode: string;
  };
  summary: {
    duration: number;
    length: number;
  };
}

interface RouteInfo {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  polylinePoints: { latitude: number; longitude: number }[];
}

/**
 * Tính khoảng cách giữa hai điểm (km)
 */
const calculateDistance = (start: Coordinates, end: Coordinates): number => {
  const R = 6371; // Bán kính trái đất tính bằng km
  const dLat = toRad(end.lat - start.lat);
  const dLon = toRad(end.long - start.long);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(start.lat)) * Math.cos(toRad(end.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Làm tròn đến 2 chữ số thập phân
};

/**
 * Chuyển đổi từ độ sang radian
 */
const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

/**
 * Format thời gian lái xe 
 * @param seconds Thời gian tính bằng giây
 * @returns Chuỗi hiển thị thời gian
 */
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }
  
  return `${hours} giờ ${remainingMinutes} phút`;
};

/**
 * Format khoảng cách
 * @param meters Khoảng cách tính bằng mét
 * @returns Chuỗi hiển thị khoảng cách
 */
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters} m`;
  }
  
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
};

/**
 * Tạo tuyến đường mô phỏng với các điểm trung gian giữa hai điểm
 */
const createSimulatedRoute = (
  origin: Coordinates, 
  destination: Coordinates
): RouteInfo => {
  // Tính khoảng cách theo đường chim bay
  const distance = calculateDistance(origin, destination);
  
  // Ước tính thời gian lái xe (giả định tốc độ trung bình 30km/h)
  const durationMinutes = Math.round(distance / 30 * 60);
  
  // Tạo điểm trung gian
  const createIntermediatePoint = (fraction: number) => {
    const lat = origin.lat + (destination.lat - origin.lat) * fraction;
    const lng = origin.long + (destination.long - origin.long) * fraction;
    
    // Thêm độ lệch nhỏ để tạo đường cong
    const offsetLat = (Math.random() - 0.5) * 0.005;
    const offsetLng = (Math.random() - 0.5) * 0.005;
    
    return {
      latitude: lat + offsetLat,
      longitude: lng + offsetLng
    };
  };
  
  // Tạo 8 điểm trung gian
  const points = [
    { latitude: origin.lat, longitude: origin.long },
    ...Array.from({ length: 8 }, (_, i) => createIntermediatePoint((i + 1) / 9)),
    { latitude: destination.lat, longitude: destination.long }
  ];
  
  return {
    distance: {
      text: formatDistance(distance * 1000),
      value: distance * 1000
    },
    duration: {
      text: formatDuration(durationMinutes * 60),
      value: durationMinutes * 60
    },
    polylinePoints: points
  };
};

/**
 * Giải mã Flexible Polyline của HERE Maps
 * Thuật toán dựa trên tài liệu chính thức: https://github.com/heremaps/flexible-polyline
 * @param encoded Chuỗi polyline được mã hóa
 * @returns Mảng các điểm tọa độ
 */
const decodeFlexiblePolyline = (encoded: string): { latitude: number; longitude: number }[] => {
  if (!encoded || encoded.length === 0) {
    return [];
  }

  try {
    // Bảng chữ cái 64 ký tự sử dụng cho mã hóa
    const DECODING_TABLE: number[] = [];
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
      .split("")
      .forEach((char, index) => {
        DECODING_TABLE[char.charCodeAt(0)] = index;
      });

    let index = 0;

    // Đọc phiên bản (header version)
    const headerVersion = decodeUnsignedValue();
    if (headerVersion !== 1) {
      console.warn(`Unsupported polyline version: ${headerVersion}`);
    }

    // Đọc nội dung header
    const headerContent = decodeUnsignedValue();
    
    // Trích xuất precision (độ chính xác) cho lat/lng
    const precision = headerContent & 0xF;
    const factor = Math.pow(10, precision);

    // Trích xuất thông tin về chiều thứ 3 (nếu có)
    const thirdDimFlag = (headerContent >> 4) & 0x7;
    const thirdDimPrecision = (headerContent >> 7) & 0xF;
    
    // Chúng ta chỉ quan tâm đến lat/long, bỏ qua chiều thứ 3
    
    const result: { latitude: number; longitude: number }[] = [];
    let lat = 0;
    let lng = 0;

    // Đọc tất cả các điểm tọa độ
    while (index < encoded.length) {
      // Đọc delta của latitude
      const deltaLat = decodeSignedValue();
      lat += deltaLat;
      
      // Đọc delta của longitude
      const deltaLng = decodeSignedValue();
      lng += deltaLng;
      
      // Thêm điểm vào kết quả
      result.push({
        latitude: lat / factor,
        longitude: lng / factor
      });

      // Nếu có chiều thứ 3, đọc nhưng bỏ qua giá trị
      if (thirdDimFlag !== 0) {
        decodeSignedValue();
      }
    }

    return result;

    // Hàm giải mã giá trị không dấu
    function decodeUnsignedValue(): number {
      let result = 0;
      let shift = 0;

      while (index < encoded.length) {
        const b = DECODING_TABLE[encoded.charCodeAt(index++)];
        result |= (b & 0x1F) << shift;
        
        if ((b & 0x20) === 0) {
          return result;
        }
        
        shift += 5;
      }

      return result;
    }

    // Hàm giải mã giá trị có dấu
    function decodeSignedValue(): number {
      const result = decodeUnsignedValue();
      return (result & 1) === 1 ? ~(result >> 1) : (result >> 1);
    }
  } catch (error) {
    console.error('Error decoding flexible polyline:', error);
    return [];
  }
};

/**
 * Trích xuất tọa độ từ shape (polyline) của HERE API
 */
const extractCoordinatesFromShape = (
  origin: Coordinates,
  destination: Coordinates,
  section: HereSection
): { latitude: number; longitude: number }[] => {
  const waypoints: { latitude: number; longitude: number }[] = [];
  
  // Trường hợp đặc biệt: nếu không có polyline, trả về các điểm đầu và cuối
  if (!section.polyline) {
    // Thêm điểm đầu từ section nếu có, nếu không sử dụng origin
    if (section.departure && section.departure.place && section.departure.place.location) {
      waypoints.push({
        latitude: section.departure.place.location.lat,
        longitude: section.departure.place.location.lng
      });
    } else {
      waypoints.push({ latitude: origin.lat, longitude: origin.long });
    }

    // Thêm điểm cuối từ section nếu có, nếu không sử dụng destination
    if (section.arrival && section.arrival.place && section.arrival.place.location) {
      waypoints.push({
        latitude: section.arrival.place.location.lat,
        longitude: section.arrival.place.location.lng
      });
    } else {
      waypoints.push({ latitude: destination.lat, longitude: destination.long });
    }

    return waypoints;
  }

  // Sử dụng hàm giải mã polyline để lấy danh sách tọa độ
  const polylinePoints = decodeFlexiblePolyline(section.polyline);
  
  // Nếu giải mã thành công, trả về danh sách các điểm
  if (polylinePoints && polylinePoints.length > 0) {
    return polylinePoints;
  }
  
  // Phương pháp dự phòng: nếu giải mã thất bại, tạo đường thẳng với một số điểm trung gian
  console.warn('Polyline decoding failed, using fallback method');
  
  // Thêm điểm bắt đầu
  if (section.departure && section.departure.place && section.departure.place.location) {
    waypoints.push({
      latitude: section.departure.place.location.lat,
      longitude: section.departure.place.location.lng
    });
  } else {
    waypoints.push({ latitude: origin.lat, longitude: origin.long });
  }
  
  // Lấy điểm cuối
  const endPoint = section.arrival && section.arrival.place && section.arrival.place.location
    ? {
        latitude: section.arrival.place.location.lat,
        longitude: section.arrival.place.location.lng
      }
    : { latitude: destination.lat, longitude: destination.long };
  
  // Tạo 8 điểm trung gian
  for (let i = 1; i <= 8; i++) {
    const fraction = i / 9;
    const startPoint = waypoints[0];
    
    const lat = startPoint.latitude + (endPoint.latitude - startPoint.latitude) * fraction;
    const lng = startPoint.longitude + (endPoint.longitude - startPoint.longitude) * fraction;
    
    waypoints.push({
      latitude: lat,
      longitude: lng
    });
  }
  
  // Thêm điểm kết thúc
  waypoints.push(endPoint);
  
  return waypoints;
};

/**
 * Lấy tuyến đường từ HERE Routing API
 * @param origin Điểm xuất phát
 * @param destination Điểm đến
 * @returns Thông tin tuyến đường
 */
export const getDirections = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteInfo> => {
  try {
    // Trường hợp origin hoặc destination là null/undefined, trả về tuyến đường mô phỏng
    if (!origin || !destination) {
      console.error('Missing origin or destination coordinates');
      return createSimulatedRoute(
        origin || { lat: 0, long: 0 }, 
        destination || { lat: 0, long: 0 }
      );
    }

    // URL API của HERE Maps Routing API với tham số để lấy tuyến đường chính
    // returnType=polyline để lấy tất cả điểm tọa độ tuyến đường
    // spans=routeCondition để xác định các đoạn tuyến đường khác nhau
    const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${origin.lat},${origin.long}&destination=${destination.lat},${destination.long}&return=polyline,turnByTurnActions,actions,instructions,summary&routingMode=fast&apikey=${API_KEY}`;

    console.log(`Fetching route from HERE API: ${origin.lat},${origin.long} to ${destination.lat},${destination.long}`);
    
    const response = await axios.get<HereRoutingResponse>(url, {
      timeout: 15000 // Tăng timeout lên 15 giây để xử lý các tuyến đường phức tạp
    });
    
    if (!response.data || !response.data.routes || response.data.routes.length === 0) {
      console.error('HERE Routing API error: No routes found');
      return createSimulatedRoute(origin, destination);
    }

    const route = response.data.routes[0];
    if (!route.sections || route.sections.length === 0) {
      console.error('HERE Routing API error: No sections found');
      return createSimulatedRoute(origin, destination);
    }

    console.log('Route data from HERE API:', JSON.stringify(route, null, 2).substring(0, 500) + '...');

    // Lấy tất cả các điểm từ tất cả các sections để tạo tuyến đường hoàn chỉnh
    let totalDistance = 0;
    let totalDuration = 0;
    let allWaypoints: { latitude: number; longitude: number }[] = [];

    for (const section of route.sections) {
      if (!section || !section.polyline) {
        console.warn('Section has no polyline, skipping');
        continue;
      }

      // Lấy thông tin tổng quát
      if (section.summary) {
        totalDistance += section.summary.length || 0;
        totalDuration += section.summary.duration || 0;
      }

      // Lấy các điểm tọa độ từ polyline
      try {
        // Phương pháp triển khai thủ công để trích xuất các điểm từ polyline
        // Phương pháp này đơn giản hóa, không sử dụng thuật toán giải mã chính xác
        const coordinates = extractCoordinatesFromShape(
          origin, 
          destination, 
          section
        );
        
        if (coordinates && coordinates.length > 0) {
          allWaypoints = allWaypoints.concat(coordinates);
        }
      } catch (e) {
        console.error('Error extracting coordinates from polyline:', e);
      }
    }

    // Nếu không lấy được tọa độ nào, sử dụng phương pháp mô phỏng
    if (allWaypoints.length === 0) {
      console.error('Failed to extract coordinates from polyline, using simulated route');
      return createSimulatedRoute(origin, destination);
    }

    // Đảm bảo có ít nhất điểm bắt đầu và kết thúc
    if (allWaypoints.length < 2) {
      allWaypoints = [
        { latitude: origin.lat, longitude: origin.long },
        { latitude: destination.lat, longitude: destination.long }
      ];
    }
    
    return {
      distance: {
        text: formatDistance(totalDistance),
        value: totalDistance
      },
      duration: {
        text: formatDuration(totalDuration),
        value: totalDuration
      },
      polylinePoints: allWaypoints
    };
  } catch (error) {
    console.error('Error fetching directions from HERE API:', error);
    // Sử dụng tuyến đường mô phỏng khi có lỗi xảy ra
    console.log('Sử dụng tuyến đường mô phỏng thay thế do lỗi kết nối');
    return createSimulatedRoute(origin, destination);
  }
}; 