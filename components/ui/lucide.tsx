import type React from "react"
import { View } from "react-native"
import {
  Camera,
  Clock,
  Settings,
  Image,
  Share,
  Save,
  AlertTriangle,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Sun,
  Plus,
  Minus,
  Check,
} from "lucide-react-native"

interface LucideProps {
  name: string
  size?: number
  color?: string
}

export const Lucide: React.FC<LucideProps> = ({ name, size = 24, color = "#4A4A4A" }) => {
  const icons: Record<string, React.ReactNode> = {
    camera: <Camera size={size} color={color} />,
    clock: <Clock size={size} color={color} />,
    settings: <Settings size={size} color={color} />,
    image: <Image size={size} color={color} />,
    share: <Share size={size} color={color} />,
    save: <Save size={size} color={color} />,
    "alert-triangle": <AlertTriangle size={size} color={color} />,
    "chevron-right": <ChevronRight size={size} color={color} />,
    x: <X size={size} color={color} />,
    "zoom-in": <ZoomIn size={size} color={color} />,
    "zoom-out": <ZoomOut size={size} color={color} />,
    sun: <Sun size={size} color={color} />,
    plus: <Plus size={size} color={color} />,
    minus: <Minus size={size} color={color} />,
    check: <Check size={size} color={color} />,
  }

  return <View>{icons[name] || null}</View>
}
