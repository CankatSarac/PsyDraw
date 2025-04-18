"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native"
import { Lucide } from "@/components/ui/lucide"
import { useApp } from "@/context/AppContext"

interface PaywallModalProps {
  visible: boolean
  onClose: () => void
}

const PaywallModal: React.FC<PaywallModalProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<"subscription" | "tokens">("subscription")
  const { addCredits } = useApp()

  const handlePurchase = async (credits: number) => {
    // In a real app, this would integrate with in-app purchases
    // For demo purposes, we'll just add the credits directly
    await addCredits(credits)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Get More Analyses</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Lucide name="x" size={24} color="#4A4A4A" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "subscription" && styles.activeTabButton]}
              onPress={() => setActiveTab("subscription")}
            >
              <Text style={[styles.tabText, activeTab === "subscription" && styles.activeTabText]}>Subscription</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === "tokens" && styles.activeTabButton]}
              onPress={() => setActiveTab("tokens")}
            >
              <Text style={[styles.tabText, activeTab === "tokens" && styles.activeTabText]}>Token Packs</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.plansContainer}>
            {activeTab === "subscription" ? (
              <>
                <View style={styles.planCard}>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>POPULAR</Text>
                  </View>
                  <Text style={styles.planTitle}>Monthly Plus</Text>
                  <Text style={styles.planPrice}>$4.99 / month</Text>
                  <Text style={styles.planDescription}>
                    Unlimited analyses, priority processing, and advanced insights
                  </Text>
                  <View style={styles.planFeatures}>
                    <View style={styles.featureItem}>
                      <Lucide name="check" size={16} color="#FFB88E" />
                      <Text style={styles.featureText}>Unlimited analyses</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Lucide name="check" size={16} color="#FFB88E" />
                      <Text style={styles.featureText}>Priority processing</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Lucide name="check" size={16} color="#FFB88E" />
                      <Text style={styles.featureText}>Advanced insights</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Lucide name="check" size={16} color="#FFB88E" />
                      <Text style={styles.featureText}>Export to PDF</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.subscribeButton}
                    onPress={() => handlePurchase(999)} // Unlimited represented as 999
                  >
                    <Text style={styles.subscribeButtonText}>Start 1-Week Free Trial</Text>
                  </TouchableOpacity>
                  <Text style={styles.cancelText}>Cancel anytime</Text>
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.tokenCard} onPress={() => handlePurchase(5)}>
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenAmount}>5 Tokens</Text>
                    <Text style={styles.tokenPrice}>$2.99</Text>
                  </View>
                  <Lucide name="chevron-right" size={20} color="#4A4A4A" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tokenCard, styles.popularTokenCard]}
                  onPress={() => handlePurchase(20)}
                >
                  <View style={styles.tokenInfo}>
                    <View style={styles.tokenBadge}>
                      <Text style={styles.tokenBadgeText}>BEST VALUE</Text>
                    </View>
                    <Text style={styles.tokenAmount}>20 Tokens</Text>
                    <Text style={styles.tokenPrice}>$9.99</Text>
                    <Text style={styles.tokenSaving}>Save 16%</Text>
                  </View>
                  <Lucide name="chevron-right" size={20} color="#4A4A4A" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.tokenCard} onPress={() => handlePurchase(50)}>
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenAmount}>50 Tokens</Text>
                    <Text style={styles.tokenPrice}>$19.99</Text>
                    <Text style={styles.tokenSaving}>Save 33%</Text>
                  </View>
                  <Lucide name="chevron-right" size={20} color="#4A4A4A" />
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Purchases will be charged to your Apple ID / Google Play account</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FCEBD1",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  closeButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#FFB88E",
  },
  tabText: {
    fontSize: 16,
    color: "#888888",
  },
  activeTabText: {
    color: "#4A4A4A",
    fontWeight: "bold",
  },
  plansContainer: {
    padding: 20,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    position: "relative",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFB88E",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  planBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 14,
    color: "#4A4A4A",
    marginBottom: 20,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#4A4A4A",
    marginLeft: 10,
  },
  subscribeButton: {
    backgroundColor: "#FFB88E",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  subscribeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelText: {
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
  },
  tokenCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popularTokenCard: {
    borderWidth: 2,
    borderColor: "#FFB88E",
  },
  tokenInfo: {
    flex: 1,
  },
  tokenBadge: {
    backgroundColor: "#FFB88E",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  tokenBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 10,
  },
  tokenAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 5,
  },
  tokenPrice: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  tokenSaving: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 2,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
  },
})

export default PaywallModal
