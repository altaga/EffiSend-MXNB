import { Image, View } from "react-native";
import Renders from "../assets/images/logo.png";
import Title from "../assets/images/title.png";
import GlobalStyles, { header } from "../core/styles";

export default function Header() {
  return (
    <View style={[GlobalStyles.header, { paddingHorizontal: 10 }]}>
      <View style={[GlobalStyles.headerItem, { alignItems: "flex-start" }]}>
        <Image
          source={Renders}
          alt="Logo"
          style={{
            maxHeight: "80%",
            width: "auto",
            resizeMode: "contain",
            aspectRatio: 1,
          }}
        />
      </View>
      <View style={[GlobalStyles.headerItem, { alignItems: "flex-end" }]}>
        <Image
          source={Title}
          alt="Logo"
          style={{
            height: "auto",
            maxWidth: "100%",
            resizeMode: "contain",
            aspectRatio: 1,
          }}
        />
      </View>
    </View>
  );
}
