// main.js — Arranque de la app.
// Arranque: se ejecuta al final, cuando todos los scripts ya están cargados.
// ═══ INIT ═══
// Hide nav and hdr initially

// Wire login buttons properly (avoids timing issues with onclick)
// Script is at end of body so DOM is ready — wire directly
document.getElementById('btn-login').onclick = doLogin;
document.getElementById('btn-signup').onclick = doSignup;
document.getElementById('btn-local').onclick = skipLogin;
document.getElementById('login-password').addEventListener('keydown', e=>{if(e.key==='Enter')doLogin();});
initCal();
// Init Supabase and check for existing session
if(initSupabase()){
  sbClient.auth.getSession().then(async ({data:{session}})=>{
    if(session){
      await afterLogin(session.user);
    } else {
      // Show login screen
      // login-overlay already visible by default (no change needed)
    }
  });
} else {
  // No Supabase (config not set), go straight to local mode
  loadDB();showAppScreens();
}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
