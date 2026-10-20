package io.github.sakots.nanten;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ProviderInfo;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class DistributionTest {
    @Test
    public void flavorHasItsOwnIdentityAndAdvertisingManifest() throws Exception {
        Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        boolean ads = BuildConfig.FLAVOR.equals("ads");
        assertEquals(ads ? "nanten.myapp" : "nanten.myapp.adfree", context.getPackageName());
        ApplicationInfo application = context.getPackageManager().getApplicationInfo(
            context.getPackageName(), PackageManager.GET_META_DATA);
        String appId = application.metaData == null ? null
            : application.metaData.getString("com.google.android.gms.ads.APPLICATION_ID");
        PackageInfo info = context.getPackageManager().getPackageInfo(context.getPackageName(),
            PackageManager.GET_PERMISSIONS | PackageManager.GET_PROVIDERS);
        List<String> permissions = info.requestedPermissions == null ? Collections.emptyList()
            : Arrays.asList(info.requestedPermissions);
        boolean adsProvider = false;
        if (info.providers != null) {
            for (ProviderInfo provider : info.providers) {
                adsProvider |= provider.name.equals("com.google.android.gms.ads.MobileAdsInitProvider");
            }
        }
        if (ads) {
            assertNotNull(appId);
            assertTrue(permissions.contains("com.google.android.gms.permission.AD_ID"));
            assertTrue(adsProvider);
            if (BuildConfig.DEBUG) {
                assertEquals("ca-app-pub-3940256099942544~3347511713", appId);
            }
        } else {
            assertNull(appId);
            assertFalse(adsProvider);
            for (String permission : permissions) {
                assertFalse(permission.contains("AD_ID"));
                assertFalse(permission.startsWith("android.permission.ACCESS_ADSERVICES"));
            }
        }
    }

}
