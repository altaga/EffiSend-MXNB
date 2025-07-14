import { Ionicons } from "@expo/vector-icons";
import { Contract, formatUnits } from "ethers";
import { LinearGradient } from "expo-linear-gradient";
import React, { Fragment, useCallback, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { abiContractDistributor } from "../../../contracts/rewardsDistributor";
import { blockchains } from "../../../core/constants";
import GlobalStyles from "../../../core/styles";
import { setupProvider } from "../../../core/utils";
import ContextModule from "../../../providers/contextModule";

function generateColors(publicKey, count = 3) {
  if (!publicKey || publicKey.trim() === "") {
    return Array(count).fill("#FFFFFF");
  }

  const hex = publicKey.replace(/^0x/, "").slice(0, 6).padEnd(6, "0");
  const colors = [];

  for (let i = 0; i < count; i++) {
    const offset = i * 2;
    const rRaw = parseInt(
      hex.slice((offset + 0) % 6, (offset + 2) % 6 || 6),
      16
    );
    const gRaw = parseInt(
      hex.slice((offset + 2) % 6, (offset + 4) % 6 || 6),
      16
    );
    const bRaw = parseInt(
      hex.slice((offset + 4) % 6, (offset + 6) % 6 || 6),
      16
    );

    // Scale values to 127–255 for soft colors
    const r = Math.floor(127 + (rRaw / 255) * 128);
    const g = Math.floor(127 + (gRaw / 255) * 128);
    const b = Math.floor(127 + (bRaw / 255) * 128);

    const color = `#${[r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")}`;
    colors.push(color.toUpperCase());
  }

  return colors;
}

export default function Tab3() {
  const context = React.useContext(ContextModule);
  const [trustScore, setTrustScore] = React.useState(0);
  const [rewardPoints, setRewardPoints] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const provider = setupProvider(blockchains[0].rpc);
  const contracts = new Contract(
    blockchains[0].rewardsContract,
    abiContractDistributor,
    provider
  );

  const getAllocatedRewards = useCallback(async () => {
    const claimCounter = await contracts.getClaimCount(context.value.address);
    const rewards = await contracts.getAllocatedReward(context.value.address);

    if (Number(claimCounter) > 9) {
      setTrustScore(100);
    } else {
      setTrustScore(Number(claimCounter) * 10);
    }
    setRewardPoints(Number(formatUnits(rewards, 6)));
  }, [setRewardPoints, setTrustScore, context, contracts]);

  async function getRewards() {
    let raw = JSON.stringify({
      address: context.value.address,
    });
    return new Promise((resolve) => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch("/api/getRewards", requestOptions)
        .then((response) => response.json())
        .then((result) => resolve(result))
        .catch(() => resolve(null));
    });
  }

  useEffect(() => {
    const update = async () => {
      if (context.value.address !== "") {
        getAllocatedRewards();
      }
    };
    context.value.starter && update();
  }, [context]);

  const handleRewardPoints = async () => {
    setLoading(true);
    const {result} = await getRewards();
    await provider.waitForTransaction(result, 1);
    await getAllocatedRewards();
    setLoading(false);
  };
  return (
    <Fragment>
      <View style={GlobalStyles.main}>
        <ScrollView
          style={GlobalStyles.content}
          contentContainerStyle={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <View style={GlobalStyles.profileSection}>
            {/* Avatar Orb */}
            <View style={GlobalStyles.avatarContainer}>
              <LinearGradient
                colors={generateColors(context.value.address)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={GlobalStyles.avatarGradient}
              />
            </View>

            {/* Username */}
            <Text style={GlobalStyles.username}>
              {context.value.address !== ""
                ? `@EffiUser_${context.value.address.substring(0, 6)}`
                : "Not Connected"}
            </Text>
            {/* Join Date */}
            <Text style={GlobalStyles.joinDate}>
              {context.value.address !== ""
                ? `Joined, ${new Date().getDate()} ${new Date().toLocaleString(
                    "default",
                    {
                      month: "long",
                    }
                  )} ${new Date().getFullYear()}`
                : "Not Joined"}
            </Text>
          </View>
          {/* Verification Badge */}
          <View style={GlobalStyles.verificationSection}>
            <View style={GlobalStyles.verificationBadge}>
              <Ionicons name="checkmark" size={20} color="#ffffff" />
            </View>
            <View style={GlobalStyles.verificationText}>
              <Text style={GlobalStyles.verificationLabel}>Identity</Text>
              <Text style={GlobalStyles.verificationStatus}>
                {context.value.address !== "" ? "Verified" : "Unverified"}
              </Text>
            </View>
          </View>
          {/* Trust Score */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Ionicons name="star" size={24} color="#ffaa00" />
              <Text style={styles.scoreTitle}>Trust Score</Text>
            </View>
            <Text style={styles.scoreValue}>{trustScore}/100</Text>
            <View style={styles.scoreBar}>
              <View
                style={[styles.scoreProgress, { width: `${trustScore}%` }]}
              />
            </View>
          </View>

          {/* Rewards */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Ionicons name="gift" size={24} color="#8B5CF6" />
              <Text style={styles.scoreTitle}>Pending Reward Points</Text>
            </View>
            <Text style={styles.rewardsValue}>{rewardPoints}</Text>
            <TouchableOpacity
              style={[
                styles.claimButton,
                { opacity: rewardPoints > 0 && !loading ? 1 : 0.5 },
              ]}
              onPress={() => handleRewardPoints()}
              disabled={rewardPoints <= 0 || loading}
            >
              <Text style={styles.claimButtonText}>
                {loading ? "Claiming..." : "Claim Rewards for Verification"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: "90%", marginTop: 30 }}>
            <Text style={[styles.sectionTitle, { alignItems: "flex-start" }]}>
              Verification Benefits
            </Text>
          </View>

          <View style={[styles.scoreCard, { marginTop: 0 }]}>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="trending-up" size={20} color="#10B981" />
                <Text style={styles.benefitText}>
                  Lower transaction fees for verified users
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="gift" size={20} color="#8B5CF6" />
                <Text style={styles.benefitText}>
                  Earn MXNB rewards for maintaining verification
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="shield" size={20} color="#3B82F6" />
                <Text style={styles.benefitText}>
                  Access to premium EffiSend features
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={styles.benefitText}>
                  Higher trust score in the network
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statusCard: {
    backgroundColor: "#000000",
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  statusLevel: {
    fontSize: 14,
    fontWeight: "600",
  },
  scoreCard: {
    backgroundColor: "#1a1a1a",
    width: "90%",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffaa00",
    marginBottom: 12,
  },
  scoreBar: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreProgress: {
    height: "100%",
    backgroundColor: "#ffaa00",
    borderRadius: 4,
  },
  rewardsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  rewardsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  rewardsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#8B5CF6",
    marginBottom: 12,
  },
  claimButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "flex-start",
  },
  claimButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionsSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  actionCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  actionText: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: 32,
    width: "90%",
  },
  benefitsList: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
