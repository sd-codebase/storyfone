from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from nanoid import generate as nanoid
from pymongo import ReturnDocument

from db import get_db
from schemas import ProjectCreate, ProjectUpdate, ProjectOut, ProjectListItem

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.post("", response_model=ProjectOut)
async def create_project(body: ProjectCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "_id": nanoid(),
        "name": body.name,
        "chapter_json": body.chapter_json,
        "created_at": now,
        "updated_at": now,
    }
    await db.projects.insert_one(doc)
    return _doc_to_out(doc)


@router.get("", response_model=list[ProjectListItem])
async def list_projects(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db.projects.find(
        {}, {"_id": 1, "name": 1, "created_at": 1, "updated_at": 1}
    ).sort("updated_at", -1)
    docs = await cursor.to_list(length=200)
    return [
        ProjectListItem(id=d["_id"], name=d["name"], created_at=d["created_at"], updated_at=d["updated_at"])
        for d in docs
    ]


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    doc = await db.projects.find_one({"_id": project_id})
    if not doc:
        raise HTTPException(404, "Project not found")
    return _doc_to_out(doc)


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: str,
    body: ProjectUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    updates: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if body.name is not None:
        updates["name"] = body.name
    if body.chapter_json is not None:
        updates["chapter_json"] = body.chapter_json

    result = await db.projects.find_one_and_update(
        {"_id": project_id},
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(404, "Project not found")
    return _doc_to_out(result)


@router.delete("/{project_id}")
async def delete_project(project_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    result = await db.projects.delete_one({"_id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Project not found")
    return {"ok": True}


def _doc_to_out(doc: dict) -> ProjectOut:
    return ProjectOut(
        id=doc["_id"],
        name=doc["name"],
        chapter_json=doc["chapter_json"],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )
