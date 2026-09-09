"""The HR document vault.

Two kinds of document live here:

* a *link* — ``POST /upload`` stores nothing but a URL that already works;
* a *file* — ``POST /file`` takes multipart bytes, keeps them in
  ``document_files`` and serves them back from ``GET /{id}/file``.

The second kind is why this module owns a download route: the vault is not
public, so the bytes have to be handed out under the same rule as the metadata
(your own documents plus company-wide ones; managers see everything).
"""

import re
import uuid
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy import select

from app.api.deps import (
    CurrentAdmin,
    CurrentManager,
    CurrentUser,
    DatabaseSession,
    _role_slug,
    is_admin,
)
from app.core.rbac import ROLE_EXEC, ROLE_TEAM_LEAD
from app.models.document import Document
from app.models.document_file import DocumentFile
from app.models.document_response import DocumentResponse
from app.models.employee import Employee
from app.models.user import User
from app.schemas.document import (
    DocumentCreate,
    DocumentRead,
    DocumentResponseCreate,
    DocumentResponseRead,
)

router = APIRouter(tags=["documents"])

# Bytes land in Postgres, so the cap is deliberately modest: anything big
# belongs behind a link rather than in the database this API also serves pages
# from.
MAX_UPLOAD_BYTES = 15 * 1024 * 1024

# document_id -> (file_name, mime_type, size_bytes)
FileMeta = dict[uuid.UUID, tuple[str, str, int]]

def _file_meta(db: DatabaseSession, doc_ids: List[uuid.UUID]) -> FileMeta:
    """Look up file details for many documents at once — never the bytes.

    Selecting individual columns keeps ``content`` out of the query, which is the
    whole reason the blobs live in their own table.
    """
    if not doc_ids:
        return {}
    rows = db.execute(
        select(
            DocumentFile.document_id,
            DocumentFile.file_name,
            DocumentFile.mime_type,
            DocumentFile.size_bytes,
        ).where(DocumentFile.document_id.in_(doc_ids))
    ).all()
    return {row[0]: (row[1], row[2], row[3]) for row in rows}


def _to_response_read(r: DocumentResponse) -> DocumentResponseRead:
    user_name = f"{r.user.first_name} {r.user.last_name}".strip() if r.user else None
    return DocumentResponseRead(
        id=r.id,
        document_id=r.document_id,
        user_id=r.user_id,
        user_name=user_name or (r.user.email if r.user else None),
        user_email=r.user.email if r.user else None,
        status=r.status,
        note=r.note,
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


def _to_read(
    doc: Document,
    meta: FileMeta,
    *,
    with_names: bool = False,
    for_user_id: Optional[uuid.UUID] = None,
    with_responses: bool = False,
) -> DocumentRead:
    file_meta = meta.get(doc.id)

    my_response: Optional[DocumentResponseRead] = None
    response_counts: Optional[dict[str, int]] = None
    responses_list: Optional[list[DocumentResponseRead]] = None

    if doc.requires_action and doc.responses is not None:
        counts = {"agreed": 0, "disagreed": 0, "review_requested": 0, "total": 0}
        for r in doc.responses:
            if r.status in counts:
                counts[r.status] += 1
            counts["total"] += 1
            if for_user_id and r.user_id == for_user_id:
                my_response = _to_response_read(r)
        response_counts = counts
        if with_responses:
            responses_list = [
                _to_response_read(r)
                for r in sorted(doc.responses, key=lambda x: x.created_at, reverse=True)
            ]
    elif for_user_id and doc.responses is not None:
        for r in doc.responses:
            if r.user_id == for_user_id:
                my_response = _to_response_read(r)
                break

    return DocumentRead(
        id=doc.id,
        title=doc.title,
        file_url=doc.file_url,
        document_type=doc.document_type,
        requires_action=doc.requires_action,
        action_note=doc.action_note,
        uploaded_by_id=doc.uploaded_by_id,
        employee_id=doc.employee_id,
        created_at=doc.created_at,
        uploaded_by_name=(
            f"{doc.uploaded_by.first_name} {doc.uploaded_by.last_name}".strip()
            if with_names and doc.uploaded_by
            else None
        ),
        employee_name=(
            f"{doc.employee.user.first_name} {doc.employee.user.last_name}".strip()
            if with_names and doc.employee and doc.employee.user
            else None
        ),
        file_name=file_meta[0] if file_meta else None,
        mime_type=file_meta[1] if file_meta else None,
        size_bytes=file_meta[2] if file_meta else None,
        my_response=my_response,
        response_counts=response_counts,
        responses=responses_list,
    )


def _may_read(db: DatabaseSession, user: User, doc: Document) -> bool:
    """Managers get the whole vault; everyone else gets company-wide documents
    plus the ones filed against their own employee record."""
    if is_admin(user) or _role_slug(user) in {ROLE_EXEC, ROLE_TEAM_LEAD}:
        return True
    if doc.employee_id is None:
        return True
    employee = db.scalar(select(Employee).where(Employee.user_id == user.id))
    return bool(employee and employee.id == doc.employee_id)


@router.post("/upload", response_model=DocumentRead)
def upload_document(
    payload: DocumentCreate, db: DatabaseSession, current_admin: CurrentAdmin
) -> DocumentRead:
    """Register a document that already lives somewhere else."""
    doc = Document(
        title=payload.title,
        file_url=payload.file_url,
        document_type=payload.document_type,
        requires_action=payload.requires_action,
        action_note=payload.action_note,
        uploaded_by_id=current_admin.id,
        employee_id=payload.employee_id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _to_read(doc, {}, with_names=True)


@router.post("/file", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document_file(
    db: DatabaseSession,
    current_admin: CurrentAdmin,
    file: UploadFile = File(...),
    title: str = Form(""),
    document_type: str = Form("other", alias="documentType"),
    employee_id: Optional[str] = Form(None, alias="employeeId"),
    requires_action: bool = Form(False, alias="requiresAction"),
    action_note: Optional[str] = Form(None, alias="actionNote"),
) -> DocumentRead:
    """Store a real file in the vault.

    ``file_url`` is filled in with this API's own download path, so the portal
    can treat uploaded files and external links identically.
    """
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="The selected file is empty."
        )
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File is larger than the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.",
        )

    # A browser sends an unset <select> as "", which is not a UUID — treat any
    # blank as "company-wide" instead of failing validation.
    assigned_to: Optional[uuid.UUID] = None
    if employee_id and employee_id.strip():
        try:
            assigned_to = uuid.UUID(employee_id.strip())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid employee id"
            )
        if db.get(Employee, assigned_to) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
            )

    doc = Document(
        title=title.strip() or (file.filename or "Untitled document"),
        file_url="",
        document_type=document_type or "other",
        requires_action=requires_action,
        action_note=action_note.strip() if action_note and action_note.strip() else None,
        uploaded_by_id=current_admin.id,
        employee_id=assigned_to,
    )
    db.add(doc)
    db.flush()  # assigns doc.id, which the download URL is built from
    doc.file_url = f"/documents/{doc.id}/file"
    db.add(
        DocumentFile(
            document_id=doc.id,
            file_name=file.filename or "document",
            mime_type=file.content_type or "application/octet-stream",
            size_bytes=len(content),
            content=content,
        )
    )
    db.commit()
    db.refresh(doc)
    return _to_read(doc, _file_meta(db, [doc.id]), with_names=True)


