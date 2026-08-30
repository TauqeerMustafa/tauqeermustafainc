from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from typing import List

from app.api.deps import CurrentUser, DatabaseSession, CurrentAdmin
from app.models.document import Document
from app.models.employee import Employee
from app.schemas.document import DocumentCreate, DocumentRead

router = APIRouter(tags=["documents"])

def get_current_employee(db: DatabaseSession, user_id: UUID) -> Employee:
    employee = db.scalar(select(Employee).where(Employee.user_id == user_id))
    if not employee:
        raise HTTPException(status_code=403, detail="Current user is not mapped to an employee profile")
    return employee

@router.post("/upload", response_model=DocumentRead)
def upload_document(payload: DocumentCreate, db: DatabaseSession, current_admin: CurrentAdmin):
    doc = Document(
        title=payload.title,
        file_url=payload.file_url,
        document_type=payload.document_type,
        uploaded_by_id=current_admin.id,
        employee_id=payload.employee_id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    return DocumentRead(
        id=doc.id,
        title=doc.title,
        file_url=doc.file_url,
        document_type=doc.document_type,
        uploaded_by_id=doc.uploaded_by_id,
        employee_id=doc.employee_id,
        created_at=doc.created_at,
        uploaded_by_name=f"{current_admin.first_name} {current_admin.last_name}"
    )

@router.get("/admin", response_model=List[DocumentRead])
def get_all_documents(db: DatabaseSession, current_admin: CurrentAdmin):
    records = db.scalars(select(Document).order_by(Document.created_at.desc())).all()
    
    return [
        DocumentRead(
            id=r.id,
            title=r.title,
            file_url=r.file_url,
            document_type=r.document_type,
            uploaded_by_id=r.uploaded_by_id,
            employee_id=r.employee_id,
            created_at=r.created_at,
            uploaded_by_name=f"{r.uploaded_by.first_name} {r.uploaded_by.last_name}" if r.uploaded_by else None,
            employee_name=f"{r.employee.user.first_name} {r.employee.user.last_name}" if r.employee and r.employee.user else None
        ) for r in records
    ]

@router.get("/me", response_model=List[DocumentRead])
def get_my_documents(db: DatabaseSession, current_user: CurrentUser):
    employee = get_current_employee(db, current_user.id)
    # Employees can see docs assigned to them OR general policies (employee_id is None)
    records = db.scalars(
        select(Document)
        .where((Document.employee_id == employee.id) | (Document.employee_id == None))
        .order_by(Document.created_at.desc())
    ).all()
    
    return [
        DocumentRead(
            id=r.id,
            title=r.title,
            file_url=r.file_url,
            document_type=r.document_type,
            uploaded_by_id=r.uploaded_by_id,
            employee_id=r.employee_id,
            created_at=r.created_at
        ) for r in records
    ]
