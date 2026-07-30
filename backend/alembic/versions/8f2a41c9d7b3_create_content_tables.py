"""create content tables (blog, portfolio, career, service, contact_message, announcement)

Revision ID: 8f2a41c9d7b3
Revises: 6e21844f3abd
Create Date: 2026-07-29 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '8f2a41c9d7b3'
down_revision: str | None = '6e21844f3abd'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'services',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('slug', sa.String(length=160), nullable=False),
        sa.Column('title', sa.String(length=220), nullable=False),
        sa.Column('short_description', sa.String(length=300), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=False),
        sa.Column('icon', sa.String(length=60), nullable=True),
        sa.Column('outcomes', postgresql.ARRAY(sa.String(length=200)), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_services_slug'), 'services', ['slug'], unique=True)

    op.create_table(
        'blogs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('slug', sa.String(length=160), nullable=False),
        sa.Column('title', sa.String(length=220), nullable=False),
        sa.Column('excerpt', sa.String(length=400), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=80), nullable=False),
        sa.Column('is_published', sa.Boolean(), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_blogs_slug'), 'blogs', ['slug'], unique=True)

    op.create_table(
        'portfolio_projects',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('slug', sa.String(length=160), nullable=False),
        sa.Column('title', sa.String(length=220), nullable=False),
        sa.Column('summary', sa.String(length=500), nullable=False),
        sa.Column('category', sa.String(length=80), nullable=False),
        sa.Column('impact', sa.String(length=300), nullable=False),
        sa.Column('technologies', postgresql.ARRAY(sa.String(length=80)), nullable=False),
        sa.Column('gallery', postgresql.ARRAY(sa.String(length=200)), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_portfolio_projects_slug'), 'portfolio_projects', ['slug'], unique=True)

    op.create_table(
        'careers',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('slug', sa.String(length=160), nullable=False),
        sa.Column('title', sa.String(length=220), nullable=False),
        sa.Column('location', sa.String(length=120), nullable=False),
        sa.Column('type', sa.String(length=60), nullable=False),
        sa.Column('summary', sa.String(length=500), nullable=False),
        sa.Column('responsibilities', postgresql.ARRAY(sa.String(length=300)), nullable=False),
        sa.Column('is_open', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_careers_slug'), 'careers', ['slug'], unique=True)

    op.create_table(
        'contact_messages',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=160), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('company', sa.String(length=160), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_contact_messages_email'), 'contact_messages', ['email'], unique=False)

    op.create_table(
        'announcements',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=220), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('is_published', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('announcements')
    op.drop_index(op.f('ix_contact_messages_email'), table_name='contact_messages')
    op.drop_table('contact_messages')
    op.drop_index(op.f('ix_careers_slug'), table_name='careers')
    op.drop_table('careers')
    op.drop_index(op.f('ix_portfolio_projects_slug'), table_name='portfolio_projects')
    op.drop_table('portfolio_projects')
    op.drop_index(op.f('ix_blogs_slug'), table_name='blogs')
    op.drop_table('blogs')
    op.drop_index(op.f('ix_services_slug'), table_name='services')
    op.drop_table('services')