@router.get("/admin", response_model=List[DocumentRead])
def get_all_documents(db: DatabaseSession, current_manager: CurrentManager) -> List[DocumentRead]:
    records = db.scalars(select(Document).order_by(Document.created_at.desc())).all()
    meta = _file_meta(db, [r.id for r in records])
    return [_to_read(r, meta, with_names=True, with_responses=True) for r in records]


@router.get("/me", response_model=List[DocumentRead])
def get_my_documents(db: DatabaseSession, current_user: CurrentUser) -> List[DocumentRead]:
    """Everything filed against me, plus company-wide documents.

    A user without an employee profile still sees the company-wide set — being
    unmapped means "no personal documents", not "no access".
    """
    employee = db.scalar(select(Employee).where(Employee.user_id == current_user.id))
    condition = Document.employee_id.is_(None)
    if employee is not None:
        condition = condition | (Document.employee_id == employee.id)

    records = db.scalars(
        select(Document).where(condition).order_by(Document.created_at.desc())
    ).all()
    meta = _file_meta(db, [r.id for r in records])
    return [_to_read(r, meta, with_names=True, for_user_id=current_user.id) for r in records]


@router.post("/{document_id}/response", response_model=DocumentResponseRead)
def respond_to_document(
    document_id: uuid.UUID,
    payload: DocumentResponseCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> DocumentResponseRead:
    """Submit agreement, disagreement, or a review request on a vault document."""
    doc = db.get(Document, document_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if not _may_read(db, current_user, doc):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this document",
        )
    valid_statuses = {"agreed", "disagreed", "review_requested"}
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of: {', '.join(valid_statuses)}",
        )

    existing = db.scalar(
        select(DocumentResponse).where(
            DocumentResponse.document_id == document_id,
            DocumentResponse.user_id == current_user.id,
        )
    )
    if existing:
        existing.status = payload.status
        existing.note = payload.note.strip() if payload.note and payload.note.strip() else None
        record = existing
    else:
        record = DocumentResponse(
            document_id=document_id,
            user_id=current_user.id,
            status=payload.status,
            note=payload.note.strip() if payload.note and payload.note.strip() else None,
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return _to_response_read(record)


@router.get("/{document_id}/responses", response_model=List[DocumentResponseRead])
def get_document_responses(
    document_id: uuid.UUID,
    db: DatabaseSession,
    current_manager: CurrentManager,
) -> List[DocumentResponseRead]:
    """Retrieve all employee responses and feedback notes for a vault document."""
    doc = db.get(Document, document_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    records = db.scalars(
        select(DocumentResponse)
        .where(DocumentResponse.document_id == document_id)
        .order_by(DocumentResponse.created_at.desc())
    ).all()
    return [_to_response_read(r) for r in records]


@router.get("/{document_id}/file")
def download_document_file(
    document_id: uuid.UUID, db: DatabaseSession, current_user: CurrentUser
) -> Response:
    doc = db.get(Document, document_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if not _may_read(db, current_user, doc):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this document",
        )
    blob = db.get(DocumentFile, document_id)
    if blob is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This document is a link, not a stored file",
        )

    # The name goes straight into a response header, so strip anything that
    # could terminate the quoted string or the header itself.
    safe_name = re.sub(r'[\r\n"\\]+', "_", blob.file_name or "document")
    return Response(
        content=blob.content,
        media_type=blob.mime_type or "application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}"',
            "Content-Length": str(len(blob.content)),
        },
    )


@router.delete("/{document_id}")
def delete_document(
    document_id: uuid.UUID, db: DatabaseSession, current_admin: CurrentAdmin
) -> dict:
    doc = db.get(Document, document_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    db.delete(doc)  # the document_files row goes with it (FK ON DELETE CASCADE)
    db.commit()
    return {"id": str(document_id)}
