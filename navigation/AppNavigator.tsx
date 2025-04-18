import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Lucide } from "@/components/ui/lucide"

import TimelineScreen from "@/screens/TimelineScreen"
import CaptureScreen from "@/screens/CaptureScreen"
import SettingsScreen from "@/screens/SettingsScreen"
import AnalysisScreen from "@/screens/AnalysisScreen"
import AnalysisDetailScreen from "@/screens/AnalysisDetailScreen"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const TimelineStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FCEBD1",
        },
        headerTintColor: "#4A4A4A",
      }}
    >
      <Stack.Screen name="TimelineMain" component={TimelineScreen} options={{ title: "Timeline" }} />
      <Stack.Screen name="AnalysisDetail" component={AnalysisDetailScreen} options={{ title: "Analysis Details" }} />
    </Stack.Navigator>
  )
}

const CaptureStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FCEBD1",
        },
        headerTintColor: "#4A4A4A",
      }}
    >
      <Stack.Screen name="CaptureMain" component={CaptureScreen} options={{ title: "Capture" }} />
      <Stack.Screen name="Analysis" component={AnalysisScreen} options={{ title: "Analysis" }} />
    </Stack.Navigator>
  )
}

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName

          if (route.name === "Timeline") {
            iconName = "clock"
          } else if (route.name === "Capture") {
            iconName = "camera"
          } else if (route.name === "Settings") {
            iconName = "settings"
          }

          return <Lucide name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#FFB88E",
        tabBarInactiveTintColor: "#4A4A4A",
        tabBarStyle: {
          backgroundColor: "#FCEBD1",
          height: 60,
          paddingBottom: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Timeline" component={TimelineStack} />
      <Tab.Screen name="Capture" component={CaptureStack} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

export default AppNavigator
