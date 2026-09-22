from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import OrderModel, OrderItemModel, DishModel, UserModel
from schemas import (
    UserRegisterSchema, UserLoginSchema, TokenSchema, UserResponseSchema,
    OrderCreateSchema, OrderResponseSchema, DishSchema
)
from auth import hash_password, verify_password, create_access_token, get_current_user

# Создаём таблицы в файле restaurant.db, если их ещё нет
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
origins = ["http://localhost:5500", "http://127.0.0.1:5500"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# РЕГИСТРАЦИЯ
@app.post("/register", response_model=UserResponseSchema)
def register(user_data: UserRegisterSchema, db: Session = Depends(get_db)):
    # Проверяем, нет ли уже пользователя с таким email
    existing_user = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким Email уже существует")

    # Хэшируем пароль перед сохранением в БД!
    new_user = UserModel(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        name=user_data.name,
        phone=user_data.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ВХОД (Авторизация)
@app.post("/login", response_model=TokenSchema)
def login(credentials: UserLoginSchema, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == credentials.email).first()
    
    # Проверяем существование юзера и совпадение хэша пароля
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )

    # Выдаем JWT токен
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


# ПОЛУЧЕНИЕ ПРОФИЛЯ (Защищённый эндпоинт)
@app.get("/me", response_model=UserResponseSchema)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user










# Эндпоинты для блюд (Каталог)
@app.get("/dishes", response_model=list[DishSchema])
def get_dishes(db: Session = Depends(get_db)):
    return db.query(DishModel).all()

@app.get("/dishes/{dish_id}", response_model=DishSchema)
def get_dish(dish_id: int, db: Session = Depends(get_db)):
    dish = db.query(DishModel).filter(DishModel.id == dish_id).first()
    if not dish:
        print(f"Dish with id {dish_id} not found in the database.")
        raise HTTPException(status_code=404, detail="Dish not found")
    return dish


# Эндпоинты для заказов
@app.get("/orders", response_model=list[OrderResponseSchema])
def read_orders(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    return db.query(OrderModel).filter(OrderModel.user_id == current_user.id).all()

@app.get("/orders/{order_id}", response_model=OrderResponseSchema)
def read_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order



@app.post("/orders", response_model=OrderResponseSchema,)
def create_order(order_data: OrderCreateSchema, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    new_order = OrderModel(
        address=order_data.address,
        user_id=current_user.id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order_data.items:
        db_item = OrderItemModel(
            order_id=new_order.id,
            dish_id=item.dish_id,
            quantity=item.quantity,
            price_at_order=db.query(DishModel).filter(DishModel.id == item.dish_id).first().price
        )
        db.add(db_item)

    db.commit()
    db.refresh(new_order)
    return new_order



@app.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}