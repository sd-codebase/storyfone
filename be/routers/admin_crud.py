from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Type

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from nanoid import generate as nanoid
from pydantic import BaseModel
from pymongo import ReturnDocument

from db import get_db


def make_crud_router(
    *,
    prefix: str,
    tag: str,
    collection_name: str,
    create_model: Type[BaseModel],
    update_model: Type[BaseModel],
    out_model: Type[BaseModel],
    doc_to_out: Callable[[Dict[str, Any]], BaseModel],
    pre_insert: Optional[Callable[[Dict[str, Any]], Dict[str, Any]]] = None,
    pre_update: Optional[Callable[[Dict[str, Any]], Dict[str, Any]]] = None,
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=[tag])

    @router.get("", response_model=List[out_model])  # type: ignore[valid-type]
    async def list_items(db: AsyncIOMotorDatabase = Depends(get_db)):
        cursor = db[collection_name].find().sort("created_at", -1)
        docs = await cursor.to_list(length=500)
        return [doc_to_out(d) for d in docs]

    @router.get("/{item_id}", response_model=out_model)  # type: ignore[valid-type]
    async def get_item(item_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
        doc = await db[collection_name].find_one({"_id": item_id})
        if not doc:
            raise HTTPException(404, f"{tag} not found")
        return doc_to_out(doc)

    @router.post("", response_model=out_model, status_code=201)  # type: ignore[valid-type]
    async def create_item(body: create_model, db: AsyncIOMotorDatabase = Depends(get_db)):  # type: ignore[valid-type]
        now = datetime.now(timezone.utc).isoformat()
        doc: Dict[str, Any] = {
            "_id": nanoid(),
            **body.model_dump(),
            "created_at": now,
            "updated_at": now,
        }
        if pre_insert:
            doc = pre_insert(doc)
        await db[collection_name].insert_one(doc)
        return doc_to_out(doc)

    @router.put("/{item_id}", response_model=out_model)  # type: ignore[valid-type]
    async def update_item(
        item_id: str,
        body: update_model,  # type: ignore[valid-type]
        db: AsyncIOMotorDatabase = Depends(get_db),
    ):
        updates: Dict[str, Any] = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        for key, value in body.model_dump(exclude_unset=True).items():
            updates[key] = value
        if pre_update:
            updates = pre_update(updates)
        result = await db[collection_name].find_one_and_update(
            {"_id": item_id},
            {"$set": updates},
            return_document=ReturnDocument.AFTER,
        )
        if not result:
            raise HTTPException(404, f"{tag} not found")
        return doc_to_out(result)

    @router.delete("/{item_id}")
    async def delete_item(item_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
        result = await db[collection_name].delete_one({"_id": item_id})
        if result.deleted_count == 0:
            raise HTTPException(404, f"{tag} not found")
        return {"ok": True}

    return router
