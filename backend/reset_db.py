import os
import sys
from pymongo import MongoClient
import certifi

# Add the current directory to sys.path so we can import local modules
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from services.auth_utils import get_password_hash

def main():
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
        db = client["attendance_db"]
        
        # 1. Delete all existing user accounts, face profiles, and attendances
        result = db.users.delete_many({})
        face_res = db.face_profiles.delete_many({})
        att_res = db.attendances.delete_many({})
        
        print(f"✅ Successfully deleted {result.deleted_count} existing user account(s).")
        print(f"✅ Successfully deleted {face_res.deleted_count} existing face profile(s).")
        print(f"✅ Successfully deleted {att_res.deleted_count} existing attendance record(s).")
        
        # 2. Add new default accounts
        password = "password123"
        hashed_pw = get_password_hash(password)
        
        new_users = [
            {
                "name": "Admin User",
                "email": "admin@smartattend.com",
                "hashed_password": hashed_pw,
                "role": "admin"
            },
            {
                "name": "Faculty User",
                "email": "teacher@smartattend.com",
                "hashed_password": hashed_pw,
                "role": "teacher"
            },
            {
                "name": "Student User",
                "email": "student@smartattend.com",
                "hashed_password": hashed_pw,
                "role": "student"
            }
        ]
        
        db.users.insert_many(new_users)
        print("✅ Successfully created 3 new accounts:")
        print("   - Admin: admin@smartattend.com (Role: admin)")
        print("   - Faculty: teacher@smartattend.com (Role: teacher)")
        print("   - Student: student@smartattend.com (Role: student)")
        print(f"   (Password for all new accounts is: '{password}')")
        
    except Exception as e:
        print(f"❌ Error connecting to or modifying the database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
