#!/usr/bin/env python3
"""
Database initialization script.
Creates tables based on SQLModel models.
"""

import sys
import os

# Add parent directory to path to import app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.database import create_db_and_tables
from app.models import User, Deck, Flashcard


def main():
    print("Creating database tables...")
    try:
        create_db_and_tables()
        print("✓ Database tables created successfully!")
    except Exception as e:
        print(f"✗ Error creating database tables: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
