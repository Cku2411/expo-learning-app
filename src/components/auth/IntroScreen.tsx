import React, { useEffect, useRef, useState } from "react";
import { verticalScale } from "react-native-size-matters";
import { useVideoPlayer, VideoView } from "expo-video";
import { useFonts } from "expo-font";
import { EBGaramond_500Medium_Italic } from "@expo-google-fonts/eb-garamond";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  Keyboard,
  Platform,
  Pressable,
  Image,
} from "react-native";

import { Colors } from "@/constants/theme";

// === VARIABLE ==
const { width, height } = Dimensions.get("window");
const videoSource = require("@/assets/videos/broll.mp4");
const logoSource = require("@/assets/images/convo-minimal.png");
const MENU_HEIGHT = 250;
const PEEK_MENU_HEIGHT = 50;
const CLOSED_POSITION = MENU_HEIGHT - PEEK_MENU_HEIGHT;

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"login" | "email">("login");
  const [fontsLoaded] = useFonts({ EBGaramond_500Medium_Italic });

  // ref to track mounted state and pending timeouts
  const isMounted = useRef(true);
  const phaseIndexRef = useRef(0);
  const innerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const insets = useSafeAreaInsets();

  const scriptTextOpacity = useSharedValue(0);
  const mainTextOpacity = useSharedValue(0);
  const menuTranslateY = useSharedValue(CLOSED_POSITION);
  const menuContentOpacity = useSharedValue(1);

  const dynamicMenuHeight =
    keyboardHeight > 0 ? MENU_HEIGHT + keyboardHeight + 50 : MENU_HEIGHT + 100;

  // FIX 1: PLayer is trigger one in useEffect
  const player = useVideoPlayer(videoSource, (player) => {
    player.muted = true;
    player.loop = true;
    // player.play();
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

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: menuTranslateY.value }],
  }));

  const menuContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuContentOpacity.value,
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

  const animateMenu = (open: boolean) => {
    menuTranslateY.value = withSpring(open ? 0 : CLOSED_POSITION, {
      damping: 30,
      stiffness: 200,
      mass: 1,
    });
  };

  const handlePress = () => {
    setIsMenuOpen((prev) => !prev);
    animateMenu(!isMenuOpen);
  };

  const renderLoginView = () => {
    return (
      <Animated.View style={[styles.viewContainer, menuContentAnimatedStyle]}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image source={logoSource} style={styles.logo} />
            <Text style={styles.appName}>Vivi</Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.rating}>Start today</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Pressable
            style={styles.loginButton}
            onPress={() => {
              console.log("android login");
            }}
          >
            <AntDesign
              name="android"
              size={16}
              color="white"
              style={styles.appleIcon}
            />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </Pressable>

          <Pressable
            style={styles.loginButton}
            onPress={() => {
              console.log("android login");
            }}
          >
            <AntDesign
              name="apple"
              size={16}
              color="white"
              style={styles.appleIcon}
            />
            <Text style={styles.buttonText}>Continue with Apple</Text>
          </Pressable>

          <Pressable
            style={styles.loginButton}
            onPress={() => {
              console.log("android login");
            }}
          >
            <Fontisto
              name="email"
              size={16}
              color="white"
              style={styles.emailIcon}
            />
            <Text style={styles.buttonText}>Continue with Email</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  // === PHRASE CYCLING ===
  // Self-scheduling recursive setTimeout — no double-scheduling, no race conditions.
  // phaseIndexRef tracks the index without triggering re-renders inside the loop.
  const startCycle = () => {
    const cycle = () => {
      setTimeout(() => {
        if (!isMounted.current) return;

        // 1. Fade out current phrase
        scriptTextOpacity.value = withTiming(0, { duration: 500 });

        setTimeout(() => {
          if (!isMounted.current) return;

          // 2. Advance index and update state (triggers re-render with new phrase text)
          phaseIndexRef.current =
            (phaseIndexRef.current + 1) % SCRIPT_PHRASES.length;
          setCurrentPhaseIndex(phaseIndexRef.current);

          setTimeout(() => {
            if (!isMounted.current) return;

            // 3. Fade in new phrase
            scriptTextOpacity.value = withTiming(1, { duration: 600 });

            // 4. Schedule the next cycle
            cycle();
          }, 150); // small delay for state to flush before animating in
        }, 500); // wait for fade-out to finish
      }, 3500); // display duration per phrase
    };

    cycle();
  };

  useEffect(() => {
    isMounted.current = true;
    player.play();

    const introTimeout = setTimeout(() => {
      if (!isMounted.current) return;

      // Fade in main text, then script text with a delay
      mainTextOpacity.value = withTiming(1, { duration: 1200 });
      scriptTextOpacity.value = withDelay(
        800,
        withTiming(1, { duration: 800 }),
      );

      // Start cycling after the intro animation completes (~1600ms total)
      const cycleStartTimeout = setTimeout(() => {
        if (!isMounted.current) return;
        startCycle();
      }, 1600);

      return () => clearTimeout(cycleStartTimeout);
    }, 300);

    return () => {
      isMounted.current = false;
      clearTimeout(introTimeout);
    };
  }, []);

  useEffect(() => {
    const keyboardWillSHowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    return () => {
      keyboardWillSHowListener.remove();
      keyboardWillHideListener.remove();
    };
  });

  // ===== MAIN RETURN===
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <VideoView
        nativeControls={false}
        player={player}
        contentFit="cover"
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
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

      {/* // slindign menu with dynamic height */}
      <Animated.View
        style={[
          styles.menuContainer,
          menuAnimatedStyle,
          { height: dynamicMenuHeight, paddingBottom: insets.bottom + 30 },
        ]}
      >
        <Pressable style={styles.handleContainer} onPress={handlePress}>
          <View style={styles.handle}></View>
        </Pressable>

        <View style={styles.menuContent}>
          {currentView === "login" ? renderLoginView() : null}
        </View>
      </Animated.View>
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
