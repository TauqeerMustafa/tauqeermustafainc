package tech.tauqeermustafa.app;

import android.os.Bundle;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

/**
 * Required by Android 12+ (API 31+) for DPC Work Profile Provisioning.
 * Confirms initial policy compliance before handing over the profile.
 */
public class PolicyComplianceActivity extends AppCompatActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setResult(RESULT_OK);
        finish();
    }
}
