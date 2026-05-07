// src/components/BottomTabBar.tsx

import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Tab {
  label: string;
  icon: string;
}

interface Props {
  activeTab: number;
  onTabPress: (index: number) => void;
}

const TABS: Tab[] = [
  { label: "Home", icon: "🏠" },
  { label: "Bookings", icon: "📅" },
  { label: "Messages", icon: "💬" },
  { label: "Profile", icon: "👤" },
];

export const BottomTabBar: React.FC<Props> = ({ activeTab, onTabPress }) => (
  <View
    className="flex-row bg-white border-t border-gray-200 pt-2 pb-5"
    style={{
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 10,
    }}
  >
    {TABS.map((tab, index) => {
      const isActive = activeTab === index;
      return (
        <TouchableOpacity
          key={tab.label}
          className="flex-1 items-center"
          onPress={() => onTabPress(index)}
          activeOpacity={0.75}
        >
          <Text className="text-[22px]">{tab.icon}</Text>
          <Text
            className={`text-[11px] mt-0.5 ${
              isActive ? "text-primary font-semibold" : "text-gray-400"
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);
