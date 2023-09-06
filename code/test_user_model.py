# Run this file as  python -m unittest test_user_model.py

import os
from unittest import TestCase
from sqlalchemy import exc
from models import db, User, Palette, Tag

os.environ['DATABASE_URL'] = "postgresql:///capstone1-test"

from app import app
with app.app_context():
    db.create_all()

class UserModelTestCase(TestCase):
    """Unit tests for the User model"""

    def setUp(self):
        with app.app_context():
            db.drop_all()
            db.create_all()

            user1 = User.register('user1','user1','user1@test.com',None)
            self.user1ID = 1001
            user1.id = self.user1ID
            user2 = User.register('user2','user2','user2@test.com',None)
            self.user2ID = 1002
            user2.id = self.user2ID

            db.session.commit()
            self.user1 = User.query.get(self.user1ID)
            self.user2 = User.query.get(self.user2ID)
        self.client = app.test_client()

    def tearDown(self):
        with app.app_context():
            res = super().tearDown()
            db.session.rollback()
            return res

#######################################################################
#Register Tests
    def test_user_registration(self):
        """Test if users can register properly"""
        with app.app_context():
            test = User.register('test','test','test@test.com',None)
            test.id = 2001
            db.session.add(test)
            db.session.commit()
            
            test = User.query.get(2001)
            self.assertIsNotNone(test)
            self.assertEqual(test.username, 'test')
            self.assertNotEqual(test.password, 'test')
            self.assertEqual(test.email, 'test@test.com')
            self.assertEqual(len(test.palettes), 0)
            self.assertEqual(len(test.favorites), 0)

    def test_invalid_username_register(self):
        """Test that there must be a username for the database."""
        with app.app_context():
            test = User.register(None,'test','test@test.com',None)
            with self.assertRaises(exc.IntegrityError) as context:
                db.session.commit()

    def test_invalid_password_register(self):
        """Test that there must be a password for bcrypt."""
        with app.app_context():
            with self.assertRaises(ValueError) as context:
                User.register('tester','','tester@test.com',None)
            with self.assertRaises(ValueError) as context:
                User.register('tester',None,'tester@test.com',None)

#######################################################################
#Authentication Tests
    def test_user_authemtication(self):
        with app.app_context():
            user = User.authenticate(self.user1.username, 'user1')
            self.assertIsNotNone(user)
            self.assertEqual(user.id,self.user1ID)

    def test_invalid_username_auth(self):
        with app.app_context():
            self.assertFalse(User.authenticate('wrong_username','user1'))

    def test_invalid_password_auth(self):
        with app.app_context():
            self.assertFalse(User.authenticate(self.user1.username, 'wrong_password'))
        
