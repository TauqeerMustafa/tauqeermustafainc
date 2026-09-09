import uuid
from datetime import datetime
from typing import Optional

from app.schemas.common import CamelModel


class DocumentResponseCreate(CamelModel):
    status: str  # "agreed", "disagreed", "review_requested"
    note: Optional[str] = None


class DocumentResponseRead(CamelModel):
    id: uuid.UUID
    document_id: uuid.UUID
    user_id: uuid.UUID
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    status: str
    note: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DocumentCreate(CamelModel):
    title: str
    file_url: str
    document_type: str = "other"
    employee_id: Optional[uuid.UUID] = None
    requires_action: bool = False
    action_note: Optional[str] = None


class DocumentRead(CamelModel):
    id: uuid.UUID
    title: str
    file_url: str
    document_type: str
    uploaded_by_id: Optional[uuid.UUID] = None
    employee_id: Optional[uuid.UUID] = None
    requires_action: bool = False
    action_note: Optional[str] = None
    created_at: datetime

    uploaded_by_name: Optional[str] = None
    employee_name: Optional[str] = None

    # Present only for documents stored as real files (see DocumentFile); a
    # link-only document leaves these null and is opened straight from file_url.
    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    size_bytes: Optional[int] = None

    # Current user's response (if any)
    my_response: Optional[DocumentResponseRead] = None
    # Counts of responses by status: {"agreed": X, "disagreed": Y, "review_requested": Z}
    response_counts: Optional[dict[str, int]] = None
    # Full responses list (for managers/admins)
    responses: Optional[list[DocumentResponseRead]] = None
