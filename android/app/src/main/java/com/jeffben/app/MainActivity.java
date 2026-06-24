package com.jeffben.app;

import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        // After bridge is fully ready, override the WebView client so that
        // EVERY https / http navigation stays inside the WebView (never Chrome).
        WebView webView = getBridge().getWebView();
        webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String scheme = request.getUrl().getScheme();
                // Keep http and https inside the app WebView
                if (scheme != null && (scheme.equals("https") || scheme.equals("http"))) {
                    return false; // false = load in WebView, NOT Chrome
                }
                // Let tel:, mailto:, intent: etc. go to external apps as normal
                return super.shouldOverrideUrlLoading(view, request);
            }
        });
    }
}
