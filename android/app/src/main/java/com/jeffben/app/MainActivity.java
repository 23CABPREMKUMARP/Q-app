package com.jeffben.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Handle deep link if app was cold-launched via a QR scan / App Link
        handleDeepLinkIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        // Handle deep link when app is already running and brought to foreground
        handleDeepLinkIntent(intent);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Deep-link / App-Link handler (QR code scan → navigate inside WebView)
    // ────────────────────────────────────────────────────────────────────────

    /**
     * When the system fires an App Link intent (e.g. camera scans the boarding
     * QR for jeffben://bus/CBE001), load that path inside the Capacitor WebView.
     */
    private void handleDeepLinkIntent(final Intent intent) {
        if (intent == null) return;
        if (!Intent.ACTION_VIEW.equals(intent.getAction())) return;

        Uri data = intent.getData();
        if (data == null) return;

        String scheme = data.getScheme();
        String targetPath = null;

        if ("jeffben".equals(scheme)) {
            // jeffben://bus/CBE001  →  /bus/CBE001
            String host = data.getHost();   // e.g. "bus"
            String path = data.getPath();   // e.g. "/CBE001" or null
            String query = data.getQuery();
            StringBuilder sb = new StringBuilder("/");
            if (host != null) sb.append(host);
            if (path != null && !path.isEmpty() && !path.equals("/")) sb.append(path);
            if (query != null) sb.append("?").append(query);
            targetPath = sb.toString();
        }

        if (targetPath == null || targetPath.isEmpty()) return;

        final String finalPath = targetPath;
        // Short delay so Next.js hydration is complete before navigating
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            try {
                WebView wv = getBridge().getWebView();
                if (wv == null) return;
                String js = "window.location.href = '"
                        + finalPath.replace("'", "\\'") + "';";
                wv.evaluateJavascript(js, null);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, 800);
    }
}
