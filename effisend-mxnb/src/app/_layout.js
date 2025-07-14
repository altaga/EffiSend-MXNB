import { ContextProvider } from "@/src/providers/contextModule";
import SmartProvider from "@/src/providers/smartProvider";
import {
  Exo2_400Regular,
  Exo2_700Bold,
  useFonts,
} from "@expo-google-fonts/exo-2";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import ContextLoader from "../providers/contextLoader";

import React from "react";

export default function RootLayout() {
  useFonts({
    Exo2_400Regular,
    Exo2_700Bold,
  });
  return (
    <React.Fragment>
      {
        // This provider put a phone frame around the app if the app is running on a desktop
      }
      <SmartProvider>
        {
          // This provider provides the context to the app
        }
        <ContextProvider>
          {
            // This provider provides metamask connectivity
          }
          <ContextLoader />
          <Stack
            initialRouteName="index"
            screenOptions={{
              animation: "simple_push",
              headerShown: false,
            }}
          >
            {
              // Splash Loading Screen
            }
            <Stack.Screen name="index" />
            {
              // Setup Screen
            }
            <Stack.Screen name="(screens)/create" />
            {
              // Main Screen
            }
            <Stack.Screen name="(screens)/main" />
            {
              // Receipt Screen
            }
            <Stack.Screen name="receipt" />
          </Stack>
          <StatusBar style="auto" />
        </ContextProvider>
      </SmartProvider>
    </React.Fragment>
  );
}
