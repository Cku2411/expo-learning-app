import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import React from "react";

const TabLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="Modal" options={{ title: "Modal" }} />
      <Tabs.Screen name="Onboarding" options={{ title: "Onboarding" }} />
    </Tabs>
  );
};

export default TabLayout;
