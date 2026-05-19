from fastapi import APIRouter, Depends, HTTPException
from pymongo.database import Database
from database import get_db
import datetime

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("/")
def get_all_assignments(db: Database = Depends(get_db)):
    docs = list(db["assignments"].find().sort("created_at", -1))
    for d in docs:
        d["_id"] = str(d["_id"])
        if isinstance(d.get("created_at"), datetime.datetime):
            d["created_at"] = d["created_at"].isoformat()
    return docs


@router.post("/")
def create_assignment(payload: dict, db: Database = Depends(get_db)):
    doc = {
        "title":       payload.get("title", "").strip(),
        "course":      payload.get("course", "").strip(),
        "description": payload.get("description", ""),
        "due_date":    payload.get("due_date", ""),
        "marks":       payload.get("marks", ""),
        "faculty":     payload.get("faculty", ""),
        "created_at":  datetime.datetime.utcnow(),
    }
    if not doc["title"] or not doc["course"]:
        raise HTTPException(status_code=400, detail="Title and course are required")
    res = db["assignments"].insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    doc["created_at"] = doc["created_at"].isoformat()
    return doc


@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: str, db: Database = Depends(get_db)):
    from bson import ObjectId
    result = db["assignments"].delete_one({"_id": ObjectId(assignment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"detail": "Deleted"}
