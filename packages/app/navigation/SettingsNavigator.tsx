import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";

import PersonalisationScreen from "../screens/Settings/Personalisation";
import { SettingsStackParamList } from "../types";
import Header from "./Header";

const SettingsStack = createStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        header: props => <Header {...props} />,
        cardStyle: {
          maxHeight: "100%",
        },
      }}>
      <SettingsStack.Screen name="Personalisation" component={PersonalisationScreen} />
    </SettingsStack.Navigator>
  );
}