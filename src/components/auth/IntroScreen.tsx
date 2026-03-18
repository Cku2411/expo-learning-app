import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Dimensions, Text, View } from "react-native";
import { verticalScale } from "react-native-size-matters";
import { useVideoPlayer, VideoView } from "expo-video";
import { useFonts } from "expo-font";
import { EBGaramond_500Medium_Italic } from "@expo-google-fonts/eb-garamond";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "@/constants/theme";

// === VARIABLE ==
const { width, height } = Dimensions.get("window");
const videoSource = require("../../../assets/videos/broll.mp4");
const MENU_HEIGHT = 250;

const MAIN_TEXTWORD: string[] = ["Learn", "Mandarin", "the", "right", "way"];
const SCRIPT_PHRASES: string[] = [
  "Speaking",
  "Listening",
  "Practising",
  "Conversing",
];

// == MAIN COMPONENTS ==
const IntroScreen = () => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [fontsLoaded] = useFonts({ EBGaramond_500Medium_Italic });

  // ref to track mounted state and pending timeouts
  const isMounted = useRef(true);
  const innerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scriptTextOpacity = useSharedValue(0);
  const mainTextOpacity = useSharedValue(0);

  // FIX 1: PLayer is trigger one in useEffect
  const player = useVideoPlayer(videoSource, (player) => {
    player.muted = true;
    player.loop = true;
    player.play();
  });

  // ANIMATED STYLES ==

  const mainTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: mainTextOpacity.value,
    transform: [
      {
        translateY: interpolate(
          mainTextOpacity.value,
          [0, 1],
          [30, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const scriptTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scriptTextOpacity.value,
    transform: [
      {
        translateY: interpolate(
          scriptTextOpacity.value,
          [0, 1],
          [20, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  // == ANIMATE HELPER ===

  const animateTextIn = () => {
    // hien main text trong vong 1,2s, script text delay 0,8s va hien trong 0.8s
    mainTextOpacity.value = withTiming(1, { duration: 1200 });
    scriptTextOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
  };

  const animateScriptOut = () => {
    scriptTextOpacity.value = withTiming(0, { duration: 500 });
  };

  const animateScriptIn = () => {
    scriptTextOpacity.value = withTiming(1, { duration: 600 });
  };

  //  ==== PHARSE CYCLING LOGIC ===

  const scheduleNextPhase = () => {
    loopTimeoutRef.current = setTimeout(() => {
      if (!isMounted.current) return;

      animateScriptOut();

      innerTimeoutRef.current = setTimeout(() => {
        if (!isMounted.current) return;

        setCurrentPhaseIndex((prev) => {
          const next = (prev + 1) % SCRIPT_PHRASES.length;
          return next;
        });
      }, 500);
    }, 3500);
  };

  useEffect(() => {
    isMounted.current = true;
    player.play();

    // Small delay before first text animation so layout is settled

    const introTimeout = setTimeout(() => {
      if (!isMounted.current) return;
      animateTextIn();
      // Start cycling after the intro animation settles
      scheduleNextPhase();
    }, 300);

    // clearn up
    return () => {
      // unmount
      isMounted.current = false;
      clearTimeout(introTimeout);
      if (innerTimeoutRef.current) clearTimeout(innerTimeoutRef.current);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    };
  }, []);

  // Animate new pharse in whenever index changes
  useEffect(() => {
    if (currentPhaseIndex === 0) return; // skip initial mount
    const time = setTimeout(() => {
      if (!isMounted.current) return;
      animateScriptIn();
    }, 150);

    // Schedule the next cycle after this phrase is shown
    scheduleNextPhase();

    return () => clearTimeout(time);
  }, [currentPhaseIndex]);

  // ===== MAIN RETURN===
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <VideoView
        nativeControls={false}
        player={player}
        contentFit="cover"
        style={[StyleSheet.absoluteFill]}
      />

      {/* Overlay */}

      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0,0,0,0.4)", zIndex: 20 },
        ]}
      />

      {/* Hero Text Section */}
      {fontsLoaded && (
        <View style={styles.heroTextContainer}>
          {/*  MAIN TEXT */}
          <Animated.View
            style={[styles.mainTextContainer, mainTextAnimatedStyle]}
          >
            <Text style={styles.heroTextMain}>{MAIN_TEXTWORD.join(" ")}</Text>
          </Animated.View>

          {/*  SCRIPT TEXT */}

          <Animated.View
            style={[styles.mainTextContainer, scriptTextAnimatedStyle]}
          >
            <Text style={styles.heroTextScript}>
              {SCRIPT_PHRASES[currentPhaseIndex]}
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: MENU_HEIGHT + 100,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 30,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 2,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 30,
  },
  viewContainer: {
    flex: 1,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 5,
    borderRadius: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  statsContainer: {
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  buttonsContainer: {
    gap: 16,
  },
  loginButton: {
    backgroundColor: "rgba(60, 60, 67, 0.8)",
    borderColor: "rgba(120, 120, 128, 0.4)",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  appleIcon: {
    marginRight: 12,
  },
  googleIcon: {
    marginRight: 12,
  },
  emailIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  heroTextContainer: {
    position: "absolute",
    top: height * 0.15,
    left: 30,
    right: 30,
    zIndex: 25,
  },
  mainTextContainer: {
    marginBottom: 0,
  },
  heroTextMain: {
    fontSize: verticalScale(45),
    fontWeight: "800",
    fontFamily: "System",
    color: "#fff4cc",
    lineHeight: verticalScale(50),
    letterSpacing: 0,
  },
  heroTextScript: {
    fontSize: verticalScale(55),
    fontFamily: "EBGaramond_500Medium_Italic",
    color: Colors.primaryAccentColor,
    letterSpacing: 0.5,
  },
});
