import math
import uuid

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentAdmin, DatabaseSession
from app.models.blog import Blog
from app.schemas.blog import BlogCreate, BlogRead, BlogUpdate
from app.schemas.common import ApiResponse, PaginatedResult, Pagination

router = APIRouter(prefix="/blog", tags=["blog"])


@router.get("", response_model=ApiResponse[PaginatedResult[BlogRead]])
def list_blogs(
    db: DatabaseSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    published_only: bool = Query(default=True),
) -> ApiResponse[PaginatedResult[BlogRead]]:
    stmt = select(Blog).order_by(Blog.published_at.desc())
    if published_only:
        stmt = stmt.where(Blog.is_published.is_(True))

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.offset((page - 1) * page_size).limit(page_size)).all()

    return ApiResponse(
        data=PaginatedResult(
            items=[BlogRead.model_validate(row) for row in rows],
            pagination=Pagination(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=max(math.ceil(total / page_size), 1),
            ),
        )
    )


@router.get("/{slug}", response_model=ApiResponse[BlogRead])
def get_blog(slug: str, db: DatabaseSession) -> ApiResponse[BlogRead]:
    post = db.scalar(select(Blog).where(Blog.slug == slug))
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    return ApiResponse(data=BlogRead.model_validate(post))


@router.post("", response_model=ApiResponse[BlogRead], status_code=status.HTTP_201_CREATED)
def create_blog(payload: BlogCreate, db: DatabaseSession, _: CurrentAdmin) -> ApiResponse[BlogRead]:
    if db.scalar(select(Blog).where(Blog.slug == payload.slug)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    post = Blog(**payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return ApiResponse(data=BlogRead.model_validate(post), message="Blog post created")


@router.put("/{blog_id}", response_model=ApiResponse[BlogRead])
def update_blog(
    blog_id: uuid.UUID, payload: BlogUpdate, db: DatabaseSession, _: CurrentAdmin
) -> ApiResponse[BlogRead]:
    post = db.get(Blog, blog_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")

    updates = payload.model_dump(exclude_unset=True)
    if "slug" in updates and updates["slug"] != post.slug:
        if db.scalar(select(Blog).where(Blog.slug == updates["slug"])):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use")

    for field, value in updates.items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)
    return ApiResponse(data=BlogRead.model_validate(post), message="Blog post updated")


@router.delete("/{blog_id}", response_model=ApiResponse[dict])
def delete_blog(blog_id: uuid.UUID, db: DatabaseSession, _: CurrentAdmin) -> ApiResponse[dict]:
    post = db.get(Blog, blog_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")

    db.delete(post)
    db.commit()
    return ApiResponse(data={"id": str(blog_id)}, message="Blog post deleted")
