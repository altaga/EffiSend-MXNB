import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ethers } from "ethers";
import * as EncryptedStorage from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create the context
const EthersContext = createContext();

// Create the provider component
const EthersProvider = ({ children }) => {
  const [wallet, setWallet] = useStateAsync(null);
  const [address, setAddress] = useStateAsync(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const setupWallet = useCallback(async () => {
    const privateKey = await getEncryptedStorageValue("privateKey");
    if (privateKey !== null) {
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();
      await setWallet(wallet);
      await setAddress(address);
      setIsReady(true);
    }
    setLoading(false);
  });

  useEffect(() => {
    setupWallet();
  }, []);

  return (
    <EthersContext.Provider
      {...{ wallet, address, loading, isReady, setupWallet }}
    >
      {children}
    </EthersContext.Provider>
  );
};

// Create the consumer component
const EthersConsumer = ({ children }) => {
  return (
    <EthersContext.Consumer>
      {(context) => children(context)}
    </EthersContext.Consumer>
  );
};

// Create the hook
const useEthersProvider = () => {
  return useContext(EthersContext);
};

// Export the components and hook
export { EthersContext, EthersProvider, EthersConsumer, useEthersProvider };

async function getEncryptedStorageValue(label) {
  try {
    const session = await EncryptedStorage.getItem("General");
    if (label in JSON.parse(session)) {
      return JSON.parse(session)[label];
    } else {
      return null;
    }
  } catch {
    try {
      const session = await AsyncStorage.getItem("GeneralBackup");
      if (label in JSON.parse(session)) {
        return JSON.parse(session)[label];
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }
}

function useStateAsync(initialValue) {
  const [state, setState] = useState(initialValue);
  const resolverRef = useRef(null);

  const asyncSetState = useCallback((newValue) => {
    setState(newValue);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  // Resolve the promise after state updates
  useEffect(() => {
    if (resolverRef.current) {
      resolverRef.current(state);
      resolverRef.current = null;
    }
  }, [state]);

  return [state, asyncSetState];
}
