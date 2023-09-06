# Run this file as  python -m unittest test_tag_model.py
import os
from unittest import TestCase
from sqlalchemy import exc
from models import db, User, Palette, Tag

os.environ['DATABASE_URL'] = "postgresql:///capstone1-test"

from app import app
with app.app_context():
    db.create_all()

class TagModelTestCase(TestCase):
    """Unit tests for the Palette model"""

    def setUp(self):
        with app.app_context():
            db.drop_all()
            db.create_all()

            user = User.register('user','user','user@test.com',None)
            self.userID = 1001
            user.id = self.userID
        
            db.session.commit()
            self.user = User.query.get(self.userID)
            
        self.client = app.test_client()

    def tearDown(self):
        with app.app_context():
            res = super().tearDown()
            db.session.rollback()
            return res

#######################################################################
#Creation Tests
    def test_tag_creation(self):
        """Test that a tag can be made"""
        with app.app_context():
            tag = Tag(name='Test')
            db.session.add(tag)
            db.session.commit()

            tag = Tag.query.filter(Tag.name=='Test').first()
            self.assertIsNotNone(tag)
            self.assertEqual(tag.name,'Test')

    def test_invalid_tag_name(self):
        """Test that an error occurs when a name is not supplied."""
        with app.app_context():
            tag = Tag(name=None)
            with self.assertRaises(exc.IntegrityError) as context:
                db.session.add(tag)
                db.session.commit()