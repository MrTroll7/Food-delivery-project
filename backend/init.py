import os
import requests
from database import SessionLocal, engine, Base
from models import DishModel

# 1. Проверяем и создаём структуру папок: static/images/
STATIC_DIR = os.path.join("static", "images")
os.makedirs(STATIC_DIR, exist_ok=True)

# Убеждаемся, что таблицы в БД созданы
Base.metadata.create_all(bind=engine)


def seed_dishes():
    db = SessionLocal()

    # Если база уже заполнена, не дублируем
    if db.query(DishModel).count() > 0:
        print("База данных уже содержит блюда.")
        db.close()
        return

    print("Загрузка данных из API и скачивание изображений...")
    try:
        response = requests.get("https://dummyjson.com/recipes")
        response.raise_for_status()
        recipes = response.json().get("recipes", [])

        for item in recipes:
            recipe_id = item["id"]
            external_image_url = item.get("image")

            # Имя файла на сервере и путь для сохранения на диск
            filename = f"dish_{recipe_id}.jpg"
            file_save_path = os.path.join(STATIC_DIR, filename)

            # Относительная ссылка, которая будет записана в БД
            db_image_path = f"/static/images/{filename}"

            # 2. Скачиваем картинку в бинарном режиме
            if external_image_url:
                try:
                    img_response = requests.get(external_image_url, timeout=10)
                    if img_response.status_code == 200:
                        with open(file_save_path, "wb") as f:
                            f.write(img_response.content)
                        print(f" Успешно скачано: {filename}")
                    else:
                        db_image_path = "/static/images/default.jpg"
                except Exception as e:
                    print(f" Не удалось скачать картинку для {item['name']}: {e}")
                    db_image_path = "/static/images/default.jpg"

            # 3. Записываем объект блюда в БД с локальным путем
            dish = DishModel(
                title=item["name"],
                price=float(item.get("prepTimeMinutes", 15) * 20 + 200),
                description="Состав: "
                + ", ".join(item.get("ingredients", [])[:4]),
                category=item.get("cuisine", "Общее"),
                image=db_image_path,  # Теперь здесь локальный путь!
            )
            db.add(dish)

        db.commit()
        print(f"\n Готово! Добавлено блюд: {len(recipes)}.")

    except Exception as e:
        print(f"Ошибка при выполнении скрипта: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_dishes()