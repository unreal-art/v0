import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.unreal.art",
  appName: "unreal",
  webDir: "public",
  server: {
    androidScheme: "https",
    cleartext: true,
    allowNavigation: ["unreal.art"]
  }
};

export default config;
