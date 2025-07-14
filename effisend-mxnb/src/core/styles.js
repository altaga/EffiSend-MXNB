import {
  Dimensions,
  PixelRatio,
  Platform,
  StatusBar,
  StyleSheet,
} from "react-native";

const normalizeFontSize = (size) => {
  let { width, height } = Dimensions.get("window");
  if (Platform.OS === "web" && height / width < 1) {
    width /= 2.3179;
    height *= 0.7668;
  }
  const scale = Math.min(width / 375, height / 667); // Based on a standard screen size
  return PixelRatio.roundToNearestPixel(size * scale);
};

export const screenHeight = Dimensions.get("screen").height;
export const windowHeight = Dimensions.get("window").height;
export const mainColor = "#4286F5";
export const secondaryColor = "#F5B142";
export const tertiaryColor = "#F542DF";
export const quaternaryColor = "#42F557";
export const backgroundColor = "#000000";

export const header = 70;
export const footer = 60;
export const ratio =
  Dimensions.get("window").height / Dimensions.get("window").width;
export const main =
  Dimensions.get("window").height -
  (header + footer + (ratio > 1.7 ? 0 : StatusBar.currentHeight));
export const StatusBarHeight = StatusBar.currentHeight;
export const NavigatorBarHeight = screenHeight - windowHeight;
export const iconSize = normalizeFontSize(24);
export const roundButtonSize = normalizeFontSize(24);

