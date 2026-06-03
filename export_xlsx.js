// Standalone XLSX export script - embedded in app
// Uses SheetJS (loaded from CDN in app)
function exportToXLSX(db, profile) {
  const sessions = db.sessions || [];
  const rows = [['Fecha','Sesión','Ejercicio','Músculo','Serie','KG','Reps','RPE','e1RM (kg)','Notas']];
  sessions.forEach(s => {
    (s.exercises || []).forEach(ex => {
      (ex.sets || []).forEach((set, si) => {
        if(set.kg || set.reps) {
          const rir = set.rpe != null ? 10 - set.rpe : null;
          const e1rm = (set.kg && set.reps) ? 
            (rir != null ? Math.round(set.kg*(1+(set.reps+rir)/30)*10)/10 : Math.round(set.kg*(1+set.reps/30)*10)/10) : null;
          rows.push([s.date, s.name||s.dayName, ex.name, ex.muscle, si+1, set.kg||'', set.reps||'', set.rpe||'', e1rm||'', ex.notes||'']);
        }
      });
    });
  });
  return rows;
}
