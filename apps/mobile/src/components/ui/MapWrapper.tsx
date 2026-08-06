import { forwardRef } from "react";
import MapView, { Marker } from "react-native-maps";

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

export const MapWrapper = forwardRef<MapView, MapWrapperProps>(
  ({ region, latitude, longitude, markerTitle, onPress }, ref) => {
    return (
      <MapView
        ref={ref}
        style={{ flex: 1 }}
        initialRegion={region}
        onPress={(e) => onPress?.(e.nativeEvent.coordinate)}
        pitchEnabled={false}
      >
        {latitude != null && longitude != null ? (
          <Marker
            coordinate={{
              latitude: Number(latitude),
              longitude: Number(longitude),
            }}
            title={markerTitle || "Meeting Point"}
          />
        ) : null}{" "}
      </MapView>
    );
  },
);

MapWrapper.displayName = "MapWrapper";
