import AsyncStorage from "@react-native-async-storage/async-storage";
import { DynamicProvider, FallbackStrategy } from "ethers-dynamic-provider";
import * as EncryptedStorage from "expo-secure-store";
import { Dimensions, PixelRatio, Platform } from "react-native";
import { Contract } from "ethers";

export async function getAsyncStorageValue(label) {
  try {
    const session = await AsyncStorage.getItem("General");
    if (label in JSON.parse(session)) {
      return JSON.parse(session)[label];
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

export async function setAsyncStorageValue(value) {
  const session = await AsyncStorage.getItem("General");
  await AsyncStorage.setItem(
    "General",
    JSON.stringify({
      ...JSON.parse(session),
      ...value,
    })
  );
}

export async function getEncryptedStorageValue(label) {
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

export async function setEncryptedStorageValue(value) {
  try {
    const session = await EncryptedStorage.getItem("General");
    await EncryptedStorage.setItem(
      "General",
      JSON.stringify({
        ...JSON.parse(session),
        ...value,
      })
    );
  } catch {
    const session = await AsyncStorage.getItem("GeneralBackup");
    await AsyncStorage.setItem(
      "GeneralBackup",
      JSON.stringify({
        ...JSON.parse(session),
        ...value,
      })
    );
  }
}

export function isValidUUID(uuid) {
  const regex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
  return regex.test(uuid);
}

export function arraySum(array) {
  return array.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
}

export function epsilonRound(num, zeros = 4) {
  let temp = num;
  if (typeof num === "string") {
    temp = parseFloat(num);
  }
  return (
    Math.round((temp + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}

export function findIndexByProperty(array, property, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][property] === value) {
      return i;
    }
  }
  return -1; // If not found
}

export function removeDuplicatesByKey(arr, key) {
  const seen = new Set();

  return arr
    .slice()
    .reverse() // Reverse the array
    .filter((item) => {
      if (seen.has(item[key])) {
        return false; // Skip if the value has already been seen
      }
      seen.add(item[key]);
      return true; // Keep the item if it's the first time the value is encountered
    })
    .reverse(); // Reverse it back to original order
}

export function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function setTokens(array) {
  return array.map((item, index) => {
    return {
      ...item,
      index,
      value: index.toString(),
      label: item.symbol,
      key: item.symbol,
    };
  });
}

export function setChains(array) {
  return array.map((item, index) => {
    return {
      ...item,
      color: "white",
      index,
      value: index.toString(),
      label: item.network,
      key: item.iconSymbol,
    };
  });
}

export function setupProvider(rpcs) {
  return new DynamicProvider(rpcs, {
    strategy: new FallbackStrategy(),
  });
}

export const normalizeFontSize = (size) => {
  let { width, height } = Dimensions.get("window");
  if (Platform.OS === "web" && height / width < 1) {
    width /= 2.3179;
    height *= 0.7668;
  }
  const scale = Math.min(width / 375, height / 667); // Based on a standard screen size
  return PixelRatio.roundToNearestPixel(size * scale);
};

export function verifyWallet(hexString) {
  try {
    const publicKey = hexString;
    return publicKey.length === 42;
  } catch (e) {
    return false;
  }
}

export function formatInputText(inputText, decimalPlaces = 2) {
  // Remove non-numeric characters except for decimal point
  const cleanedText = inputText.replace(/[^0-9\.]/g, '');

  // Handle empty or invalid input
  if (!cleanedText || cleanedText === '.') {
    return '0.00';
  }

  // Split the input into integer and fractional parts
  const parts = cleanedText.split('.');

  // Handle integer part
  let integerPart = parts[0];
  if (integerPart === '') {
    integerPart = '0';
  }

  // Handle fractional part
  let fractionalPart = parts[1];
  if (!fractionalPart) {
    fractionalPart = '0'.repeat(decimalPlaces);
  } else if (fractionalPart.length > decimalPlaces) {
    fractionalPart = fractionalPart.substring(0, decimalPlaces);
  } else {
    fractionalPart = fractionalPart.padEnd(decimalPlaces, '0');
  }

  // Combine the integer and fractional parts
  return `${integerPart}.${fractionalPart}`;
}

export function deleteLeadingZeros(string) {
  let number = parseFloat(string);
  let formattedString = number.toFixed(2).toString();
  return formattedString;
}

export function rgbaToHex(r, g, b, alphaPercent) {
  const toHex = (n) => n.toString(16).padStart(2, '0');

  // Clamp alpha to [0, 100], then convert to [0, 255]
  const a = Math.round(Math.max(0, Math.min(100, alphaPercent)) * 255 / 100);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

export function formatTimestamp(unixTimestamp) {
  const now = new Date();
  const messageDate = new Date(unixTimestamp * 1000); // Convert from seconds to milliseconds

  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  
  // Return formatted date (e.g. 03/Jul or 03/Jul/2025 if not same year)
  const day = messageDate.getDate();
  const month = messageDate.toLocaleString('default', { month: 'short' });
  const year = messageDate.getFullYear();

  const showYear = year !== now.getFullYear();
  return `${day}/${month}${showYear ? '/' + year : ''}`;
}
