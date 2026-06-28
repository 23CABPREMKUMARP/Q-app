"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export function CapacitorDeepLink() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
      // url could be like "https://app-woad-beta.vercel.app/bus/TNB1024"
      const slug = event.url.split(".app").pop();
      if (slug) {
        // e.g. slug = "/bus/TNB1024"
        router.push(slug);
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [router]);

  return null;
}
