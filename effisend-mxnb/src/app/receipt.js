import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { logo } from "../assets/images/logo";
import {
  deleteLeadingZeros,
  formatInputText,
  normalizeFontSize,
} from "../core/utils";
import { Fragment } from "react";
import { StyleSheet, Text } from "react-native";
import { View } from "react-native-web";
import { Image } from "expo-image";
import QRCode from "react-native-qrcode-svg";
import { blockchains } from "../core/constants";

export default function Receipt() {
  const glob = useGlobalSearchParams();
  return (
    <Fragment>
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.header}>
          ------------------ • ------------------
        </Text>
        <Text style={styles.header}>
          Date: {new Date().toLocaleDateString()}
        </Text>
        <Text style={styles.header}>
          Type: {glob.kindPayment === 0 ? "QR Code" : "FaceID"}
        </Text>
        <Text style={styles.header}>
          ------------------ • ------------------
        </Text>
        <Text style={styles.header}>Transaction</Text>
        <Text style={styles.header}>
          Amount: {deleteLeadingZeros(formatInputText(glob.amount))} {glob.name}
        </Text>
        <Text style={styles.header}>
          ------------------ • ------------------
        </Text>
        <QRCode
          size={200}
          value={`${blockchains[glob.chain].blockExplorer}tx/${glob.hash}`}
          ecl="L"
        />
      </View>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "30%",
    resizeMode: "contain",
    aspectRatio: 1,
    marginBottom: 20,
  },
  header: {
    fontSize: normalizeFontSize(20),
    fontWeight: "bold",
    marginBottom: 10,
  },
  separator: {
    fontSize: normalizeFontSize(20),
    marginBottom: 10,
    marginTop: 10,
  },
});
