import { createBottomTabNavigator, BottomTabNavigationOptions } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Lucide } from "@/components/ui/lucide"
import { Platform } from "react-native"
import type { RouteProp } from "@react-navigation/native"

import TimelineScreen from "@/screens/TimelineScreen"
import CaptureScreen from "@/screens/CaptureScreen"
import SettingsScreen from "@/screens/SettingsScreen"
import AnalysisScreen from "@/screens/AnalysisScreen"
import AnalysisDetailScreen from "@/screens/AnalysisDetailScreen"

type RootTabParamList = {
  Timeline: undefined;
  Capture: undefined;
  Settings: undefined;
}

const Tab = createBottomTabNavigator<RootTabParamList>()
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
      screenOptions={({ route }: { route: RouteProp<RootTabParamList, keyof RootTabParamList> }) => ({
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: "clock" | "camera" | "settings" = "clock"

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
          height: Platform.OS === 'web' ? 80 : 60,
          paddingBottom: Platform.OS === 'web' ? 20 : 10,
          position: Platform.OS === 'web' ? 'fixed' : 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: "#FCEBD1",
        },
        headerTintColor: "#4A4A4A",
      })}
    >
      <Tab.Screen 
        name="Timeline" 
        component={TimelineStack} 
        options={{
          title: "Timeline",
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Capture" 
        component={CaptureStack}
        options={{
          title: "Capture",
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: "Settings"
        }}
      />
    </Tab.Navigator>
  )
}

export default AppNavigator
