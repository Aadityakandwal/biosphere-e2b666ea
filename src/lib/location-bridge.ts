import { Capacitor } from "@capacitor/core";
import { Geolocation, type Position } from "@capacitor/geolocation";

export interface GeoCoordinates {
  lat: number;
  lon: number;
  accuracy?: number;
}

export type LocationPermissionResult = {
  status: "granted" | "denied" | "unavailable";
  coords?: GeoCoordinates;
  errorMessage?: string;
  isDeniedPermanently?: boolean;
};

/**
 * Robust cross-platform location request.
 * Natively triggers Android/iOS permission dialog via Capacitor if available,
 * and falls back seamlessly to browser/WebView navigator.geolocation.
 */
export async function getDeviceLocation(): Promise<LocationPermissionResult> {
  // 1. Native Capacitor (Android / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      // Check current permission state
      const checkResult = await Geolocation.checkPermissions();
      
      if (checkResult.location !== "granted" && checkResult.coarseLocation !== "granted") {
        const reqResult = await Geolocation.requestPermissions({
          permissions: ["location"],
        });
        
        if (reqResult.location === "denied" && reqResult.coarseLocation === "denied") {
          return {
            status: "denied",
            errorMessage: "Location permission was denied. Enable location in Android settings to discover nearby green spaces.",
            isDeniedPermanently: true,
          };
        }
      }

      // Permission is granted, obtain real hardware position
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      });

      return {
        status: "granted",
        coords: {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
      };
    } catch (nativeErr: any) {
      console.warn("Capacitor native Geolocation error:", nativeErr);
      // If native plugin failed or permission denied
      const msg = nativeErr?.message || "";
      if (msg.toLowerCase().includes("denied") || msg.toLowerCase().includes("disabled")) {
        return {
          status: "denied",
          errorMessage: msg || "Location access was denied or location service is disabled.",
        };
      }
      // Fall through to try navigator.geolocation if available
    }
  }

  // 2. Web / Browser / Standard WebView Geolocation fallback
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return {
      status: "unavailable",
      errorMessage: "Geolocation is not supported by your device or browser.",
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          status: "granted",
          coords: {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
        });
      },
      (err) => {
        console.warn("navigator.geolocation error:", err);
        let errorMsg = "Unable to retrieve your location.";
        let isDenied = false;

        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Location permission was denied. Please allow location access in your browser or device settings.";
          isDenied = true;
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = "Location information is currently unavailable. Please check your GPS/network.";
        } else if (err.code === err.TIMEOUT) {
          errorMsg = "Location request timed out. Please try again.";
        }

        resolve({
          status: isDenied ? "denied" : "unavailable",
          errorMessage: errorMsg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
