from pymongo import MongoClient
import os
import re
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
if "<" in MONGO_URI and ">" in MONGO_URI:
    MONGO_URI = re.sub(r':<([^>]+)>@', r':\1@', MONGO_URI)

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

db = client["attendance_db"]

def get_db():
    yield db
