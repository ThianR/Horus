import sqlite3
def fix_db():
    conn = sqlite3.connect('backend/data/oculus_db.db')
    conn.execute("UPDATE asignacion_turno SET fecha_inicio = fecha_inicio || ' 00:00:00.000' WHERE length(fecha_inicio) <= 10")
    conn.commit()
    print(conn.execute("SELECT fecha_inicio FROM asignacion_turno").fetchall())
fix_db()
