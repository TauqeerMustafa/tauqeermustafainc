import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class DocumentCreate(BaseModel):
    title: str
    file_url: str
    document_type: str = "other"
    employee_id: Optional[uuid.UUID] = None

class DocumentRead(BaseModel):
    id: uuid.UUID
    title: str
    file_url: str
    document_type: str
    uploaded_by_id: Optional[uuid.UUID] = None
    employee_id: Optional[uuid.UUID] = None
    created_at: datetime
    
    uploaded_by_name: Optional[str] = None
    employee_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
