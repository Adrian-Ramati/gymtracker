package es.peakphysique.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;

/** Suena (canal de alarma), vibra y deja un aviso en pantalla al acabar el descanso. */
public class RestAlarmReceiver extends BroadcastReceiver {
    static final String CHANNEL = "rest-alarm";
    static final int NOTIF_ID = 7002;

    @Override
    public void onReceive(Context ctx, Intent intent) {
        final PendingResult pr = goAsync();
        ringOnce(ctx, intent.getLongExtra("endTs", 0), intent.getStringExtra("title"), intent.getStringExtra("body"));
        try { RestTimerService.stop(ctx); } catch (Exception ignored) { }
        new Handler(Looper.getMainLooper()).postDelayed(pr::finish, 3000);
    }

    /** Suena una sola vez por descanso: lo pueden disparar el servicio y la alarma de respaldo. */
    static synchronized void ringOnce(Context ctx, long endTs, String title, String body) {
        android.content.SharedPreferences sp = ctx.getSharedPreferences("rest-alarm", Context.MODE_PRIVATE);
        long key = endTs > 0 ? endTs : System.currentTimeMillis();
        long last = sp.getLong("rung", 0);
        if (endTs > 0 && Math.abs(last - key) < 1500) return;
        sp.edit().putLong("rung", key).apply();
        ring(ctx, title, body);
    }

    static void ring(Context ctx, String title, String body) {
        // 1 · Sonido por el flujo de ALARMA: no le afectan el modo vibración ni el límite de sonidos de notificaciones
        try {
            final ToneGenerator tg = new ToneGenerator(AudioManager.STREAM_ALARM, 100);
            final Handler h = new Handler(Looper.getMainLooper());
            tg.startTone(ToneGenerator.TONE_PROP_BEEP2, 400);
            h.postDelayed(() -> tg.startTone(ToneGenerator.TONE_PROP_BEEP2, 400), 600);
            h.postDelayed(() -> tg.startTone(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD, 500), 1200);
            h.postDelayed(tg::release, 2400);
        } catch (Exception ignored) { }
        // 2 · Vibración
        try {
            Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
            long[] pat = {0, 300, 120, 300, 120, 500};
            if (v != null) {
                AudioAttributes aa = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build();
                v.vibrate(VibrationEffect.createWaveform(pat, -1), aa);
            }
        } catch (Exception ignored) { }
        // 3 · Aviso visual (sin sonido propio: ya ha sonado arriba)
        try {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm.getNotificationChannel(CHANNEL) == null) {
                NotificationChannel ch = new NotificationChannel(CHANNEL, "Fin del descanso", NotificationManager.IMPORTANCE_HIGH);
                ch.setDescription("Aviso al terminar el descanso entre series (el sonido va por el volumen de alarma)");
                ch.setSound(null, null);
                ch.enableVibration(false);
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(ch);
            }
            Intent open = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
            PendingIntent pi = open == null ? null : PendingIntent.getActivity(ctx, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            Notification.Builder b = new Notification.Builder(ctx, CHANNEL)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle(title != null ? title : "Descanso terminado")
                .setContentText(body != null ? body : "A por la siguiente serie")
                .setCategory(Notification.CATEGORY_ALARM)
                .setAutoCancel(true)
                .setTimeoutAfter(120000)
                .setVisibility(Notification.VISIBILITY_PUBLIC);
            if (pi != null) b.setContentIntent(pi);
            nm.notify(NOTIF_ID, b.build());
        } catch (Exception ignored) { }
    }

    static void dismiss(Context ctx) {
        try { ((NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(NOTIF_ID); } catch (Exception ignored) { }
    }
}
