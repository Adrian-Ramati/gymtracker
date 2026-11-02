package es.peakphysique.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;

/**
 * Cuenta atrás del descanso en un servicio en primer plano.
 * Con la app en segundo plano y la pantalla bloqueada, Android (y sobre todo HyperOS/MIUI) congela el
 * proceso y la alarma solo llegaba al volver a abrir la app. Un servicio en primer plano no se congela:
 * muestra la cuenta atrás en la notificación (también en la pantalla de bloqueo) y, al llegar a cero,
 * suena por el canal de alarma. AlarmManager.setAlarmClock queda de respaldo (RestAlarmReceiver) y
 * RestAlarmReceiver.ringOnce evita que suene dos veces.
 */
public class RestTimerService extends Service {
    static final String CHANNEL = "rest-countdown";
    static final int NOTIF_ID = 7003;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private PowerManager.WakeLock wakeLock;
    private long endTs = 0;
    private final Runnable fire = () -> {
        RestAlarmReceiver.ringOnce(this, endTs, "Descanso terminado", "A por la siguiente serie");
        stopSelfClean();
    };

    static void start(Context ctx, long endTs) {
        Intent i = new Intent(ctx, RestTimerService.class).putExtra("endTs", endTs);
        if (Build.VERSION.SDK_INT >= 26) ctx.startForegroundService(i); else ctx.startService(i);
    }

    static void stop(Context ctx) {
        ctx.stopService(new Intent(ctx, RestTimerService.class));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        long e = intent != null ? intent.getLongExtra("endTs", 0) : 0;
        if (e <= System.currentTimeMillis()) { stopSelfClean(); return START_NOT_STICKY; }
        endTs = e;
        Notification n = buildNotification(endTs);
        if (Build.VERSION.SDK_INT >= 34) startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(NOTIF_ID, n);
        // CPU despierta solo durante el descanso (como mucho 6 min) para que la cuenta atrás no se pare
        try {
            if (wakeLock == null) {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "peak:rest");
                wakeLock.setReferenceCounted(false);
            }
            wakeLock.acquire(Math.min(6 * 60_000L, endTs - System.currentTimeMillis() + 15_000L));
        } catch (Exception ignored) { }
        handler.removeCallbacks(fire);
        handler.postDelayed(fire, Math.max(0, endTs - System.currentTimeMillis()));
        return START_NOT_STICKY;
    }

    private Notification buildNotification(long end) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm.getNotificationChannel(CHANNEL) == null) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Cuenta atrás del descanso", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("Tiempo que queda de descanso (silencioso; al terminar suena la alarma)");
            ch.setSound(null, null);
            ch.enableVibration(false);
            ch.setShowBadge(false);
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
        }
        Intent open = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent pi = open == null ? null : PendingIntent.getActivity(this, 1, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = new Notification.Builder(this, CHANNEL)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Descansando")
            .setContentText("Suena al terminar")
            .setWhen(end)
            .setShowWhen(true)
            .setUsesChronometer(true)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setCategory(Notification.CATEGORY_STOPWATCH)
            .setVisibility(Notification.VISIBILITY_PUBLIC);
        if (Build.VERSION.SDK_INT >= 24) b.setChronometerCountDown(true);
        if (pi != null) b.setContentIntent(pi);
        if (Build.VERSION.SDK_INT >= 31) b.setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE);
        return b.build();
    }

    private void stopSelfClean() {
        handler.removeCallbacks(fire);
        try { if (wakeLock != null && wakeLock.isHeld()) wakeLock.release(); } catch (Exception ignored) { }
        if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE); else stopForeground(true);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(fire);
        try { if (wakeLock != null && wakeLock.isHeld()) wakeLock.release(); } catch (Exception ignored) { }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
