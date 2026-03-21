import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/role-select" />
        <Stack.Screen name="onboarding/profile-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="service-detail" />
        <Stack.Screen name="helper-profile" />
        <Stack.Screen name="ai-assistant" />
        <Stack.Screen name="helper/onboarding" />
        <Stack.Screen name="documents" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="chat/[taskId]" />
        <Stack.Screen name="payment/[taskId]" />
        <Stack.Screen name="task-detail/[taskId]" />
        <Stack.Screen name="my-chats" />
        <Stack.Screen name="payment-history" />
        <Stack.Screen name="settings/security" />
        <Stack.Screen name="settings/language" />
        <Stack.Screen name="settings/help" />
        <Stack.Screen name="settings/terms" />
      </Stack>
    </>
  );
}
