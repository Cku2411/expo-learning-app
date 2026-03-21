import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Text,
  ScrollView,
} from "react-native";
import React, { use, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/ctx/AuthContext";
import { toast } from "sonner-native";
import Paywall from "@/components/subscription/Paywall";

// Constants ==

const LEVELS = [
  {
    id: "beginner",
    title: "Beginner",
    description: "I know a few words or nothing at all.",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "I can have basic conversations.",
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "I can express myself fluently.",
  },
];

const MOTIVATIONS: {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: "travel",
    title: "Travel",
    icon: "airplane-outline",
  },
  {
    id: "work",
    title: "Work",
    icon: "briefcase-outline",
  },
  {
    id: "family",
    title: "Family",
    icon: "people-outline",
  },
  {
    id: "culture",
    title: "Culture",
    icon: "book-outline",
  },
  {
    id: "hobby",
    title: "Hobby",
    icon: "game-controller-outline",
  },
];

const INTERESTS = [
  "Food & Dining",
  "Business",
  "Daily Life",
  "Technology",
  "Art",
  "Music",
  "Politics",
  "Sports",
];

//  Main components

const Onboarding = () => {
  const colors = Colors["light"];

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<string | null>(null);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);

  const { refreshProfile } = useAuth();

  // === Helper functio ===
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const isNextEnabled = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return !!level;
    if (step === 2) return motivations.length > 0;
    if (step === 3) return selectedInterests.length > 0;
    return false;
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // TODO : Save profile
      saveProfile();
    }
  };

  const toggleMotivation = (id: string) => {
    if (motivations.includes(id)) {
      // remove id
      setMotivations(motivations.filter((m) => m !== id));
    } else {
      // add id
      setMotivations([...motivations, id]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((elv) => elv !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const saveProfile = async () => {
    console.log("====================================");
    console.log("Save to supabase..");
    console.log("====================================");

    setShowPaywall(true);

    // try {
    //   const {
    //     data: { user },
    //   } = await supabase.auth.getUser();

    //   if (!user) throw new Error("No User found");

    //   // updaet user profile
    //   const { error } = await supabase.from("profile").upsert({
    //     id: user.id,
    //     full_name: name,
    //     chinese_level: level,
    //     motivations: motivations,
    //     interests: selectedInterests,
    //     onboarding_completed: true, //mark true
    //     updated_at: new Date().toISOString(),
    //   });

    //   if (error) throw error;
    //   // refresh to update profile
    //   await refreshProfile();

    //   // show the paywall
    //   setShowPaywall(true);
    // } catch (error) {
    //   console.error("Error saving profile:", error);
    //   toast.error("Failed to save your profile. Plase try again.");
    // }
  };
  // == RENDER STEP ===

  const renderStep0Name = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText style={styles.title} type="title">
          What should we call you?
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Your name will be used to personalize your lessons.
        </ThemedText>

        <TextInput
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.icon },
          ]}
          placeholder="Your name"
          placeholderTextColor={"#9CA3AF"}
          onChangeText={setName}
          autoFocus
          value={name}
        />
      </View>
    );
  };
  const renderStep1Level = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText style={styles.title} type="title">
          Hi <Text style={{ color: Colors.primaryAccentColor }}>{name}</Text>,
          How much Chinese do you know?
        </ThemedText>
        <ThemedText style={styles.subtitle}>Show me your strength</ThemedText>

        <ScrollView
          contentContainerStyle={{ rowGap: 16 }}
          style={{ marginTop: 20 }}
        >
          {LEVELS.map((lvl) => (
            <TouchableOpacity
              key={lvl.id}
              style={[
                styles.optionCard,
                level === lvl.id && {
                  borderColor: Colors.primaryAccentColor,
                  backgroundColor: "#fff5f0",
                },
              ]}
              onPress={() => setLevel(lvl.id)}
            >
              <ThemedText
                style={[
                  styles.optionTitle,
                  level === lvl.id && {
                    color: Colors.primaryAccentColor,
                  },
                ]}
              >
                {lvl.title}
              </ThemedText>

              <ThemedText style={[styles.optionDescription]}>
                {lvl.description}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderStep2Motivation = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText style={styles.title} type="title">
          What is your motivations?
        </ThemedText>
        <ThemedText style={styles.subtitle}>You can choose multiple</ThemedText>

        <ScrollView
          contentContainerStyle={{ rowGap: 16 }}
          style={{ marginTop: 20 }}
        >
          {MOTIVATIONS.map((motivate) => {
            const isMotivateSelected = motivations.includes(motivate.id);
            return (
              <TouchableOpacity
                key={motivate.id}
                style={[
                  styles.optionCard,
                  styles.motivationCard,
                  isMotivateSelected && {
                    borderColor: Colors.primaryAccentColor,
                    backgroundColor: "#fff5f0",
                  },
                ]}
                onPress={() => toggleMotivation(motivate.id)}
              >
                <Ionicons
                  name={motivate.icon}
                  size={24}
                  color={
                    isMotivateSelected ? Colors.primaryAccentColor : colors.icon
                  }
                />
                <ThemedText
                  style={[
                    styles.optionTitle,
                    isMotivateSelected && {
                      color: Colors.primaryAccentColor,
                    },
                  ]}
                >
                  {motivate.title}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderStep3Interests = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText style={styles.title} type="title">
          What are you interested in?
        </ThemedText>
        <ThemedText style={styles.subtitle}>You can choose multiple</ThemedText>

        <View style={[styles.tagsContainer, { marginTop: 20 }]}>
          {INTERESTS.map((interest) => {
            const isInterestselected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.tag,
                  isInterestselected && {
                    backgroundColor: Colors.primaryAccentColor,
                    borderColor: Colors.primaryAccentColor,
                  },
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <ThemedText
                  style={[
                    styles.tagText,
                    isInterestselected && {
                      color: "white",
                    },
                  ]}
                >
                  {interest}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // ===== MAIN RETURN ====
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header = status bar */}
        <View style={styles.header}>
          {step > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          )}

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${((step + 1) / 4) * 100}%`,
                  backgroundColor: Colors.primaryAccentColor,
                },
              ]}
            ></View>
          </View>
        </View>

        {/* step content */}
        <View style={styles.mainContent}>
          <Animated.View
            key={step}
            entering={FadeIn}
            exiting={FadeOut}
            style={{ flex: 1 }}
          >
            {step === 0 && renderStep0Name()}
            {step === 1 && renderStep1Level()}
            {step === 2 && renderStep2Motivation()}
            {step === 3 && renderStep3Interests()}
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: isNextEnabled()
                  ? Colors.primaryAccentColor
                  : "#E5E7EB",
              },
            ]}
            onPress={() => handleContinue()}
            disabled={!isNextEnabled()}
          >
            <ThemedText style={styles.continueButtonText}>
              {step === 3 ? "Get started" : `Continue (${step + 1}/4)`}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Paywall
        visible={showPaywall}
        onClose={() => router.replace("/(tab)/explore")}
      />
    </SafeAreaView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
  },
  backButton: {
    marginRight: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  mainContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.subduedTextColor,
    marginBottom: 32,
  },
  input: {
    fontSize: 20,
    borderBottomWidth: 2,
    paddingVertical: 12,
    marginTop: 20,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  motivationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.subduedTextColor,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  tag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    width: "100%",
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
