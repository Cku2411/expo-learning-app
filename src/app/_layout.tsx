import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  StatusBar,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

import { useAuth } from "@/ctx/AuthContext";
import AppTabs from "@/components/app-tabs";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import IntroScreen from "@/components/auth/IntroScreen";
import AuthProvider from "@/providers/AuthProvider";
import { useDeepLinking } from "@/hooks/useDeepLinking";
import { router, Stack } from "expo-router";

function RootNavigation() {
  const { session, loading, profile } = useAuth();
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useDeepLinking();

  // Redirect to onboarding once fonts + auth are ready
  useEffect(() => {
    if (!fontsLoaded || loading) return;
    router.replace("/onboarding");
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading || fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  // console.log({ session });

  // if (!session) {
  //   return (
  //     <ThemeProvider value={DefaultTheme}>
  //       <GestureHandlerRootView>
  //         <IntroScreen />
  //         <Toaster />
  //       </GestureHandlerRootView>
  //     </ThemeProvider>
  //   );
  // }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tab)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
        <Toaster />
        <StatusBar />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
