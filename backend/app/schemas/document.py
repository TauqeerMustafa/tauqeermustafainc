import uuid
from datetime import datetime
from typing import Optional

from app.schemas.common import CamelModel


class DocumentCreate(CamelModel):
    title: str
    file_url: str
    document_type: str = "other"
    employee_id: Optional[uuid.UUID] = None


class DocumentRead(CamelModel):
    id: uuid.UUID
    title: str
    file_url: str
    document_type: str
    uploaded_by_id: Optional[uuid.UUID] = None
    employee_id: Optional[uuid.UUID] = None
    created_at: datetime

    uploaded_by_name: Optional[str] = None
    employee_name: Optional[str] = None
