package es.peakphysique.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin propio: alarma de fin de descanso (RestAlarmPlugin.java)
        registerPlugin(RestAlarmPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
