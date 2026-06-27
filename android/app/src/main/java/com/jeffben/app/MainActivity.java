package com.jeffben.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    private static final String APP_HOST = "app-woad-beta.vercel.app";

    // ────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ────────────────────────────────────────────────────────────────────────

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Install our WebView overrides immediately after the bridge is created
        installWebViewOverrides();
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

    @Override
    public void onResume() {
        super.onResume();
        // Re-apply overrides in case Capacitor replaced the client during resume
        installWebViewOverrides();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Keep ALL http/https navigation inside the WebView
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Installs a custom WebViewClient and WebChromeClient so that:
     *  • Every http/https URL stays inside the Capacitor WebView (never Chrome)
     *  • window.open() calls are redirected into the same WebView
     */
    private void installWebViewOverrides() {
        try {
            WebView wv = getBridge().getWebView();
            if (wv == null) return;

            // ---- WebViewClient: block all http/https from escaping to Chrome ----
            wv.setWebViewClient(new BridgeWebViewClient(getBridge()) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view,
                                                        WebResourceRequest request) {
                    String scheme = request.getUrl().getScheme();
                    if ("https".equals(scheme) || "http".equals(scheme)) {
                        // Return false → WebView handles it itself (no Chrome)
                        return false;
                    }
                    // tel:, mailto:, intent:, market: etc. go to system
                    return super.shouldOverrideUrlLoading(view, request);
                }
            });

            // ---- WebChromeClient: redirect window.open() into the same WebView ----
            wv.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog,
                                              boolean isUserGesture,
                                              android.os.Message resultMsg) {
                    // Capture the URL from the hit-test result and load it in-place
                    WebView.HitTestResult r = view.getHitTestResult();
                    String url = r.getExtra();
                    if (url != null) {
                        view.loadUrl(url);
                    }
                    return false; // false = don't create a new window
                }
            });

            // Enable JavaScript (required by Next.js)
            wv.getSettings().setJavaScriptEnabled(true);
            // Allow JS to open windows (we intercept them above)
            wv.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
            wv.getSettings().setSupportMultipleWindows(true);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // Deep-link / App-Link handler (QR code scan → navigate inside WebView)
    // ────────────────────────────────────────────────────────────────────────

    /**
     * When the system fires an App Link intent (e.g. camera scans the boarding
     * QR for https://app-woad-beta.vercel.app/bus/CBE001), load that path
     * inside the Capacitor WebView instead of handing it to Chrome.
     */
    private void handleDeepLinkIntent(final Intent intent) {
        if (intent == null) return;
        if (!Intent.ACTION_VIEW.equals(intent.getAction())) return;

        Uri data = intent.getData();
        if (data == null) return;

        String scheme = data.getScheme();
        String host   = data.getHost();

        boolean isOurDomain = ("https".equals(scheme) || "http".equals(scheme))
                && APP_HOST.equals(host);
        if (!isOurDomain) return;

        // Build the path (e.g. /bus/CBE001?from=Gandhipuram)
        StringBuilder sb = new StringBuilder();
        String path = data.getPath();
        String query = data.getQuery();
        String frag  = data.getFragment();
        if (path != null)  sb.append(path);
        if (query != null) sb.append("?").append(query);
        if (frag  != null) sb.append("#").append(frag);
        final String targetPath = sb.toString();
        if (targetPath.isEmpty()) return;

        // Delay slightly so the Capacitor bridge and Next.js router are ready
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            try {
                WebView wv = getBridge().getWebView();
                if (wv == null) return;
                // Use Next.js client-side router via JS so it renders correctly
                String js = "window.location.href = '"
                        + targetPath.replace("'", "\\'") + "';";
                wv.evaluateJavascript(js, null);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, 800); // 800 ms is enough for Next.js hydration to complete
    }
}
