"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { Camera, CameraType } from "expo-camera"
import * as ImageManipulator from "expo-image-manipulator"
import { useNavigation } from "@react-navigation/native"
import { Lucide } from "@/components/ui/lucide"
import { useApp } from "@/context/AppContext"
import PaywallModal from "@/components/PaywallModal"

// Web-specific camera implementation
const WebCamera = ({ onCameraReady, style, children }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          onCameraReady();
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {children}
    </div>
  );
};

const CaptureScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off)
  const [showPaywall, setShowPaywall] = useState(false)
  const cameraRef = useRef<Camera>(null)
  const navigation = useNavigation()
  const { remainingCredits, decrementCredits } = useApp()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasPermission(true); // Web browsers handle permissions differently
    }
  }, [])

  const handleCapturePress = async () => {
    if (!isCameraReady || isCapturing) return

    // Check if user has credits
    const hasCredits = await decrementCredits()
    if (!hasCredits) {
      setShowPaywall(true)
      return
    }

    setIsCapturing(true)

    try {
      if (typeof window !== 'undefined') {
        // Web camera capture
        const video = document.querySelector('video');
        if (video) {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const imageUri = canvas.toDataURL('image/jpeg');
            
            // Process the image
            const processedImage = await ImageManipulator.manipulateAsync(
              imageUri,
              [{ resize: { width: 1200 } }],
              {
                compress: 0.8,
                format: ImageManipulator.SaveFormat.JPEG,
              }
            );

            // Navigate to analysis screen
            navigation.navigate("Analysis", { imageUri: processedImage.uri });
          }
        }
      } else if (cameraRef.current) {
        // Native camera capture
        const photo = await cameraRef.current.takePictureAsync();
        const processedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1200 } }],
          {
            compress: 0.8,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        navigation.navigate("Analysis", { imageUri: processedImage.uri });
      }
    } catch (error) {
      console.error("Error capturing image:", error)
      Alert.alert("Error", "Failed to capture image. Please try again.")
    } finally {
      setIsCapturing(false)
    }
  }

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off ? Camera.Constants.FlashMode.on : Camera.Constants.FlashMode.off,
    )
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFB88E" />
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={() => setHasPermission(true)}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {typeof window !== 'undefined' ? (
        <WebCamera
          onCameraReady={() => setIsCameraReady(true)}
          style={styles.camera}
        >
          <View style={styles.overlay}>
            <View style={styles.edgeDetector}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </WebCamera>
      ) : (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.back}
          flashMode={flashMode}
          onCameraReady={() => setIsCameraReady(true)}
        >
          <View style={styles.overlay}>
            <View style={styles.edgeDetector}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </Camera>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
          <Lucide name={flashMode === Camera.Constants.FlashMode.on ? "zap" : "zap-off"} size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          onPress={handleCapturePress}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        <View style={styles.creditsContainer}>
          <Text style={styles.creditsText}>{remainingCredits} credits remaining</Text>
        </View>
      </View>

      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  edgeDetector: {
    flex: 1,
    margin: 40,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#FFB88E",
    width: 30,
    height: 30,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  creditsContainer: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  creditsText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 40,
  },
  flashButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFB88E",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonDisabled: {
    backgroundColor: "rgba(255, 184, 142, 0.7)",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#FFB88E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
})

export default CaptureScreen
