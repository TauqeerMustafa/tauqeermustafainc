package tech.tauqeermustafa.app;

import android.app.admin.DeviceAdminReceiver;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

/**
 * Native Device Policy Controller for Tauqeer Mustafa Inc.
 * Enables TMI Portals to act as its own Profile Owner without any 3rd-party MDM.
 */
public class TmiDeviceAdminReceiver extends DeviceAdminReceiver {

    public static ComponentName getComponentName(Context context) {
        return new ComponentName(context.getApplicationContext(), TmiDeviceAdminReceiver.class);
    }

    @Override
    public void onEnabled(Context context, Intent intent) {
        super.onEnabled(context, intent);
        Toast.makeText(context, "TMI Work Profile Controller Active", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onProfileProvisioningComplete(Context context, Intent intent) {
        super.onProfileProvisioningComplete(context, intent);

        DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = getComponentName(context);

        if (dpm != null && dpm.isProfileOwnerApp(context.getPackageName())) {
            // Set corporate profile label
            dpm.setProfileName(adminComponent, "TMI Executive");
            // Enable profile
            dpm.setProfileEnabled(adminComponent);

            // Launch main activity in the newly created profile
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(launchIntent);
        }

        Toast.makeText(context, "TMI Private Work Profile Created Successfully", Toast.LENGTH_LONG).show();
    }
}
