package tech.tauqeermustafa.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.os.UserManager;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton;

public class MainActivity extends AppCompatActivity {

    private static final String APP_URL = "https://app.tauqeermustafa.tech";
    private static final int FILE_CHOOSER_RESULT_CODE = 1001;
    private static final int REQUEST_PROVISION_MANAGED_PROFILE = 4711;

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout errorLayout;
    private Button retryButton;
    private ValueCallback<Uri[]> uploadMessage;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        swipeRefresh = findViewById(R.id.swipeRefresh);
        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);
        errorLayout = findViewById(R.id.errorLayout);
        retryButton = findViewById(R.id.retryButton);

        // Fix scroll conflict between SwipeRefreshLayout and WebView
        swipeRefresh.setOnChildScrollUpCallback((parent, child) -> webView.canScrollVertically(-1));
        swipeRefresh.setOnRefreshListener(() -> {
            errorLayout.setVisibility(View.GONE);
            webView.reload();
        });
        swipeRefresh.setColorSchemeColors(0xFF1C69D4);

        retryButton.setOnClickListener(v -> {
            errorLayout.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            webView.loadUrl(APP_URL);
        });

        // Configure Cookies for Next.js Session/Auth
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        // Configure WebSettings
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        // Remove "; wv" to avoid restricted WebView user-agent flags
        String defaultUa = settings.getUserAgentString();
        settings.setUserAgentString(defaultUa.replace("; wv", "") + " TMIPortalsApp/3.0.0.1.6");

        // Register JavaScript interface for Enterprise Work Profile and Portal Bridge
        webView.addJavascriptInterface(new TMIAndroidBridge(this), "TMIAndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                progressBar.setVisibility(View.VISIBLE);
                errorLayout.setVisibility(View.GONE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
                swipeRefresh.setRefreshing(false);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    progressBar.setVisibility(View.GONE);
                    swipeRefresh.setRefreshing(false);
                    webView.setVisibility(View.GONE);
                    errorLayout.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String url = uri.toString();
                String host = uri.getHost();

                // Handle enterprise work profile deep link
                if (url.startsWith("tmi://provision-work-profile") || url.startsWith("tmi://work-profile")) {
                    new TMIAndroidBridge(MainActivity.this).triggerWorkProfileProvisioning();
                    return true;
                }

                // Handle external intent schemes & Play Store
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("sms:") || url.startsWith("whatsapp:") || url.startsWith("market:")) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                        return true;
                    } catch (Exception ignored) {
                        return true;
                    }
                }

                // Handle android intent:// URIs
                if (url.startsWith("intent:")) {
                    try {
                        Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                        if (intent != null) {
                            if (intent.resolveActivity(getPackageManager()) != null) {
                                startActivity(intent);
                                return true;
                            }
                            String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                            if (fallbackUrl != null) {
                                webView.loadUrl(fallbackUrl);
                                return true;
                            }
                        }
                    } catch (Exception ignored) {
                        return true;
                    }
                }

                if (url.startsWith("https://wa.me/")) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                        return true;
                    } catch (Exception ignored) {
                        return false;
                    }
                }

                // Keep official company domains and subdomains inside WebView
                if (host != null && host.contains("tauqeermustafa.tech")) {
                    return false;
                }

                // External browser for other domains
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (uploadMessage != null) {
                    uploadMessage.onReceiveValue(null);
                    uploadMessage = null;
                }
                uploadMessage = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_RESULT_CODE);
                } catch (Exception e) {
                    uploadMessage = null;
                    return false;
                }
                return true;
            }
        });

        // Modern AndroidX back button handling
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(APP_URL);
        }

        // Configure Work Profile Setup & Floating Action Button
        ExtendedFloatingActionButton btnWorkProfile = findViewById(R.id.btnWorkProfile);
        DevicePolicyManager dpm = (DevicePolicyManager) getSystemService(DEVICE_POLICY_SERVICE);
        boolean isWorkProfile = dpm != null && dpm.isProfileOwnerApp(getPackageName());

        if (!isWorkProfile) {
            if (btnWorkProfile != null) {
                btnWorkProfile.setVisibility(View.VISIBLE);
                btnWorkProfile.setOnClickListener(v -> triggerWorkProfileProvisioningNative());
            }

            boolean hasPrompted = getSharedPreferences("tmi_prefs", MODE_PRIVATE).getBoolean("has_prompted_profile_v2", false);
            if (!hasPrompted) {
                getSharedPreferences("tmi_prefs", MODE_PRIVATE).edit().putBoolean("has_prompted_profile_v2", true).apply();
                new MaterialAlertDialogBuilder(this)
                    .setTitle("💼 Set Up Work Profile")
                    .setMessage("Welcome to TMI Portals!\n\nWould you like to activate a separate, encrypted Work Profile on this phone?\n\nThis will create an isolated workspace container (briefcase 💼) for your company apps with zero third-party software.")
                    .setPositiveButton("Set Up Now", (dialog, which) -> triggerWorkProfileProvisioningNative())
                    .setNegativeButton("Later", (dialog, which) -> dialog.dismiss())
                    .show();
            }
        } else {
            if (btnWorkProfile != null) {
                btnWorkProfile.setVisibility(View.GONE);
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_PROVISION_MANAGED_PROFILE) {
            if (resultCode == RESULT_OK) {
                Toast.makeText(this, "🎉 TMI Work Profile Activated Successfully!", Toast.LENGTH_LONG).show();
                ExtendedFloatingActionButton btnWorkProfile = findViewById(R.id.btnWorkProfile);
                if (btnWorkProfile != null) {
                    btnWorkProfile.setVisibility(View.GONE);
                }
            } else {
                Toast.makeText(this, "Work profile setup was canceled or aborted by device policy.", Toast.LENGTH_SHORT).show();
            }
            return;
        }
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (uploadMessage == null) return;
            uploadMessage.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            uploadMessage = null;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    public void triggerWorkProfileProvisioningNative() {
        DevicePolicyManager dpm = (DevicePolicyManager) getSystemService(DEVICE_POLICY_SERVICE);
        if (dpm != null && dpm.isProfileOwnerApp(getPackageName())) {
            Toast.makeText(this, "✅ TMI Work Profile is already active!", Toast.LENGTH_LONG).show();
            return;
        }

        // Pre-flight check: Is managed profile provisioning permitted by Android on this device?
        if (dpm != null && !dpm.isProvisioningAllowed(DevicePolicyManager.ACTION_PROVISION_MANAGED_PROFILE)) {
            showProvisioningBlockedDialog();
            return;
        }

        boolean started = false;
        try {
            ComponentName adminComponent = TmiDeviceAdminReceiver.getComponentName(this);
            Intent provisionIntent = new Intent(DevicePolicyManager.ACTION_PROVISION_MANAGED_PROFILE);
            provisionIntent.putExtra(DevicePolicyManager.EXTRA_PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME, adminComponent);
            provisionIntent.putExtra(DevicePolicyManager.EXTRA_PROVISIONING_DEVICE_ADMIN_PACKAGE_NAME, getPackageName());
            provisionIntent.putExtra("android.app.extra.PROVISIONING_SKIP_ENCRYPT", true);
            provisionIntent.putExtra("android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED", true);

            if (provisionIntent.resolveActivity(getPackageManager()) != null) {
                startActivityForResult(provisionIntent, REQUEST_PROVISION_MANAGED_PROFILE);
                started = true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (!started) {
            try {
                Intent addAccountIntent = new Intent(Settings.ACTION_ADD_ACCOUNT);
                addAccountIntent.putExtra(Settings.EXTRA_ACCOUNT_TYPES, new String[]{"com.google"});
                startActivity(addAccountIntent);
                started = true;
            } catch (Exception ignored) {}
        }

        if (!started) {
            try {
                startActivity(new Intent(Settings.ACTION_SYNC_SETTINGS));
            } catch (Exception ex) {
                Toast.makeText(this, "Please open Android Settings > Accounts to add your work profile.", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void showProvisioningBlockedDialog() {
        UserManager userManager = (UserManager) getSystemService(USER_SERVICE);
        boolean hasMultipleProfiles = false;
        if (userManager != null) {
            try {
                hasMultipleProfiles = userManager.getUserProfiles().size() > 1;
            } catch (Exception ignored) {}
        }

        StringBuilder msg = new StringBuilder();
        msg.append("Android cannot activate a new Work Profile right now due to device configuration:\n\n");
        if (hasMultipleProfiles) {
            msg.append("1. An existing Work Profile or Secondary Profile already exists on this phone. Android only allows ONE work profile at a time. Please remove the old work profile from Android Settings.\n\n");
        } else {
            msg.append("1. Existing Work Profile: If you previously tested or enrolled another work profile, remove it first.\n\n");
        }
        msg.append("2. Dual Apps / Dual Messenger (Samsung, Xiaomi, Oppo, OnePlus): Cloned apps create a hidden secondary profile that blocks Android Work Profiles. Please turn off Dual Apps / Dual Messenger in phone Settings.\n\n");
        msg.append("3. Screen Lock: Ensure your device has a PIN, Password, or Fingerprint set up.\n\n");
        msg.append("Tap 'Open Settings' to view your device accounts and remove any conflicting profiles.");

        new MaterialAlertDialogBuilder(this)
            .setTitle("⚠️ Work Profile Setup Blocked")
            .setMessage(msg.toString())
            .setPositiveButton("Open Settings", (dialog, which) -> {
                try {
                    startActivity(new Intent(Settings.ACTION_SYNC_SETTINGS));
                } catch (Exception e) {
                    try {
                        startActivity(new Intent(Settings.ACTION_SETTINGS));
                    } catch (Exception ignored) {}
                }
            })
            .setNegativeButton("Close", (dialog, which) -> dialog.dismiss())
            .show();
    }

    /**
     * JavaScript Interface exposed to TMI Portals Web Application.
     * Enables 1-tap activation of Android Enterprise Work Profile & Account Management.
     */
    public class TMIAndroidBridge {
        private final MainActivity activity;

        public TMIAndroidBridge(MainActivity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public boolean isAndroidApp() {
            return true;
        }

        @JavascriptInterface
        public void triggerWorkProfileProvisioning() {
            activity.runOnUiThread(activity::triggerWorkProfileProvisioningNative);
        }
    }
}
