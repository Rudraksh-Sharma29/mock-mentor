import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

# Resolve database file path reliably regardless of cwd
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # backend dir
ROOT_DIR = os.path.dirname(BASE_DIR)

db_root = os.path.join(ROOT_DIR, "interview.db")
db_backend = os.path.join(BASE_DIR, "interview.db")

if os.path.exists(db_root):
    selected_db = db_root
elif os.path.exists(db_backend):
    selected_db = db_backend
else:
    selected_db = db_root

default_sqlite_url = f"sqlite:///{selected_db.replace(os.sep, '/')}"
DATABASE_URL = os.getenv("DATABASE_URL", default_sqlite_url)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)

    # SQLite lightweight auto-migration for existing tables
    if DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            # Check interviews table columns
            try:
                res = conn.execute(text("PRAGMA table_info(interviews)")).fetchall()
                existing_cols = [row[1] for row in res]
                if "resume_id" not in existing_cols:
                    conn.execute(text("ALTER TABLE interviews ADD COLUMN resume_id INTEGER REFERENCES resumes(id)"))
                if "status" not in existing_cols:
                    conn.execute(text("ALTER TABLE interviews ADD COLUMN status VARCHAR DEFAULT 'completed'"))
                if "duration_seconds" not in existing_cols:
                    conn.execute(text("ALTER TABLE interviews ADD COLUMN duration_seconds INTEGER DEFAULT 0"))
                if "strategy_config" not in existing_cols:
                    conn.execute(text("ALTER TABLE interviews ADD COLUMN strategy_config TEXT"))
                conn.commit()
            except Exception as e:
                print(f"[DB Auto-Migration] Note: {e}")
