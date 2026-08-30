from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class EmployeeDashboardResponse(BaseModel):
    attendance: Dict[str, Any]
    tasks: List[Dict[str, Any]]
    leave: Dict[str, Any]
    projects: List[Dict[str, Any]]
    announcements: List[Dict[str, Any]]
    documents: List[Dict[str, Any]]
    notifications: List[Dict[str, Any]]

class AdminDashboardResponse(BaseModel):
    overview: Dict[str, Any]
    attendance_today: Dict[str, Any]
    pending_leave: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    tasks: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    announcements: List[Dict[str, Any]]
    documents: List[Dict[str, Any]]
