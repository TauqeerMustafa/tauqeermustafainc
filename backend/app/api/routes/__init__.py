from fastapi import APIRouter

from app.api.routes.admin import router as admin_router
from app.api.routes.announcement import router as announcement_router
from app.api.routes.auth import router as auth_router
from app.api.routes.blog import router as blog_router
from app.api.routes.career import router as career_router
from app.api.routes.contact import router as contact_router
from app.api.routes.client import portal_router as client_portal_router
from app.api.routes.client import router as client_auth_router
from app.api.routes.lead import router as lead_router
from app.api.routes.mail import router as mail_router
from app.api.routes.portfolio import router as portfolio_router
from app.api.routes.service import router as service_router
from app.api.routes.system import router as system_router
from app.api.routes.task import router as task_router
from app.api.routes.employee import router as employee_router
from app.api.routes.attendance import router as attendance_router
from app.api.routes.leave import router as leave_router
from app.api.routes.documents import router as document_router
from app.api.routes.dashboard import router as dashboard_router

router = APIRouter()

router.include_router(system_router)
router.include_router(admin_router)
router.include_router(auth_router)
router.include_router(client_auth_router)
router.include_router(client_portal_router)
router.include_router(service_router)
router.include_router(blog_router)
router.include_router(portfolio_router)
router.include_router(career_router)
router.include_router(contact_router)
router.include_router(announcement_router)
router.include_router(lead_router)
router.include_router(mail_router)
router.include_router(task_router)
router.include_router(employee_router, prefix="/employees", tags=["employees"])
router.include_router(attendance_router, prefix="/attendance", tags=["attendance"])
router.include_router(leave_router, prefix="/leave", tags=["leave"])
router.include_router(document_router, prefix="/documents", tags=["documents"])
router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])

