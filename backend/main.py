from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from . import models  # tu backend/models.py (define MediaHabit y usa Base desde db.py)
from .db import SessionLocal, init_db
from .schemas import MediaHabitCreate, MediaHabitOut
import os

app = FastAPI(title="Ibagué Digital - Encuestas")

# inicializar DB
init_db()

# dependecia de sesión
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API CRUD básico
@app.post("/api/respondents", response_model=MediaHabitOut)
def create_respondent(payload: MediaHabitCreate, db: Session = Depends(get_db)):
    obj = models.MediaHabit(
        respondent_name=payload.respondent_name,
        age=payload.age,
        city=payload.city,
        primary_media=payload.primary_media,
        hours_per_day=payload.hours_per_day,
        comments=payload.comments
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@app.get("/api/respondents")
def list_respondents(db: Session = Depends(get_db)):
    rows = db.query(models.MediaHabit).order_by(models.MediaHabit.created_at.desc()).all()
    return rows

@app.get("/api/respondents/{item_id}", response_model=MediaHabitOut)
def get_respondent(item_id: int, db: Session = Depends(get_db)):
    row = db.query(models.MediaHabit).filter(models.MediaHabit.id == item_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="No encontrado")
    return row

# Admin simple: HTML que consume /api/respondents
# asegurar que existan carpetas necesarias
os.makedirs("backend/static", exist_ok=True)
os.makedirs("backend/templates", exist_ok=True)

templates = Jinja2Templates(directory="backend/templates")
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

@app.get("/admin", response_class=HTMLResponse)
def admin_page(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})    <!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>Admin - Ibagué Digital</title>
      <link rel="stylesheet" href="/static/main.css">
    </head>
    <body>
      <div class="container">
        <h1>Registros de encuestas</h1>
    
        <div class="controls">
          <input id="filter" placeholder="Filtrar por nombre o ciudad..." />
          <button id="refresh">Refrescar</button>
          <button id="exportCsv">Exportar CSV</button>
        </div>
    
        <table id="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Edad</th>
              <th>Ciudad</th>
              <th>Medio</th>
              <th>Horas/día</th>
              <th>Comentarios</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    
      <script>
        async function load() {
          const res = await fetch('/api/respondents');
          const data = await res.json();
          window._data = data;
          render(data);
        }
    
        function render(list) {
          const tbody = document.querySelector('#tbl tbody');
          tbody.innerHTML = '';
          list.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = [
              `<td>${r.id}</td>`,
              `<td>${(r.respondent_name||'').replace(/</g,'&lt;')}</td>`,
              `<td>${r.age}</td>`,
              `<td>${(r.city||'').replace(/</g,'&lt;')}</td>`,
              `<td>${(r.primary_media||'').replace(/</g,'&lt;')}</td>`,
              `<td>${r.hours_per_day}</td>`,
              `<td>${(r.comments||'').replace(/</g,'&lt;')}</td>`,
              `<td>${r.created_at || ''}</td>`
            ].join('');
            tbody.appendChild(tr);
          });
        }
    
        document.getElementById('refresh').addEventListener('click', load);
        document.getElementById('filter').addEventListener('input', function() {
          const q = this.value.toLowerCase();
          const filtered = (window._data || []).filter(x =>
            (x.respondent_name||'').toLowerCase().includes(q) ||
            (x.city||'').toLowerCase().includes(q)
          );
          render(filtered);
        });
    
        document.getElementById('exportCsv').addEventListener('click', function() {
          const data = window._data || [];
          let csv = 'id,nombre,edad,ciudad,medio,horas,comentarios,creado\\n';
          data.forEach(r => {
            const vals = [
              r.id,
              `"${(r.respondent_name||'').replace(/"/g,'""')}"`,
              r.age,
              `"${(r.city||'').replace(/"/g,'""')}"`,
              `"${(r.primary_media||'').replace(/"/g,'""')}"`,
              r.hours_per_day,
              `"${(r.comments||'').replace(/"/g,'""')}"`,
              `"${r.created_at||''}"`
            ];
            csv += vals.join(',') + '\\n';
          });
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'encuestas.csv';
          a.click();
          URL.revokeObjectURL(url);
        });
    
        // carga inicial
        load();
      </script>
    </body>
    </html>