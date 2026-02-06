import { Stack } from 'expo-router';

export default function DoctorDetailLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: '',
        }} 
      />
    </Stack>
  );
}
