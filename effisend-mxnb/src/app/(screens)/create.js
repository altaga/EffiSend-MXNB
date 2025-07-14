import { randomBytes, uuidV4 } from "ethers";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  usePathname,
} from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CamFace from "../../components/camFace";
import GlobalStyles, { secondaryColor } from "../../core/styles";
import { useStateAsync } from "../../core/useAsyncState";
import {
  setAsyncStorageValue,
  setEncryptedStorageValue,
} from "../../core/utils";
import ContextModule from "../../providers/contextModule";
import { Toast } from "toastify-react-native";

export default function createOrRecover() {
  const [loading, setLoading] = useState(false);
  const [take, setTake] = useStateAsync(false);
  const navigation = useNavigation();
  const context = useContext(ContextModule);

  useEffect(() => {
    const update = async () => {
      if (!context.value.starter) {
        navigation.navigate("index");
      } else if (context.value.address !== "") {
        navigation.navigate("(screens)/main");
      }
    };
    context.value.starter && update();
 }, [context.value.address, context.value.starter, navigation.navigate]);

  // Functions
  const createOrFetchFace = useCallback(async (image, nonce) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({
      nonce,
      image,
    });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    return new Promise((resolve) => {
      fetch(`/api/createOrFetchFace`, requestOptions)
        .then((response) => response.json())
        .then((result) => resolve(result))
        .catch(() => resolve({ result: null, error: "BAD REQUEST" }));
    });
  }, []);

  const createOrFetchWallet = useCallback(async (user) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({
      user,
    });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    return new Promise((resolve) => {
      fetch(`/api/createOrFetchWallet`, requestOptions)
        .then((response) => response.json())
        .then((result) => resolve(result))
        .catch(() => resolve({ result: null, error: "BAD REQUEST" }));
    });
  }, []);

  const createWallet = useCallback(async (image) => {
    setLoading(true);
    const bytes = randomBytes(16);
    const nonce = `face_${uuidV4(bytes)}`;
    const { result: faceResult } = await createOrFetchFace(image, nonce);
    if (faceResult === null) {
      setLoading(false);
    } else {
      if (typeof faceResult === "string") {
        const { result: walletResult } = await createOrFetchWallet(faceResult);
        if (walletResult !== null) {
          const { user, address, clabe, rclabe } = walletResult;
          setEncryptedStorageValue({ user });
          setAsyncStorageValue({ address, clabe, rclabe });
          context.setValue({
            clabe,
            rclabe,
            address,
          });
          navigation.navigate("(screens)/main");
        }
      } else if (typeof faceResult === "boolean" && faceResult === true) {
        const { result: walletResult } = await createOrFetchWallet(nonce);
        if (walletResult !== null) {
          const { user, address, clabe, rclabe } = walletResult;
          setEncryptedStorageValue({ user });
          setAsyncStorageValue({ address, clabe, rclabe });
          context.setValue({
            clabe,
            rclabe,
            address,
          });
          navigation.navigate("(screens)/main");
          Toast.show({
            type: "info",
            text1: "You have won MNXB tokens because you verified",
            text2: "Go to the Effisend ID tab to claim",
            position: "bottom",
            visibilityTime: 10000,
            autoHide: true,
          });
        }
      }
    }
    setLoading(false);
  }, []);

  return (
    <SafeAreaView style={[GlobalStyles.container]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={GlobalStyles.scrollContainer}
        contentContainerStyle={[GlobalStyles.scrollContainerContent]}
      >
        <View>
          <Text style={GlobalStyles.title}>FaceID</Text>
        </View>
        <View
          style={{
            height: "auto",
            width: "90%",
            borderColor: secondaryColor,
            borderWidth: 5,
            borderRadius: 10,
            aspectRatio: 1,
          }}
        >
          <CamFace
            facing={"front"}
            take={take}
            onImage={(image) => createWallet(image)}
          />
        </View>
        <Pressable
          disabled={loading}
          style={[
            GlobalStyles.buttonStyle,
            { width: "90%" },
            loading ? { opacity: 0.5 } : {},
          ]}
          onPress={async () => {
            await setTake(true);
            await setTake(false);
          }}
        >
          <Text style={[GlobalStyles.buttonText]}>
            {loading ? "Fetching..." : "Join / Recover"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}