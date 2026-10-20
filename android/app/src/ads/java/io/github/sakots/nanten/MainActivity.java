package io.github.sakots.nanten;

import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private FrameLayout bannerContainer;
    private boolean bannerLoaded;
    private boolean keyboardVisible;

    @Override
    protected void load() {
        registerPlugin(NantenAdsPlugin.class);
        super.load();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getBridge() == null) return;

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        ViewGroup content = findViewById(android.R.id.content);
        View webContent = content.getChildAt(0);
        content.removeView(webContent);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.addView(webContent, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
        bannerContainer = new FrameLayout(this);
        bannerContainer.setForegroundGravity(Gravity.CENTER);
        bannerContainer.setVisibility(View.GONE);
        root.addView(bannerContainer, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        content.addView(root, new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        // SystemBars' inset handling is disabled in the ads Capacitor configuration.
        // One owner applies bars, cutouts and IME to both native and web content.
        ViewCompat.setOnApplyWindowInsetsListener(root, (view, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars()
                | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());
            view.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, ime.bottom));
            updateBannerVisibility();
            return new WindowInsetsCompat.Builder(insets)
                .setInsets(WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.ime(), Insets.NONE)
                .build();
        });
        ViewCompat.requestApplyInsets(root);
    }

    FrameLayout getBannerContainer() {
        return bannerContainer;
    }

    void setBannerLoaded(boolean loaded) {
        bannerLoaded = loaded;
        updateBannerVisibility();
    }

    private void updateBannerVisibility() {
        if (bannerContainer != null) {
            bannerContainer.setVisibility(bannerLoaded && !keyboardVisible ? View.VISIBLE : View.GONE);
        }
    }
}
