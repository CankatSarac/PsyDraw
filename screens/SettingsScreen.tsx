"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Linking, TextInput } from "react-native"
import { useTheme } from "@/components/theme-provider"
import { Lucide } from "@/components/ui/lucide"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useApp } from "@/context/AppContext"
import PaywallModal from "@/components/PaywallModal"

const SettingsScreen: React.FC = () => {
  const { theme, toggleTheme, colors } = useTheme()
  const { remainingCredits, apiKey, setApiKey } = useApp()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [dataSharing, setDataSharing] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  const handleSaveApiKey = async (key: string) => {
    try {
      await setApiKey(key)
      Alert.alert("Success", "API key saved successfully")
    } catch (error) {
      console.error("Error saving API key:", error)
      Alert.alert("Error", "Failed to save API key")
    }
  }

  const handleResetApp = async () => {
    Alert.alert(
      "Reset App",
      "Are you sure you want to reset the app? This will delete all your analyses and settings.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear()
              Alert.alert("Success", "App has been reset. Please restart the app.")
            } catch (error) {
              console.error("Error resetting app:", error)
              Alert.alert("Error", "Failed to reset app. Please try again.")
            }
          },
        },
      ],
    )
  }

  const openWebsite = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error("Error opening URL:", err)
      Alert.alert("Error", "Could not open the link.")
    })
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Remaining Credits</Text>
            <Text style={[styles.settingValue, { color: colors.text }]}>{remainingCredits}</Text>
          </View>
          <TouchableOpacity style={styles.buyButton} onPress={() => setShowPaywall(true)}>
            <Text style={styles.buyButtonText}>Buy More</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: colors.text }]}>Switch between light and dark theme</Text>
          </View>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: "#D9D9D9", true: "#FFB88E" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>

        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Push Notifications</Text>
            <Text style={[styles.settingDescription, { color: colors.text }]}>Receive drawing prompts and tips</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#D9D9D9", true: "#FFB88E" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy</Text>

        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Data Sharing</Text>
            <Text style={[styles.settingDescription, { color: colors.text }]}>Share anonymized data to improve AI</Text>
          </View>
          <Switch
            value={dataSharing}
            onValueChange={setDataSharing}
            trackColor={{ false: "#D9D9D9", true: "#FFB88E" }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity
          style={[styles.linkItem, { backgroundColor: colors.card }]}
          onPress={() => openWebsite("https://example.com/privacy")}
        >
          <Text style={[styles.linkText, { color: colors.text }]}>Privacy Policy</Text>
          <Lucide name="chevron-right" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkItem, { backgroundColor: colors.card }]}
          onPress={() => openWebsite("https://example.com/terms")}
        >
          <Text style={[styles.linkText, { color: colors.text }]}>Terms of Service</Text>
          <Lucide name="chevron-right" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>

        <TouchableOpacity
          style={[styles.linkItem, { backgroundColor: colors.card }]}
          onPress={() => openWebsite("https://example.com/help")}
        >
          <Text style={[styles.linkText, { color: colors.text }]}>Help Center</Text>
          <Lucide name="chevron-right" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkItem, { backgroundColor: colors.card }]}
          onPress={() => openWebsite("mailto:support@example.com")}
        >
          <Text style={[styles.linkText, { color: colors.text }]}>Contact Support</Text>
          <Lucide name="chevron-right" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>API Configuration</Text>

        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>ChatGPT Vision API Key</Text>
            <TextInput
              style={[styles.apiKeyInput, { color: colors.text, borderColor: colors.text + "40" }]}
              value={apiKey}
              onChangeText={handleSaveApiKey}
              placeholder="Enter your API key"
              placeholderTextColor={colors.text + "80"}
              secureTextEntry
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={[styles.dangerButton, { backgroundColor: "#FF6B6B" }]} onPress={handleResetApp}>
          <Text style={styles.dangerButtonText}>Reset App</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: colors.text }]}>Version 1.0.0</Text>
      </View>

      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buyButton: {
    backgroundColor: "#FFB88E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  linkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  linkText: {
    fontSize: 16,
  },
  dangerButton: {
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    alignItems: "center",
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.5,
  },
  apiKeyInput: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 14,
  },
})

export default SettingsScreen
