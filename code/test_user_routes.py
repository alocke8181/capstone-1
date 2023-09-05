import os
from unittest import TestCase
from sqlalchemy import exc
from models import db, User, Palette, Tag
from bs4 import BeautifulSoup

os.environ['DATABASE_URL'] = "postgresql:///captstone1-test"

from app import app, CURR_USER

with app.app_context():
    db.create_all()

app.config['WTF_CSRF_ENABLED'] = False

class UserRoutesTest(TestCase):
    """Test the user routes."""

    def setUp(self):
        """Populate db with sample data"""
        with app.app_context():
            db.drop_all()
            db.create_all()
            self.client = app.test_client()

            self.u1 = User.register('test1','test1','test1@test.com',None)
            self.u1ID = 1001
            self.u1.id=self.u1ID
            self.u2 = User.register('test2','test2','test2@test.com',None)
            self.u2ID = 1002
            self.u2.id=self.u2ID
            db.session.commit()

            self.t1 = Tag(name='Test Tag 1')
            self.t2 = Tag(name='Test Tag 2')
            db.session.add_all([self.t1, self.t2])
            db.session.commit()

            self.t1 = Tag.query.filter(Tag.name=='Test Tag 1').first()
            self.t2 = Tag.query.filter(Tag.name=='Test Tag 2').first()

            self.p1 = Palette(
                name='test1',
                desc='test1 palette',
                main='#000000',
                light_c='#000000',
                light_a='#000000',
                dark_c='#000000',
                dark_a='#000000'
            )
            self.p1.tags.append(self.t1)
            self.u1.palettes.append(self.p1)

            self.p2 = Palette(
                name='test2',
                desc='test2 palette',
                main='#FFFFFF',
                light_c='#FFFFFF',
                light_a='#FFFFFF',
                dark_c='#FFFFFF',
                dark_a='#FFFFFF'
            )
            self.p2.tags.append(self.t2)
            self.u2.palettes.append(self.p2)
            
            db.session.add_all([self.p1,self.p2])
            db.session.commit()
        
    def tearDown(self):
        with app.app_context():
            res = super().tearDown()
            db.session.rollback()
            return res

    def test_register_user(self):
        """Test that the route to register a user is working."""
        with self.client as c:
            resp = c.post('/users/register', data={'username':'test3','password':'test3','email':'test3@test.com'})

            self.assertEqual(resp.status_code, 302)

            u = User.query.filter(User.username=='test3').first()
            self.assertIsNotNone(u)
            self.assertEqual(u.username, 'test3')
            self.assertNotEqual(u.password,'test3')

