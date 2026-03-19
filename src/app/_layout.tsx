import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import React from "react";
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
import { Stack } from "expo-router";

function TabLayoutNav() {
  const { session, loading, profile } = useAuth();
  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const colorScheme = useColorScheme();

  useDeepLinking();

  if (!loaded || loading) {
    console.log("is loading");

    return (
      <View style={styles.container}>
        <ActivityIndicator size={"large"} color={"white"} />
      </View>
    );
  }

  console.log("loaded! but no users");
  console.log({ session });

  if (!session) {
    return (
      <ThemeProvider value={DefaultTheme}>
        <GestureHandlerRootView>
          <IntroScreen />
          <Toaster />
        </GestureHandlerRootView>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tab)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar />
    </ThemeProvider>
  );
}

export default function TabLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <TabLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadinngContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
