import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View)
const StyledText = styled(Text)

export default function App() {
  return (
    <StyledView className="flex-1 items-center justify-center bg-white">
      <StyledText className="text-xl font-bold text-red-600">NativeWind is now installed!</StyledText>
      <StatusBar style="auto" />
    </StyledView>
  );
}
