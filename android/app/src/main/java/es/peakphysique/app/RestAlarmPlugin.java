package es.peakphysique.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Fin del descanso entre series como ALARMA, no como notificación normal.
 * El sonido de las notificaciones depende del modo silencio/vibración, del «enfriamiento» de Android 15
 * (baja o quita el sonido si la misma app avisa varias veces seguidas) y de cómo la capa del fabricante
 * configure el canal. Aquí el sonido lo pone RestAlarmReceiver por el canal de ALARMA (volumen de alarma),
 * así que suena siempre, con la pantalla bloqueada y aunque el móvil esté en vibración.
 */
@CapacitorPlugin(name = "RestAlarm")
public class RestAlarmPlugin extends Plugin {
    static final int REQ = 7001;

    static PendingIntent pending(Context ctx, String title, String body) {
        Intent i = new Intent(ctx, RestAlarmReceiver.class);
        i.setAction("es.peakphysique.app.REST_ALARM");
        if (title != null) i.putExtra("title", title);
        if (body != null) i.putExtra("body", body);
        return PendingIntent.getBroadcast(ctx, REQ, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    @PluginMethod
    public void schedule(PluginCall call) {
        Context ctx = getContext();
        Double at = call.getDouble("at");
        if (at == null) { call.reject("falta 'at'"); return; }
        PendingIntent pi = pending(ctx, call.getString("title", "Descanso terminado"), call.getString("body", "A por la siguiente serie"));
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        long when = at.longValue();
        JSObject ret = new JSObject();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pi);
                ret.put("exact", false);
            } else {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pi);
                ret.put("exact", true);
            }
            call.resolve(ret);
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        Context ctx = getContext();
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        am.cancel(pending(ctx, null, null));
        RestAlarmReceiver.dismiss(ctx);
        call.resolve();
    }

    /** Prueba desde Ajustes: suena ya mismo, para comprobar el volumen. */
    @PluginMethod
    public void test(PluginCall call) {
        RestAlarmReceiver.ring(getContext(), "Prueba de alarma", "Así sonará el fin del descanso");
        call.resolve();
    }
}
