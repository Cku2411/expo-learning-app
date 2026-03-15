import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";

import { useFonts } from "expo-font";
import AuthProvider from "@/providers/AuthProvider";
import { useAuth } from "@/ctx/AuthContext";

function TabLayoutNav() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const colorScheme = useColorScheme();

  const { session, loading, profile } = useAuth();

  if (!loaded || loading) {
    console.log("is loading");

    return (
      <View>
        <ActivityIndicator size={"large"} color={"white"} />
      </View>
    );
  }

  console.log("loaded!");

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </AuthProvider>
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
