# Run this file as FLASK_ENV=production python -m unittest test_user_routes.py

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
        """Populate db with sample data.
        User 1 has made Palette 1 and favorited Palette 2.
        User 2 has made Palette 2 and favorited Palette 1.
        Palette 1 has Test Tag 1.
        Palette 2 has Test Tag 2."""
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
                name='test1 palette',
                desc='test1 palette',
                main='#000000',
                light_c='#000000',
                light_a='#000000',
                dark_c='#000000',
                dark_a='#000000'
            )
            self.p1.tags.append(self.t1)
            self.u1.palettes.append(self.p1)
            self.u2.favorites.append(self.p1)

            self.p2 = Palette(
                name='test2 palette',
                desc='test2 palette',
                main='#FFFFFF',
                light_c='#FFFFFF',
                light_a='#FFFFFF',
                dark_c='#FFFFFF',
                dark_a='#FFFFFF'
            )
            self.p2.tags.append(self.t2)
            self.u2.palettes.append(self.p2)
            self.u1.favorites.append(self.p2)

            db.session.add_all([self.p1,self.p2, self.u1, self.u2])
            db.session.commit()
        
    def tearDown(self):
        with app.app_context():
            res = super().tearDown()
            db.session.rollback()
            return res

#######################################################################################
#Register Tests

    def test_register_user(self):
        """Test that the route to register a user is working."""
        with self.client as c:
            resp = c.post('/users/register', data={'username':'test3','password':'test3','email':'test3@test.com'})

            self.assertEqual(resp.status_code, 302)

            u = User.query.filter(User.username=='test3').first()
            self.assertIsNotNone(u)
            self.assertEqual(u.username, 'test3')
            self.assertNotEqual(u.password,'test3')

#######################################################################################
#View Tests

    def test_view_profile(self):
        """Test that you can view the profile of a user.
        Also testing that the page is populated with their paletttes/favorites."""
        with self.client as c:
            resp = c.get('/users/1001')

            self.assertEqual(resp.status_code, 200)

            soup = BeautifulSoup(str(resp.data),'html.parser')
            username = soup.find(id='username')
            desc = soup.find(id='desc')
            self.assertEqual(username.text, 'test1')
            self.assertEqual(desc.text, 'No description.')

            userPalette = soup.find(id='user-palettes').find(class_='palette-prev')
            self.assertIsNotNone(userPalette)
            self.assertEqual(userPalette.find('h6').text, 'test1 palette')

            userFavorite = soup.find(id='user-favorites').find(class_='palette-prev')
            self.assertIsNotNone(userFavorite)
            self.assertEqual(userFavorite.find('h6').text, 'test2 palette')

    def test_invalid_profile(self):
        """Test that a 404 is returned when trying to view the profile of a user that doesn't exist."""
        with self.client as c:
            resp = c.get('/users/9999')
            self.assertEqual(resp.status_code, 404)

#######################################################################################
#Edit Tests

    def test_edit_user(self):
        """Test that a user can edit themselves."""
        with self.client as c:
            with c.session_transaction() as s:
                s[CURR_USER] = self.u1ID
            resp = c.post(f'/users/{self.u1ID}/edit', data={'password':'test1','username':'test1','desc':'test desc','email':'test1@test.com','pic_url':'/static/default-user-icon.png'})
            self.assertEqual(resp.status_code, 302)

            user = User.query.get(1001)
            self.assertEqual(user.desc, 'test desc')

    def test_edit_user_unauth(self):
        """Test that an unauthorized user can't edit someone else."""
        with self.client as c:
            with c.session_transaction() as s:
                s[CURR_USER] = self.u2ID
            resp = c.post(f'/users/{self.u1ID}/edit', data={'password':'test1','username':'test1','desc':'test desc','email':'test1@test.com','pic_url':'/static/default-user-icon.png'})
            self.assertEqual(resp.status_code, 403)

#######################################################################################
#Delete Tests

    def test_delete_user(self):
        """Test that a user can delete their profile."""
        with self.client as c:
            with c.session_transaction() as s:
                s[CURR_USER] = self.u1ID
            resp = c.get(f'/users/{self.u1ID}/delete')

            self.assertEqual(resp.status_code, 302)
            user = User.query.get(1001)
            self.assertIsNone(user)

    def test_delete_user_unauth(self):
        """Test that an unauthorized user can't delete someone else."""
        with self.client as c:
            with c.session_transaction() as s:
                s[CURR_USER] = self.u2ID
            resp = c.get(f'/users/{self.u1ID}/delete')
            self.assertEqual(resp.status_code, 403)
