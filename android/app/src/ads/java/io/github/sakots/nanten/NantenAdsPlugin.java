package io.github.sakots.nanten;

import android.content.res.Configuration;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import androidx.lifecycle.Lifecycle;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "NantenAds")
public class NantenAdsPlugin extends Plugin {
    private static final String TAG = "NantenAds";
    private static final long INTERSTITIAL_MAX_AGE_MS = 60 * 60 * 1000L;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final List<PluginCall> initializeCalls = new ArrayList<>();
    private ConsentInformation consent;
    private boolean initialized;
    private boolean consentFlow;
    private boolean sdkInitializing;
    private boolean sdkReady;
    private boolean destroyed;
    private int generation;
    private AdView banner;
    private int bannerWidth;
    private InterstitialAd interstitial;
    private InterstitialAd showingInterstitial;
    private boolean interstitialLoading;
    private long interstitialLoadedAt;
    private PluginCall interstitialCall;
    private PluginCall privacyCall;
    private View.OnLayoutChangeListener layoutListener;

    @Override
    public void load() {
        consent = UserMessagingPlatform.getConsentInformation(getContext());
        layoutListener = (view, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) -> {
            if (right - left != oldRight - oldLeft) loadBanner();
        };
        getBridge().getWebView().addOnLayoutChangeListener(layoutListener);
    }

    private MainActivity activity() {
        return (MainActivity) getActivity();
    }

    private boolean alive() {
        return !destroyed && !getActivity().isFinishing() && !getActivity().isDestroyed();
    }

    private boolean canRequestAds() {
        return alive() && !consentFlow && consent != null && consent.canRequestAds();
    }

    private boolean resumed() {
        return alive() && getActivity().getLifecycle().getCurrentState().isAtLeast(Lifecycle.State.RESUMED);
    }

    private JSObject state() {
        JSObject state = new JSObject();
        state.put("privacyOptionsRequired", !destroyed && consent != null
            && consent.getPrivacyOptionsRequirementStatus()
                == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED);
        state.put("adsAvailable", canRequestAds());
        return state;
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        main.post(() -> {
            if (!alive()) {
                call.resolve(state());
                return;
            }
            if (consentFlow) {
                initializeCalls.add(call);
                return;
            }
            if (initialized) {
                startAds();
                call.resolve(state());
                return;
            }
            initializeCalls.add(call);
            consentFlow = true;
            consent.requestConsentInfoUpdate(getActivity(), new ConsentRequestParameters.Builder().build(),
                () -> {
                    if (!alive()) return;
                    UserMessagingPlatform.loadAndShowConsentFormIfRequired(getActivity(), error -> {
                        if (error != null) Log.w(TAG, error.getMessage());
                        finishConsent();
                    });
                }, error -> {
                    Log.w(TAG, error.getMessage());
                    // UMP may still permit requests using a previously obtained consent decision.
                    finishConsent();
                });
        });
    }

    private void finishConsent() {
        if (destroyed) return;
        initialized = true;
        consentFlow = false;
        startAds();
        for (PluginCall call : initializeCalls) call.resolve(state());
        initializeCalls.clear();
        if (privacyCall != null) {
            privacyCall.resolve(state());
            privacyCall = null;
        }
    }

    @PluginMethod
    public void showPrivacyOptions(PluginCall call) {
        main.post(() -> {
            if (!alive() || consentFlow || interstitialCall != null || !resumed()) {
                call.resolve(state());
                return;
            }
            if (!initialized) {
                initialize(call);
                return;
            }
            if (consent.getPrivacyOptionsRequirementStatus()
                != ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED) {
                call.resolve(state());
                return;
            }
            privacyCall = call;
            consentFlow = true;
            // A changed decision must not reuse any ad loaded under the old decision.
            clearAds();
            UserMessagingPlatform.showPrivacyOptionsForm(getActivity(), error -> {
                if (error != null) Log.w(TAG, error.getMessage());
                finishConsent();
            });
        });
    }

    private void startAds() {
        if (!canRequestAds()) {
            clearAds();
            return;
        }
        if (sdkReady) {
            loadBanner();
            loadInterstitial();
            return;
        }
        if (sdkInitializing) return;
        sdkInitializing = true;
        // Initialization can preload ads: this must remain after the UMP permission check.
        android.content.Context context = getContext().getApplicationContext();
        new Thread(() -> {
            try {
                MobileAds.initialize(context, status -> main.post(() -> {
                    if (destroyed) return;
                    sdkInitializing = false;
                    sdkReady = true;
                    if (canRequestAds()) {
                        loadBanner();
                        loadInterstitial();
                    }
                }));
            } catch (RuntimeException error) {
                Log.e(TAG, "Mobile Ads initialization failed", error);
                main.post(() -> sdkInitializing = false);
            }
        }, "nanten-mobile-ads").start();
    }

