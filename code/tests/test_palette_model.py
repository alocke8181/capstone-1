# Run this file as  python -m unittest test_palette_model.py
import os
from unittest import TestCase
from sqlalchemy import exc
from models import db, User, Palette, Tag

os.environ['DATABASE_URL'] = "postgresql:///captstone_test"

from app import app
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///capstone_test'
with app.app_context():
    db.create_all()

class PaletteModelTestCase(TestCase):
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
    def test_palette_creation(self):
        """Test if palettes can be created properly"""
        with app.app_context():
            test = Palette(
                name='test',
                desc='test palette',
                main='#000000',
                light_c='#000000',
                light_a='#000000',
                dark_c='#000000',
                dark_a='#000000'
            )
            test.id = 2001
            db.session.add(test)
            db.session.commit()
            test = Palette.query.get(2001)
            self.assertIsNotNone(test)
            self.assertEqual(test.name,'test')
            self.assertEqual(test.desc,'test palette')
            self.assertEqual(test.main,'#000000')
            self.assertEqual(test.light_c,'#000000')
            self.assertEqual(test.light_a,'#000000')
            self.assertEqual(test.dark_c,'#000000')
            self.assertEqual(test.dark_a,'#000000')

    def test_invalid_palette_name(self):
        """Test that a name must be supplied."""
        with app.app_context():
            test = Palette(
                name=None,
                desc='test palette',
                main='#000000',
                light_c='#000000',
                light_a='#000000',
                dark_c='#000000',
                dark_a='#000000'
            )
            with self.assertRaises(exc.IntegrityError) as context:
                db.session.add(test)
                db.session.commit()

    #These next five tests are for making sure that all the colors are supplied
    def test_invalid_palette_main(self):
        with app.app_context():
            test = Palette(
                name='test',
                desc='test palette',
                main=None,
                light_c='#000000',
                light_a='#000000',
                dark_c='#000000',
                dark_a='#000000'
            )
            with self.assertRaises(exc.IntegrityError) as context:
                db.session.add(test)
                db.session.commit()

    def test_invalid_palette_light_c(self):
        with app.app_context():
            test = Palette(
                name='test',
                desc='test palette',
                main='#000000',
                light_c= None,
                light_a='#000000',
                dark_c='#000000',
                dark_a='#000000'
            )
            with self.assertRaises(exc.IntegrityError) as context:
                db.session.add(test)
                db.session.commit()

    def test_invalid_palette_light_a(self):
        with app.app_context():
            test = Palette(
                name='test',
                desc='test palette',
                main='#000000',
                light_c='#000000',
                light_a=None,
                dark_c='#000000',
                dark_a='#000000'
            )
            with self.assertRaises(exc.IntegrityError) as context:
                db.session.add(test)
                db.session.commit()

    def test_invalid_palette_dark_c(self):
        with app.app_context():
            test = Palette(
                name='test',
                desc='test palette',
                main='#000000',
                light_c='#000000',
                light_a='#000000',
                dark_c=None,
                dark_a='#000000'
            )
            with self.assertRaises(exc.IntegrityError) as context:
                db.session.add(test)
                db.session.commit()

    def test_invalid_palette_dark_a(self):
        with app.app_context():
            test = Palette(
                name='test',
                desc='test palette',
                main='#000000',
                light_c='#000000',
                light_a='#000000',
                dark_c='#000000',
                dark_a=None
            )
            with self.assertRaises(exc.IntegrityError) as context:
                db.session.add(test)
                db.session.commit()
