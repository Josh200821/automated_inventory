
import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://neondb_owner:npg_bU7yIuM8SrlX@ep-divine-voice-adg3oayt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = False 
    JWT_SECRET_KEY = "d9c8e46f8e4543d78c6161ab0a977ad5d9dcb9c2057e4e81a0d52e6b6a1d8b5b"