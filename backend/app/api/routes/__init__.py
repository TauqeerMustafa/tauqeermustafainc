from fastapi import APIRouter

from app.api.routes.announcement import router as announcement_router
from app.api.routes.auth import router as auth_router
from app.api.routes.blog import router as blog_router
from app.api.routes.career import router as career_router
from app.api.routes.contact import router as contact_router
from app.api.routes.portfolio import router as portfolio_router
from app.api.routes.service import router as service_router
from app.api.routes.system import router as system_router

router = APIRouter()

router.include_router(system_router)
router.include_router(auth_router)
router.include_router(service_router)
router.include_router(blog_router)
router.include_router(portfolio_router)
router.include_router(career_router)
router.include_router(contact_router)
router.include_router(announcement_router)
