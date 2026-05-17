from pymongo import MongoClient
import os
import certifi

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

db = client["attendance_db"]

def get_db():
    yield db