    private void loadBanner() {
        if (!sdkReady || !canRequestAds()) return;
        FrameLayout container = activity().getBannerContainer();
        if (container == null) return;
        int width = (int) (getBridge().getWebView().getWidth()
            / getContext().getResources().getDisplayMetrics().density);
        if (width <= 0 || (banner != null && width == bannerWidth)) return;
        destroyBanner();
        bannerWidth = width;
        final int requestGeneration = generation;
        final AdView requestedBanner = new AdView(getActivity());
        banner = requestedBanner;
        requestedBanner.setAdUnitId(BuildConfig.ADMOB_BANNER_ID);
        requestedBanner.setAdSize(AdSize.getLargeAnchoredAdaptiveBannerAdSize(getActivity(), width));
        container.addView(requestedBanner, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.CENTER));
        requestedBanner.setAdListener(new AdListener() {
            @Override
            public void onAdLoaded() {
                if (requestGeneration == generation && banner == requestedBanner && canRequestAds()) {
                    activity().setBannerLoaded(true);
                }
            }

            @Override
            public void onAdFailedToLoad(@NonNull LoadAdError error) {
                if (requestGeneration == generation && banner == requestedBanner && alive()) {
                    activity().setBannerLoaded(false);
                }
            }
        });
        requestedBanner.loadAd(new AdRequest.Builder().build());
    }

    private void loadInterstitial() {
        if (!sdkReady || !canRequestAds() || interstitialLoading
            || interstitial != null || showingInterstitial != null) return;
        interstitialLoading = true;
        final int requestGeneration = generation;
        InterstitialAd.load(getActivity(), BuildConfig.ADMOB_INTERSTITIAL_ID,
            new AdRequest.Builder().build(), new InterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull InterstitialAd ad) {
                    if (requestGeneration != generation || !canRequestAds()) return;
                    interstitialLoading = false;
                    interstitial = ad;
                    interstitialLoadedAt = SystemClock.elapsedRealtime();
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError error) {
                    if (requestGeneration != generation || destroyed) return;
                    interstitialLoading = false;
                    interstitial = null;
                }
            });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        main.post(() -> {
            if (!canRequestAds() || !resumed() || interstitialCall != null) {
                resolveShown(call, false);
                return;
            }
            if (interstitial != null
                && SystemClock.elapsedRealtime() - interstitialLoadedAt >= INTERSTITIAL_MAX_AGE_MS) {
                interstitial = null;
            }
            if (interstitial == null) {
                // Never wait for a network request at the result transition.
                resolveShown(call, false);
                loadInterstitial();
                return;
            }
            interstitialCall = call;
            showingInterstitial = interstitial;
            interstitial = null;
            showingInterstitial.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override
                public void onAdDismissedFullScreenContent() {
                    finishInterstitial(true);
                }

                @Override
                public void onAdFailedToShowFullScreenContent(@NonNull AdError error) {
                    finishInterstitial(false);
                }
            });
            try {
                showingInterstitial.show(getActivity());
            } catch (RuntimeException error) {
                Log.e(TAG, "Interstitial presentation failed", error);
                finishInterstitial(false);
            }
        });
    }

    private void resolveShown(PluginCall call, boolean shown) {
        JSObject result = new JSObject();
        result.put("shown", shown);
        call.resolve(result);
    }

    private void finishInterstitial(boolean shown) {
        if (showingInterstitial != null) showingInterstitial.setFullScreenContentCallback(null);
        showingInterstitial = null;
        if (interstitialCall != null) {
            resolveShown(interstitialCall, shown);
            interstitialCall = null;
        }
        loadInterstitial();
    }

    private void destroyBanner() {
        activity().setBannerLoaded(false);
        if (banner != null) {
            FrameLayout container = activity().getBannerContainer();
            if (container != null) container.removeView(banner);
            banner.setAdListener(null);
            banner.destroy();
            banner = null;
        }
        bannerWidth = 0;
    }

    private void clearAds() {
        generation++;
        interstitial = null;
        interstitialLoading = false;
        destroyBanner();
    }

    @Override
    protected void handleOnPause() {
        if (banner != null) banner.pause();
    }

    @Override
    protected void handleOnResume() {
        if (banner != null) banner.resume();
        if (initialized && !consentFlow) startAds();
    }

    @Override
    protected void handleOnConfigurationChanged(Configuration configuration) {
        main.post(this::loadBanner);
    }

    @Override
    protected void handleOnDestroy() {
        destroyed = true;
        clearAds();
        finishInterstitial(false);
        if (layoutListener != null) {
            getBridge().getWebView().removeOnLayoutChangeListener(layoutListener);
            layoutListener = null;
        }
        consentFlow = false;
        for (PluginCall call : initializeCalls) call.resolve(state());
        initializeCalls.clear();
        if (privacyCall != null) {
            privacyCall.resolve(state());
            privacyCall = null;
        }
    }
}
