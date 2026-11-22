package es.peakphysique.app;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;

/**
 * Aviso de «quedan 20 s»: tres golpes secos de palos de madera, como la claqueta de los 10 últimos
 * segundos de un asalto de UFC. Se sintetiza aquí (sin archivos de audio) y suena por el canal de
 * ALARMA, igual que el fin del descanso, para que se oiga con el móvil en vibración y la pantalla apagada.
 */
final class Clapper {
    private static final int SR = 44100;
    private static final double[] HITS = {0.0, 0.22, 0.44};   // tres golpes, uno cada 0,22 s

    private Clapper() { }

    /** PCM mono 16 bits: ruido muy corto + dos resonancias de madera (≈1,9 y 3,1 kHz) que se apagan en ~15 ms. */
    static short[] pcm() {
        int len = (int) (SR * 0.75);
        double[] buf = new double[len];
        java.util.Random rnd = new java.util.Random(7);
        for (double start : HITS) {
            int s0 = (int) (start * SR);
            int n = (int) (SR * 0.09);
            for (int i = 0; i < n && s0 + i < len; i++) {
                double t = i / (double) SR;
                double crack = (rnd.nextDouble() * 2 - 1) * Math.exp(-t / 0.0025);
                double wood = (Math.sin(2 * Math.PI * 1900 * t) + 0.7 * Math.sin(2 * Math.PI * 3100 * t)
                        + 0.35 * Math.sin(2 * Math.PI * 820 * t)) * Math.exp(-t / 0.014);
                buf[s0 + i] += 0.55 * crack + 0.6 * wood;
            }
        }
        double peak = 1e-9;
        for (double v : buf) peak = Math.max(peak, Math.abs(v));
        short[] out = new short[len];
        for (int i = 0; i < len; i++) out[i] = (short) Math.round(buf[i] / peak * 0.92 * Short.MAX_VALUE);
        return out;
    }

    static void play(Context ctx) {
        try {
            short[] pcm = pcm();
            final AudioTrack tr = new AudioTrack.Builder()
                    .setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
                    .setAudioFormat(new AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(SR)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                    .setBufferSizeInBytes(pcm.length * 2)
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build();
            tr.write(pcm, 0, pcm.length);
            tr.play();
            new Handler(Looper.getMainLooper()).postDelayed(() -> { try { tr.stop(); } catch (Exception ignored) { } tr.release(); }, 1200);
        } catch (Exception e) {
            RestAlarmReceiver.log(ctx, "error aviso 20 s: " + e.getClass().getSimpleName());
        }
        try {
            Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null) v.vibrate(VibrationEffect.createWaveform(new long[]{0, 60, 160, 60, 160, 60}, -1),
                    new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build());
        } catch (Exception ignored) { }
    }
}
