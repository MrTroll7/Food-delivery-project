from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List

# Данные для регистрации
class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not v.isascii():
            raise ValueError('Пароль должен содержать только латинские буквы, цифры и спецсимволы')
        if len(v) < 6:
            raise ValueError('Пароль должен быть не менее 6 символов')
        return v

# Данные для входа
class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

# Ответ при успешном входе
class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Публичный профиль пользователя (БЕЗ пароля)
class UserResponseSchema(BaseModel):
    id: int
    email: str
    name: str
    phone: Optional[str] = None
    class Config:
        from_attributes = True

class OrderItemSchema(BaseModel):
    dish_id: int
    quantity: int
    class Config:
        from_attributes = True

class OrderCreateSchema(BaseModel):
    address: str
    items: list[OrderItemSchema]

class OrderResponseSchema(BaseModel):
    id: int
    address: str
    items: list[OrderItemSchema]
    created_at: str
    status: str

    class Config:
        from_attributes = True

class DishSchema(BaseModel):
    id: int
    title: str
    price: float
    description: str | None = None
    category: str
    caloriesPerServing: int | None = None
    image: str

    class Config:
        from_attributes = True