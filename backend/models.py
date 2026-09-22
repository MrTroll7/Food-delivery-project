from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)

    # Связь "Один ко многим": у одного пользователя может быть много заказов
    orders = relationship("OrderModel", back_populates="user")

class DishModel(Base):
    __tablename__ = "dishes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)  # Текущая цена в меню
    category = Column(String, nullable=False)
    image = Column(String, nullable=False)
    description = Column(String, nullable=True)  
    caloriesPerServing = Column(Integer, nullable=True) 
 

class OrderModel(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, nullable=False)
    created_at = Column(String, default="" + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    status = Column(String, default="в процессе") 

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("UserModel", back_populates="orders")

    items = relationship("OrderItemModel", back_populates="order", cascade="all, delete-orphan")


class OrderItemModel(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    dish_id = Column(Integer, ForeignKey("dishes.id"), nullable=False)
    
    quantity = Column(Integer, nullable=False)
    price_at_order = Column(Float, nullable=False)  # Фиксируем цену на момент покупки

    # Связи для удобного обращения в Python
    order = relationship("OrderModel", back_populates="items")
    dish = relationship("DishModel")