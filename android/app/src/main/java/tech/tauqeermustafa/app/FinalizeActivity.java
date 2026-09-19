package tech.tauqeermustafa.app;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

/**
 * Triggered by Android OS upon successful work profile provisioning (ACTION_PROVISIONING_SUCCESSFUL).
 * Finalizes profile activation, sets corporate profile name, and launches MainActivity.
 */
public class FinalizeActivity extends AppCompatActivity {

    private static final String TAG = "TMI_FinalizeActivity";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            DevicePolicyManager dpm = (DevicePolicyManager) getSystemService(DEVICE_POLICY_SERVICE);
            ComponentName adminComponent = TmiDeviceAdminReceiver.getComponentName(this);
            if (dpm != null && dpm.isProfileOwnerApp(getPackageName())) {
                dpm.setProfileName(adminComponent, "TMI Executive");
                dpm.setProfileEnabled(adminComponent);
                Log.d(TAG, "Profile successfully finalized and enabled.");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error finalizing profile: ", e);
        }

        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(launchIntent);
        setResult(RESULT_OK);
        finish();
    }
}
