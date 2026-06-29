"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CapacitorDeepLink() {
  const router = useRouter();

  useEffect(() => {
    let listener: any = null;

    import("@capacitor/core").then(({ Capacitor }) => {
      if (!Capacitor.isNativePlatform()) return;

      import("@capacitor/app").then(({ App }) => {
        listener = App.addListener("appUrlOpen", (event: any) => {
          try {
            const urlObj = new URL(event.url);
            const path = urlObj.pathname;
            const search = urlObj.search;

            if (path.startsWith("/bus/") || path.startsWith("/boarding/")) {
              const busCode = path.split("/").pop();
              router.push(`/town-bus/bus_${busCode?.toLowerCase()}/seat-selection`);
            } else if (path.startsWith("/track/")) {
              const ticketId = path.split("/").pop();
              router.push(`/live-map?ticketId=${ticketId}`);
            } else if (path.startsWith("/ticket/")) {
              const ticketId = path.split("/").pop();
              router.push(`/get-ticket?ticketId=${ticketId}`);
            } else if (path.startsWith("/profile")) {
              router.push("/profile");
            } else if (path !== "/") {
              router.push(`${path}${search}`);
            }
          } catch (err) {
            console.error("Deep link parse error:", err);
          }
        });
      });
    }).catch(err => {
      console.warn("Capacitor core not loaded", err);
    });

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      } else if (listener && typeof listener.then === 'function') {
        listener.then((l: any) => l.remove());
      }
    };
  }, [router]);

  return null;
}
