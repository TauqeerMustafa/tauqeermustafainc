from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_session

DatabaseSession = Annotated[Session, Depends(get_session)]
