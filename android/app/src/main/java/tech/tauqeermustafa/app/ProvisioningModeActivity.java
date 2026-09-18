package tech.tauqeermustafa.app;

import android.app.admin.DevicePolicyManager;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import java.util.ArrayList;

/**
 * Required by Android 12+ (API 31+) for DPC Work Profile Provisioning.
 * Informs Android OS that this DPC provisions an isolated Managed Work Profile.
 *
 * CRITICAL: In Android 12+, on personal devices (BYOD), Android passes allowed modes
 * containing PROVISIONING_MODE_MANAGED_PROFILE_ON_PERSONAL_DEVICE (3). Returning mode 1
 * (organization-owned) causes Android ManagedProvisioning to reject setup with
 * "Can't set up work profile. Contact your admin."
 */
public class ProvisioningModeActivity extends AppCompatActivity {

    private static final String TAG = "TMI_ProvisioningMode";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent receivedIntent = getIntent();
        ArrayList<Integer> allowedModes = null;
        if (receivedIntent != null) {
            allowedModes = receivedIntent.getIntegerArrayListExtra(
                DevicePolicyManager.EXTRA_PROVISIONING_ALLOWED_PROVISIONING_MODES
            );
        }

        Log.d(TAG, "ProvisioningModeActivity received allowedModes: " + allowedModes);

        // Mode 3: PROVISIONING_MODE_MANAGED_PROFILE_ON_PERSONAL_DEVICE
        // Mode 1: PROVISIONING_MODE_MANAGED_PROFILE
        int chosenMode = 3;

        if (allowedModes != null && !allowedModes.isEmpty()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                allowedModes.contains(DevicePolicyManager.PROVISIONING_MODE_MANAGED_PROFILE_ON_PERSONAL_DEVICE)) {
                chosenMode = DevicePolicyManager.PROVISIONING_MODE_MANAGED_PROFILE_ON_PERSONAL_DEVICE;
            } else if (allowedModes.contains(DevicePolicyManager.PROVISIONING_MODE_MANAGED_PROFILE)) {
                chosenMode = DevicePolicyManager.PROVISIONING_MODE_MANAGED_PROFILE;
            } else {
                chosenMode = allowedModes.get(0);
            }
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                chosenMode = DevicePolicyManager.PROVISIONING_MODE_MANAGED_PROFILE_ON_PERSONAL_DEVICE;
            } else {
                chosenMode = DevicePolicyManager.PROVISIONING_MODE_MANAGED_PROFILE;
            }
        }

        Log.d(TAG, "Selected provisioningMode: " + chosenMode);

        Intent resultIntent = new Intent();
        resultIntent.putExtra(DevicePolicyManager.EXTRA_PROVISIONING_MODE, chosenMode);

        setResult(RESULT_OK, resultIntent);
        finish();
    }
}
