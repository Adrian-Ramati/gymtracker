// main.js — Arranque de la app.
// Arranque: se ejecuta al final, cuando todos los scripts ya están cargados.
// ═══ INIT ═══
// Hide nav and hdr initially

// Versión de la web. index.html lleva la misma en <meta name="pp-version">: si no coinciden, el HTML viene
// de una copia vieja (caché del navegador, de la app o del service worker) mientras los .js ya son nuevos
// —p. ej. faltaba el botón del candado—. Se recarga UNA vez saltándose cachés.
const WEB_V='2026-11-02a';
(function checkHtmlVersion(){
  const hv=document.querySelector('meta[name="pp-version"]')?.content||null;
  let tried=null;try{tried=sessionStorage.getItem('pp-vreload');}catch(e){}
  if(hv!==WEB_V&&tried!==WEB_V&&location.protocol.startsWith('http')){
    try{sessionStorage.setItem('pp-vreload',WEB_V);}catch(e){}
    location.replace(location.pathname+'?v='+WEB_V+location.hash);
  }
})();
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
