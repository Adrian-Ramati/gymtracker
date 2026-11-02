package es.peakphysique.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;

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

    static PendingIntent pending(Context ctx, String title, String body) { return pending(ctx, title, body, 0); }
    static PendingIntent pending(Context ctx, String title, String body, long endTs) {
        Intent i = new Intent(ctx, RestAlarmReceiver.class);
        i.setAction("es.peakphysique.app.REST_ALARM");
        i.putExtra("endTs", endTs);
        if (title != null) i.putExtra("title", title);
        if (body != null) i.putExtra("body", body);
        return PendingIntent.getBroadcast(ctx, REQ, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    @PluginMethod
    public void schedule(PluginCall call) {
        Context ctx = getContext();
        Double at = call.getDouble("at");
        if (at == null) { call.reject("falta 'at'"); return; }
        getContext().getSharedPreferences("rest-alarm", Context.MODE_PRIVATE).edit().remove("rung").apply();
        PendingIntent pi = pending(ctx, call.getString("title", "Descanso terminado"), call.getString("body", "A por la siguiente serie"), at.longValue());
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        long when = at.longValue();
        JSObject ret = new JSObject();
        // 1 · Cuenta atrás en primer plano: evita que el sistema congele la app con la pantalla bloqueada
        boolean fgs = false;
        try { RestTimerService.start(ctx, when); fgs = true; } catch (Exception ignored) { }
        ret.put("service", fgs);
        // 2 · Respaldo: alarma «de reloj» (la que más respetan Doze y las capas de ahorro de los fabricantes)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pi);
                ret.put("exact", false);
            } else {
                Intent open = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
                PendingIntent show = open == null ? pi : PendingIntent.getActivity(ctx, 2, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                am.setAlarmClock(new AlarmManager.AlarmClockInfo(when, show), pi);
                ret.put("exact", true);
            }
            call.resolve(ret);
        } catch (Exception e) {
            if (fgs) call.resolve(ret); else call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        Context ctx = getContext();
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        am.cancel(pending(ctx, null, null));
        try { RestTimerService.stop(ctx); } catch (Exception ignored) { }
        RestAlarmReceiver.dismiss(ctx);
        call.resolve();
    }

    /** Diagnóstico para Perfil: versión del APK y qué puede bloquear la alarma. */
    @PluginMethod
    public void info(PluginCall call) {
        Context ctx = getContext();
        JSObject r = new JSObject();
        try { r.put("version", ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0).versionName); } catch (Exception ignored) { }
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        r.put("exact", Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms());
        r.put("notifications", NotificationManagerCompat.from(ctx).areNotificationsEnabled());
        PowerManager pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
        r.put("batteryUnrestricted", pm.isIgnoringBatteryOptimizations(ctx.getPackageName()));
        AudioManager au = (AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE);
        r.put("alarmVolume", au.getStreamVolume(AudioManager.STREAM_ALARM));
        r.put("alarmVolumeMax", au.getStreamMaxVolume(AudioManager.STREAM_ALARM));
        r.put("manufacturer", Build.MANUFACTURER);
        r.put("sdk", Build.VERSION.SDK_INT);
        call.resolve(r);
    }

    /** Abre los ajustes de la app (en Xiaomi: Inicio automático y Ahorro de batería → Sin restricciones). */
    @PluginMethod
    public void openSettings(PluginCall call) {
        Context ctx = getContext();
        try {
            Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + ctx.getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(i);
            call.resolve();
        } catch (Exception e) { call.reject(e.getMessage()); }
    }

    /** Prueba desde Ajustes: suena ya mismo, para comprobar el volumen. */
    @PluginMethod
    public void test(PluginCall call) {
        RestAlarmReceiver.ring(getContext(), "Prueba de alarma", "Así sonará el fin del descanso");
        call.resolve();
    }
}
