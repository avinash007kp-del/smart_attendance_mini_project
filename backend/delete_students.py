from pymongo import MongoClient
import sys
try:
    db = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)['smart_attendance']
    res_users = db.users.delete_many({'role': 'student'})
    res_faces = db.face_profiles.delete_many({}) # Delete all face profiles or specifically for students
    print(f"Deleted {res_users.deleted_count} student accounts and {res_faces.deleted_count} face profiles.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
