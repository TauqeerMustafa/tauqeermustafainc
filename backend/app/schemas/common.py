from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

TData = TypeVar("TData")
TItem = TypeVar("TItem")


class CamelModel(BaseModel):
    """Base model that serializes snake_case fields as camelCase JSON,
    matching the TypeScript interfaces in the frontend (types/domain.ts, types/api.ts)."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class ApiResponse(CamelModel, Generic[TData]):
    data: TData
    message: str | None = None
    success: bool = True


class Pagination(CamelModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class PaginatedResult(CamelModel, Generic[TItem]):
    items: list[TItem]
    pagination: Pagination
