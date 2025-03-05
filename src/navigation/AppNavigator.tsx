import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Page/HomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterSreen';
import IntroScreen from '../screens/Page/IntroScreen';
import ForgotPassword from '../screens/auth/ForgotPassword';
import ResetPassword from '../screens/auth/ResetPassword';
import AdminDashboard from '../screens/Page/Admin/AdminDashboard';
import ShipperDashboard from '../screens/Page/Shipper/ShipperDashboard';
import CustomerHome from '../screens/Page/Customer/CustomerHome';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Intro">
        <Stack.Screen 
          name="Intro" 
          component={IntroScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Forgot"
          component={ForgotPassword}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name='ResetPassword'
          component={ResetPassword}
          options={{headerShown:false}}
        />
        <Stack.Screen
          name='AdminDashboard'
          component={AdminDashboard}
          options={{headerShown:false}}
        />
        <Stack.Screen
          name='ShipperDashboard'
          component={ShipperDashboard}
          options={{headerShown:false}}
        />
        <Stack.Screen
          name='CustomerHome'
          component={CustomerHome}
          options={{headerShown:false}}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}