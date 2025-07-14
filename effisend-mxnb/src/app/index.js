// Basic Imports
import { useNavigation } from "expo-router";
import { useContext, useEffect } from "react";
import { Image, View } from "react-native";
import logoSplash from "../assets/images/splash-iconC.png";
import GlobalStyles from "../core/styles";
import ContextModule from "../providers/contextModule";

export default function SplashLoading() {
  const context = useContext(ContextModule);
  const navigation = useNavigation();

  
    useEffect(() => {
      const update = async () => {
        if (context.value.address === "") {
          navigation.navigate("(screens)/create");
        } else {
          navigation.navigate("(screens)/main");
        }
      };
      context.value.starter && update();
    }, [context.value.address, context.value.starter, navigation.navigate]);
  

  return (
    <View style={[GlobalStyles.container, { justifyContent: "center" }]}>
      <Image
        resizeMode="contain"
        source={logoSplash}
        alt="Main Logo"
        style={{
          width: "70%",
        }}
      />
    </View>
  );
}
