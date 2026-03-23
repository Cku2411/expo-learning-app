import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { COURSE_DATA } from "@/constants/CourseData";
import { SafeAreaView } from "react-native-safe-area-context";

const PracticeScreen = () => {
  // get params
  const { lessonId } = useLocalSearchParams();
  const [isStudyingVocabulary, setIsStudyingVocabulary] = useState(true);

  // get all lessons (if it has review then combined them all)
  const allLessons = COURSE_DATA.chapters.flatMap((chapter) =>
    chapter.review ? [...chapter.lessons, chapter.review] : chapter.lessons,
  );

  const currentLesson = allLessons.find((l) => l.id === lessonId);
  const questions = currentLesson ? currentLesson.questions : [];

  // if don't question the ridirect to lessons
  if (questions.length === 0) {
    return <Redirect href={"/(tab)/lessons"} />;
  }

  if (isStudyingVocabulary) {
    return <SafeAreaView style={styles.container}></SafeAreaView>;
  }

  return (
    <View>
      <Text>{currentLesson?.title}</Text>
    </View>
  );
};

export default PracticeScreen;

// ======= STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
