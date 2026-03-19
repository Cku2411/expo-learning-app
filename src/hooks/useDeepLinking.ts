import { supabase } from "@/utils/supabase";
import { getQueryParams } from "expo-auth-session/build/QueryParams";
import { useLinkingURL } from "expo-linking";
import { useEffect } from "react";
import { toast } from "sonner-native";

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = getQueryParams(url);

  if (errorCode) {
    console.error("Deep link error", errorCode);
    throw new Error(errorCode);
  }

  const { access_token, refresh_token } = params;
  if (!access_token) {
    return;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    console.error("Session error", error);
    throw error;
  }

  return data.session;
};

export const useDeepLinking = () => {
  console.log("GO TO DEEPL link");

  const url = useLinkingURL();
  console.log("====================================");
  console.log({ url });
  console.log("====================================");

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url)
        .then((session) => {
          if (session) {
            console.log("Session created from deep link");
          }
        })
        .catch((error) => {
          console.log("Error creating sessiong");
          toast.error("Faild to sign in. Please try again");
        });
    }
  }, [url]);
};
