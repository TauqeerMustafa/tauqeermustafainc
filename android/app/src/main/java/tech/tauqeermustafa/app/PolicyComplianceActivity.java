package tech.tauqeermustafa.app;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

/**
 * Required by Android 12+ (API 31+) for DPC Work Profile Provisioning.
 * Confirms initial policy compliance before handing over the profile.
 */
public class PolicyComplianceActivity extends AppCompatActivity {

    private static final String TAG = "TMI_PolicyCompliance";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            DevicePolicyManager dpm = (DevicePolicyManager) getSystemService(DEVICE_POLICY_SERVICE);
            ComponentName adminComponent = TmiDeviceAdminReceiver.getComponentName(this);
            if (dpm != null && dpm.isProfileOwnerApp(getPackageName())) {
                dpm.setProfileName(adminComponent, "TMI Executive");
                dpm.setProfileEnabled(adminComponent);
                Log.d(TAG, "Profile enabled successfully in PolicyComplianceActivity");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error enabling profile in PolicyComplianceActivity", e);
        }

        setResult(RESULT_OK, new Intent());
        finish();
    }
}
