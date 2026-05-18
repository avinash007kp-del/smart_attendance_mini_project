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
        
        email = input("Enter Admin Email: ").strip()
        name = input("Enter Admin Name: ").strip()
        password = input("Enter Admin Password: ").strip()
        
        # Check if already exists
        if db.users.find_one({"email": email}):
            print("❌ User with this email already exists!")
            return
            
        hashed_password = get_password_hash(password)
        
        admin_user = {
            "email": email,
            "name": name,
            "role": "admin",
            "hashed_password": hashed_password
        }
        
        db.users.insert_one(admin_user)
        print(f"\n✅ Successfully created Real Admin Account for {name} ({email})!")
        print("You can now log in on your phone with these credentials.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
