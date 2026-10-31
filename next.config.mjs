/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    "expo",
    "expo-camera",
    "expo-image-manipulator",
    "expo-modules-core",
    "react-native",
    "react-native-web", // Add this
    "expo-asset", // Add this
    "expo-constants", // Add this
    "expo-font", // Add this
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