const GlobalStyles = StyleSheet.create({
  // Globals Layout
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor,
  },
  scrollContainer: {
    width: "100%",
    height: "auto",
  },
  scrollContainerContent: {
    height: "100%",
    width: "100%",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 20,
  },
  // Tab 2
  header: {
    height: header,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor,
  },
  main: {
    flex: 1,
    backgroundColor,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    width: "100%",
    height: footer,
    display: "flex",
    flexDirection: "row",
    borderTopWidth: 0,
    borderTopColor: mainColor,
    justifyContent: "space-between",
  },
  // Header Layout
  headerItem: {
    flexDirection: "column",
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  // Main Layout
  mainItem: {
    flexDirection: "row",
    width: "100%",
    height: "auto",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Footer Layout
  selector: {
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderRightColor: mainColor,
    borderLeftColor: mainColor,
  },
  selectorText: {
    fontSize: normalizeFontSize(14),
    color: "white",
    textAlign: "center",
    fontFamily: "Exo2_400Regular",
  },
  selectorSelectedText: {
    fontSize: normalizeFontSize(14),
    color: mainColor,
    textAlign: "center",
    fontFamily: "Exo2_400Regular",
  },
  // General text
  balance: {
    fontSize: normalizeFontSize(38),
    color: "white",
    marginTop: 10,
  },
  title: {
    fontSize: normalizeFontSize(26),
    color: "#fff",
    textAlign: "center",
    fontFamily: "Exo2_700Bold",
  },
  titlePaymentToken: {
    fontSize: normalizeFontSize(26),
    color: "#fff",
    textAlign: "center",
    fontFamily: "Exo2_700Bold",
    marginVertical: ratio > 1.7 ? 36 : 50,
  },
  description: {
    fontWeight: "bold",
    fontSize: normalizeFontSize(14),
    textAlign: "center",
    color: "#ffffff",
  },
  formTitle: {
    color: "white",
    textAlign: "left",
    textAlignVertical: "center",
    fontFamily: "Exo2_700Bold",
    fontSize: normalizeFontSize(18),
  },
  formTitleCard: {
    color: "white",
    textAlign: "left",
    textAlignVertical: "center",
    fontFamily: "Exo2_700Bold",
    fontSize: normalizeFontSize(24),
  },
  exoTitle: {
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "Exo2_700Bold",
    fontSize: normalizeFontSize(24),
  },
  // Globals Buttons
  buttonContainer: {
    width: "100%",
    gap: 4,
  },
  buttonStyle: {
    backgroundColor: mainColor,
    borderRadius: 50,
    padding: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderColor: mainColor,
    borderWidth: 2,
  },
  buttonCancelStyle: {
    backgroundColor: "black",
    borderRadius: 50,
    padding: 10,
    width: "100%",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 2,
    borderColor: "gray",
  },
  buttonText: {
    color: "white",
    fontSize: normalizeFontSize(24),
    fontFamily: "Exo2_700Bold",
  },
  buttonTextSmall: {
    color: "white",
    fontSize: normalizeFontSize(20),
    fontFamily: "Exo2_700Bold",
  },
  buttonCancelText: {
    color: "gray",
    fontSize: normalizeFontSize(24),
    fontFamily: "Exo2_700Bold",
  },
  singleButton: {
    backgroundColor: mainColor,
    borderRadius: 50,
    width: normalizeFontSize(60),
    height: normalizeFontSize(60),
    alignItems: "center",
    justifyContent: "center",
  },
  singleButtonText: {
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "Exo2_400Regular",
  },
  buttonSelectorSelectedStyle: {
    backgroundColor: "#1E2423",
    borderWidth: 2,
    padding: 5,
    alignItems: "center",
    borderColor: mainColor,
    minWidth: "30%",
  },
  balanceContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: ratio > 1.7 ? main * 0.47 : main * 0.45,
  },
  tokensContainer: {
    height: 10,
    marginBottom: 0,
  },

  // Tab 3
  tab3Container: {
    width: "100%",
    height: "100%",
  },
  tab3ScrollContainer: {
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  // Networks
  networkShow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    height: 60,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    marginVertical: 10,
  },
  network: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 60,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
  },
  networkMarginIcon: {
    marginHorizontal: normalizeFontSize(10),
  },
  networkTokenName: {
    fontSize: normalizeFontSize(18),
    color: "white",
  },
  networkTokenData: {
    fontSize: normalizeFontSize(12),
    color: "white",
  },
  // Send Styles
  inputText: {
    fontSize: normalizeFontSize(18),
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
  },
  picker: {
    borderRadius: 5,
    borderColor: secondaryColor,
    borderWidth: 2,
    color: "black",
    backgroundColor: "white",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    textAlign: "center",
    height: normalizeFontSize(50),
    marginVertical: 1,
    fontSize: normalizeFontSize(24),
    width: "100%",
  },
  input: {
    borderRadius: 5,
    borderColor: secondaryColor,
    borderWidth: 2,
    color: "black",
    backgroundColor: "white",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    textAlign: "center",
    height: normalizeFontSize(50),
    fontSize: normalizeFontSize(24),
    width: "100%",
    marginVertical: 1,
  },
  inputChat: {
    borderRadius: 10,
    borderColor: secondaryColor,
    borderWidth: 2,
    color: "black",
    backgroundColor: "white",
    fontSize: normalizeFontSize(18),
    padding: 10,
    textAlign: "justify",
    width: "84%",
  },
  // Profile Section Styles
  profileSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 40,
  },

  avatarContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 30,
    padding: 8,
    backgroundColor: "#1F2937",
    shadowColor: mainColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  avatarGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 92,
  },

  username: {
    fontSize: normalizeFontSize(32),
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
    fontFamily: "Exo2_700Bold",
  },

  joinDate: {
    fontSize: normalizeFontSize(16),
    color: "#9CA3AF",
    fontWeight: "400",
    fontFamily: "Exo2_400Regular",
  },

  // Verification Section Styles
  verificationSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  verificationBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: mainColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  verificationText: {
    flex: 1,
  },

  verificationLabel: {
    fontSize: normalizeFontSize(14),
    color: "#9CA3AF",
    fontWeight: "400",
    fontFamily: "Exo2_400Regular",
  },

  verificationStatus: {
    fontSize: normalizeFontSize(20),
    fontWeight: "600",
    color: "#ffffff",
    fontFamily: "Exo2_700Bold",
  },

  humanAccessText: {
    fontSize: normalizeFontSize(16),
    color: "#9CA3AF",
    textAlign: "left",
    marginBottom: 40,
    paddingLeft: 20,
    fontFamily: "Exo2_400Regular",
  },

  // Actions Section Styles
  actionsSection: {
    paddingBottom: 40,
  },

  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#1F2937",
    borderRadius: 12,
  },

  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  actionIcon: {
    marginRight: 16,
  },

  worldcoinIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: mainColor,
    justifyContent: "center",
    alignItems: "center",
  },

  worldcoinText: {
    color: "#ffffff",
    fontSize: normalizeFontSize(20),
    fontWeight: "600",
    fontFamily: "Exo2_700Bold",
  },

  earnIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: mainColor,
    justifyContent: "center",
    alignItems: "center",
  },

  earnIconText: {
    color: "#ffffff",
    fontSize: normalizeFontSize(20),
    fontWeight: "600",
    fontFamily: "Exo2_700Bold",
  },

  actionTextContainer: {
    flex: 1,
  },

  actionTitle: {
    fontSize: normalizeFontSize(18),
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
    fontFamily: "Exo2_700Bold",
  },

  actionSubtitle: {
    fontSize: normalizeFontSize(14),
    color: "#9CA3AF",
    fontFamily: "Exo2_400Regular",
  },

  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: quaternaryColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  doneButtonText: {
    color: "#ffffff",
    fontSize: normalizeFontSize(14),
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: "Exo2_700Bold",
  },
});

export default GlobalStyles;
