import { supabase } from "@/utils/supabase";
import { getQueryParams } from "expo-auth-session/build/QueryParams";
import { useLinkingURL } from "expo-linking";
import { useEffect } from "react";
import { toast } from "sonner-native";

const createSessionFromUrl = async (url: string) => {
  // Parse fragment (#access_token=...&refresh_token=...)
  const fragment = url.split("#")[1];
  if (!fragment) return;

  const params = Object.fromEntries(new URLSearchParams(fragment));
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? "",
  });

  if (error) {
    console.error("Session error", error);
    throw error;
  }

  console.log("Session created!", data.session);
  return data.session;
};

export const useDeepLinking = () => {
  console.log("GO TO DEEPL link");

  const url = useLinkingURL();
  console.log("====================================");
  console.log({ url });
  console.log("====================================");

  useEffect(() => {
    console.log("vao day khong nhi");

    if (url) {
      createSessionFromUrl(url)
        .then((session) => {
          if (session) {
            console.log("Session created from deep link");
          }
        })
        .catch((error) => {
          console.log("Error creating sessiong", error);
          // toast.error("Faild to sign in. Please try again");
        });
    }
  }, [url]);
};
