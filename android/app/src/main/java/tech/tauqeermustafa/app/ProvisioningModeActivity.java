package tech.tauqeermustafa.app;

import android.app.admin.DevicePolicyManager;
import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

/**
 * Required by Android 12+ (API 31+) for DPC Work Profile Provisioning.
 * Informs Android OS that this DPC provisions an isolated Managed Work Profile.
 */
public class ProvisioningModeActivity extends AppCompatActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent resultIntent = new Intent();
        resultIntent.putExtra(
            DevicePolicyManager.EXTRA_PROVISIONING_MODE,
            DevicePolicyManager.PROVISIONING_MODE_MANAGED_PROFILE
        );

        setResult(RESULT_OK, resultIntent);
        finish();
    }
}
