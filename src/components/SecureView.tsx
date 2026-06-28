"use client";

import React, { useEffect } from "react";
import { PrivacyScreen } from "@capacitor-community/privacy-screen";
import { Capacitor } from "@capacitor/core";

export default function SecureView({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let screenshotListener: any;
    let recordingStartListener: any;
    let recordingStopListener: any;

    const enableSecurity = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await PrivacyScreen.enable();
          
          screenshotListener = await PrivacyScreen.addListener("screenshotTaken", () => {
            alert("Screenshot and screen recording are disabled on this screen for security reasons.");
          });
          
          recordingStartListener = await PrivacyScreen.addListener("screenRecordingStarted", () => {
            alert("Screenshot and screen recording are disabled on this screen for security reasons.");
          });
          
          recordingStopListener = await PrivacyScreen.addListener("screenRecordingStopped", () => {});
        } catch (error) {
          console.error("Failed to enable PrivacyScreen:", error);
        }
      }
    };

    const disableSecurity = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          if (screenshotListener) await screenshotListener.remove();
          if (recordingStartListener) await recordingStartListener.remove();
          if (recordingStopListener) await recordingStopListener.remove();
          await PrivacyScreen.disable();
        } catch (error) {
          console.error("Failed to disable PrivacyScreen:", error);
        }
      }
    };

    enableSecurity();

    return () => {
      disableSecurity();
    };
  }, []);

  return <>{children}</>;
}
