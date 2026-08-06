import { forwardRef } from "react";
import { View } from "react-native";
import { ThemedText } from "../themed-text";


export interface LocationRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapWrapperProps {
  region: LocationRegion;
  latitude?: number;
  longitude?: number;
  markerTitle?: string;
  onPress?: (coords: { latitude: number; longitude: number }) => void;
}

export const MapWrapper = forwardRef<any, MapWrapperProps>(
  ({ latitude, longitude }, _ref) => {
    return (
      <View className="flex-1 bg-gray-100 dark:bg-neutral-800 items-center justify-center p-4">
        <ThemedText className="text-gray-600 dark:text-gray-400 text-center font-medium">
          🗺️ Interactive map preview is available on iOS and Android.
        </ThemedText>
        {latitude && longitude && (
          <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Selected Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </ThemedText>
        )}
      </View>
    );
  },
);

MapWrapper.displayName = "MapWrapper";