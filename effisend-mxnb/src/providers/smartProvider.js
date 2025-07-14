import frame from "@/src/assets/images/frame.png";
import React, { useState } from "react";
import { Dimensions, Image, Platform, View } from "react-native";
import ToastManager from "toastify-react-native";

export default function SmartProvider({ children }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ratio =
    Dimensions.get("window").height / Dimensions.get("window").width;
  return Platform.OS === "web" && ratio < 1 ? (
    <React.Fragment>
      <Image
        source={frame}
        style={{
          width: "auto",
          height: Dimensions.get("window").height,
          resizeMode: "contain",
          backgroundColor: "black",
        }}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setSize({ width, height });
        }}
      />
      <View
        style={{
          position: "absolute",
          width: `100%`,
          height: `100%`,
          alignSelf: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: size.height / 2.3179,
            height: "76.68%",
            alignSelf: "center",
            justifyContent: "center",
          }}
        >
          {children}
          <ToastManager style={{ width: size.height / 2.3179 }} />
        </View>
      </View>
    </React.Fragment>
  ) : (
    <React.Fragment>
      {children}
      <ToastManager />
    </React.Fragment>
  );
}
