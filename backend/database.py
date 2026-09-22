from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Файл базы данных создастся прямо в директории проекта
SQLALCHEMY_DATABASE_URL = "sqlite:///data/restaurant.db"

# connect_args={"check_same_thread": False} требуется только для SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Зависимость для получения сессии БД в эндпоинтах FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()