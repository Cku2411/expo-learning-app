import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ToastAndroid,
} from "react-native";
import React, { useState } from "react";
import Animated from "react-native-reanimated";
import Entypo from "@expo/vector-icons/Entypo";
import { toast } from "sonner-native";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/utils/supabase";

type Props = {
  onBack: () => void;
  menuContentAnimatedStyle: any;
};

const redirectTo = makeRedirectUri();
console.log({ redirectTo });

const EmailAuth = ({ onBack, menuContentAnimatedStyle }: Props) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const signInWithEmail = async () => {
    if (!email) {
      console.log("Erro");
      // ToastAndroid.show("noo email provided", ToastAndroid.SHORT);
      toast.error("no email");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) {
        toast.error(error.message);
        throw error;
      } else {
        toast.success("Check your email for the login link");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.viewContainer, menuContentAnimatedStyle]}>
      <View style={styles.emailHeader}>
        <Pressable onPress={onBack}>
          <Entypo name="chevron-thin-left" size={19} color="white" />
        </Pressable>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.emailMainTitle}>Enter your email address.</Text>
        <Text style={styles.emailSubtitle}>
          We will send you magic link to sign in
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.emailTextInput}
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <Pressable
          style={[styles.verificationButton, loading && styles.buttonDisabled]}
          onPress={() => {
            signInWithEmail();
          }}
        >
          <Text style={styles.verificationButtonText}>
            {loading ? "Sending.. " : "Send Magic Link"}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default EmailAuth;

// STYLES
const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  placeholder: {
    width: 40,
  },
  titleContainer: {
    marginBottom: 20,
  },
  emailMainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    lineHeight: 34,
  },
  emailSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  emailTextInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "white",
    minHeight: 52,
  },
  verificationButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: 10,
  },
  verificationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
