import json
import logging
from pathlib import Path
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.db_models import (
    User, Resource, Event, Service, Bookmark,
    RecommendationFeedback, PrivacyPreference, PrivacyOperation, AuditLog
)

logger = logging.getLogger("database_sync")

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
DB_FOLDER = ROOT_DIR / "database"
DATA_FOLDER = ROOT_DIR / "data" / "database_files"


class DatabaseSyncService:
    @classmethod
    def get_all_records(cls, db: Session) -> Dict[str, List[Dict[str, Any]]]:
        """Fetch all records from all 9 tables as clean dictionaries."""
        users = [u.to_dict() for u in db.query(User).all()]
        resources = [r.to_dict() for r in db.query(Resource).all()]
        events = [e.to_dict() for e in db.query(Event).all()]
        services = [s.to_dict() for s in db.query(Service).all()]
        bookmarks = [b.to_dict() for b in db.query(Bookmark).all()]
        feedback = [f.to_dict() for f in db.query(RecommendationFeedback).all()]
        privacy_prefs = [p.to_dict() for p in db.query(PrivacyPreference).all()]
        privacy_ops = [o.to_dict() for o in db.query(PrivacyOperation).all()]
        audit_logs = [a.to_dict() for a in db.query(AuditLog).all()]

        return {
            "users": users,
            "resources": resources,
            "events": events,
            "services": services,
            "bookmarks": bookmarks,
            "recommendation_feedback": feedback,
            "privacy_preferences": privacy_prefs,
            "privacy_operations": privacy_ops,
            "audit_logs": audit_logs
        }

    @classmethod
    def sync_to_json_files(cls, db: Session) -> Dict[str, int]:
        """Dump all database records to human-readable JSON files in the database/ folder."""
        data = cls.get_all_records(db)
        DB_FOLDER.mkdir(parents=True, exist_ok=True)
        DATA_FOLDER.mkdir(parents=True, exist_ok=True)

        counts = {}
        for table_name, rows in data.items():
            counts[table_name] = len(rows)
            json_content = json.dumps(rows, indent=2, default=str)
            
            # Write to database/<table_name>.json
            file_path = DB_FOLDER / f"{table_name}.json"
            file_path.write_text(json_content, encoding="utf-8")
            
            # Write duplicate to data/database_files/<table_name>.json for completeness
            (DATA_FOLDER / f"{table_name}.json").write_text(json_content, encoding="utf-8")

        # Also write consolidated master file
        master_path = DB_FOLDER / "all_database_tables.json"
        master_path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")

        # Generate standalone HTML viewer file
        cls.generate_html_viewer(data)
        logger.info(f"Database synced to readable files in: {DB_FOLDER}")
        return counts

    @classmethod
    def generate_html_viewer(cls, data: Dict[str, List[Dict[str, Any]]]):
        """Generate a standalone, zero-dependency visual database explorer HTML file."""
        json_data_str = json.dumps(data, default=str)

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>University Database Visual Explorer</title>
  <style>
    :root {{
      --bg: #0f172a;
      --card-bg: #1e293b;
      --border: #334155;
      --primary: #38bdf8;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --badge-bg: #0369a1;
      --hover: #2d3748;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }}
    body {{ background: var(--bg); color: var(--text); padding: 24px; min-height: 100vh; }}
    header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 24px; }}
    h1 {{ font-size: 24px; color: var(--primary); display: flex; align-items: center; gap: 10px; }}
    .subtitle {{ color: var(--text-muted); font-size: 14px; margin-top: 4px; }}
    .badge {{ background: var(--badge-bg); color: #fff; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }}
    .tabs {{ display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }}
    .tab-btn {{ background: var(--card-bg); border: 1px solid var(--border); color: var(--text); padding: 10px 18px; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }}
    .tab-btn:hover {{ background: var(--hover); }}
    .tab-btn.active {{ background: #0284c7; border-color: var(--primary); font-weight: bold; }}
    .toolbar {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; }}
    .search-input {{ flex: 1; max-width: 400px; background: var(--card-bg); border: 1px solid var(--border); color: #fff; padding: 10px 14px; border-radius: 8px; font-size: 14px; }}
    .search-input:focus {{ outline: none; border-color: var(--primary); }}
    .file-pill {{ font-size: 12px; color: var(--text-muted); background: #111827; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border); }}
    .table-container {{ background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; overflow-x: auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
    table {{ width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }}
    th {{ background: #1e293b; color: var(--primary); padding: 12px 16px; border-bottom: 2px solid var(--border); text-transform: uppercase; letter-spacing: 0.5px; font-size: 11px; }}
    td {{ padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: top; max-width: 320px; word-break: break-word; }}
    tr:hover td {{ background: rgba(56, 189, 248, 0.04); }}
    .empty {{ text-align: center; padding: 40px; color: var(--text-muted); }}
    .json-tag {{ font-family: monospace; font-size: 11px; background: #090d16; padding: 2px 6px; border-radius: 4px; color: #a5f3fc; }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>🗄️ University Database Visual Explorer</h1>
      <p class="subtitle">Secure Resource Recommendation System (SDG 4: Quality Education) &bull; Live Demonstrable Storage</p>
    </div>
    <div style="text-align: right;">
      <span class="badge">LIVE STORAGE ACTIVE</span>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Storage Path: <code>/database/*.json</code></div>
    </div>
  </header>

  <div class="tabs" id="tabs-container"></div>

  <div class="toolbar">
    <input type="text" id="search-input" class="search-input" placeholder="🔍 Search records in active table...">
    <div class="file-pill" id="file-pill">Storage File: database/users.json</div>
  </div>

  <div class="table-container">
    <div id="table-wrapper"></div>
  </div>

  <script>
    const database = {json_data_str};
    let currentTable = 'users';

    const tableDisplayNames = {{
      users: '👥 Users',
      resources: '📚 Academic Resources',
      events: '📅 Campus Events',
      services: '🏛️ Campus Services',
      bookmarks: '🔖 Bookmarks',
      recommendation_feedback: '⭐ Rec Feedback',
      privacy_preferences: '🔒 Privacy Preferences',
      privacy_operations: '🛡️ Cryptographic Ops',
      audit_logs: '📜 Security Audit Logs'
    }};

    function init() {{
      const tabsContainer = document.getElementById('tabs-container');
      tabsContainer.innerHTML = '';

      Object.keys(database).forEach((tbl, idx) => {{
        const btn = document.createElement('button');
        btn.className = 'tab-btn' + (tbl === currentTable ? ' active' : '');
        btn.innerHTML = `${{tableDisplayNames[tbl] || tbl}} <span class="badge" style="background:#0f172a; border: 1px solid var(--border);">${{database[tbl].length}}</span>`;
        btn.onclick = () => switchTable(tbl);
        tabsContainer.appendChild(btn);
      }});

      document.getElementById('search-input').addEventListener('input', (e) => renderTable(e.target.value));
      switchTable('users');
    }}

    function switchTable(tbl) {{
      currentTable = tbl;
      document.querySelectorAll('.tab-btn').forEach((btn, idx) => {{
        const key = Object.keys(database)[idx];
        if (key === tbl) btn.classList.add('active');
        else btn.classList.remove('active');
      }});
      document.getElementById('file-pill').innerText = `Storage File: database/${{tbl}}.json`;
      document.getElementById('search-input').value = '';
      renderTable('');
    }}

    function renderTable(searchTerm) {{
      const rows = database[currentTable] || [];
      const term = searchTerm.toLowerCase().trim();
      const filtered = term ? rows.filter(r => JSON.stringify(r).toLowerCase().includes(term)) : rows;

      const wrapper = document.getElementById('table-wrapper');
      if (filtered.length === 0) {{
        wrapper.innerHTML = '<div class="empty">No records found matching query.</div>';
        return;
      }}

      const columns = Object.keys(filtered[0]);
      let html = '<table><thead><tr>';
      columns.forEach(col => html += `<th>${{col}}</th>`);
      html += '</tr></thead><tbody>';

      filtered.forEach(row => {{
        html += '<tr>';
        columns.forEach(col => {{
          let val = row[col];
          if (typeof val === 'object' && val !== null) {{
            val = `<span class="json-tag">${{JSON.stringify(val)}}</span>`;
          }} else if (typeof val === 'string' && val.length > 80 && !val.startsWith('http')) {{
            val = val.substring(0, 80) + '...';
          }}
          html += `<td>${{val !== null && val !== undefined ? val : '<span style="color:#64748b;">null</span>'}}</td>`;
        }});
        html += '</tr>';
      }});

      html += '</tbody></table>';
      wrapper.innerHTML = html;
    }}

    init();
  </script>
</body>
</html>
"""
        # Save to database/DATABASE_VIEWER.html and data/DATABASE_VIEWER.html
        (DB_FOLDER / "DATABASE_VIEWER.html").write_text(html_content, encoding="utf-8")
        (DATA_FOLDER.parent / "DATABASE_VIEWER.html").write_text(html_content, encoding="utf-8")
