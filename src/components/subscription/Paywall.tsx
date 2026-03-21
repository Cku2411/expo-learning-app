import { View, Text } from "react-native";
import React from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const Paywall = ({ visible, onClose }: Props) => {
  return (
    <View>
      <Text>Paywall</Text>
    </View>
  );
};

export default Paywall;
