# Palette Place

Hello! This is my first Capstone Project for the Springboard Software Engineering Bootcamp. The goal of this project is to demonstrate everything I have learned so far, inlcuding JavaScript, JQuery, Python, Flask, SQL, and SQLAlchemy. I had to pick a pre-existing API and design a website around it. I chose the [Colormind API](http://colormind.io/) which can be used to generate palettes of colors that compliment each other. My website allows users to create and share their own palettes with others.

Check it out [here!](https://palette-place.onrender.com/)

Anyone is able to browse the palettes that have been created. They are simply sorted by the date they were created, with the most recent ones being first. Due to time constraints, I have not yet implemented any other searching or sorting functionality to the browsing page. If a user sees a palette they like, they can click on it to view more details. This shows the name, creator, date of creation, description, the colors, and the tags of the palette. If someone has registered an account and logged in, they can add the palette to their favorites. If it belongs to them, they can edit/delete it.

Users who are logged in can create their own palettes. Each palette has five colors: a main color, a light shade and accent, and a dark shade and accent. The create page queries the Colormind API and displays the results using hexadecimal strings for each color. If there is a color the user likes, they can lock that color in, meaning that the API will generate a palette based around that color. The API also comes with a few different generation models that the user can pick from. Once they have a palette they like, they can save it. All that is required is a title. Users can then edit their palette, or delete it. 

## Route Breakdown

- Home `/` : The home route. Using Jinja, it shows the 8 most recently made palettes. If a user is logged in, it shows links to the 'Create','Profile', and 'Logout' pages. Otherwise it only shows 'Register'.
- User Routes
	- Register `/users/register` (GET/POST): Shows the registration form. The form is created using flask-wtforms, which allows for automatic validation and easier processing. On success, it creates a new user, logs them in, and redirects to their profile. Passwords are encrypted with Bcrypt before being stored on the database.
	-  Login `/users/login` (GET/POST): Shows the login form, another flask-wtform. This authenticates the user by checking the entered password against the hashed password on the database. On success, it redirects to their profile and saves them as the global user, and their id in the flask session.
	-  Logout `/users/logout` (GET): Logs the user out by removing them from the flask session and redirects to the home page.
	-  View `/users/[ID]` (GET): View a profile based on their ID number or return a 404 page. Authorization is done within the Jinja template to determine if they can see the "Edit" button.
	-  Edit `/users/[ID]/edit` (GET/POST): View the profile edit page. Authorization is done to make sure the user can only access their own page. This again uses a flask-wtform for validation and processing. This page also allows users to delete their profile. There is simple JavaScript to show the "Confirm" button when the first delete button is clicked.
	-  Delete `/users/[ID]/delete` (GET): Delete a user's profile. Authorization is done to make sure the user can only delete their profile. On success, it logs the user out, deletes their profile from the database, and redirects to the home page.
- Palette Routes
	- Create
		- New `/palettes/new` (GET): Show the palette creation page. This specific route is used to populate the first palette with colors, as well as load the models that can be used and all the tags. The colors and models come from the Colormind API. The tags come from the database. This is then rendered with a Jinja template. There is additional javascript to hide the saving form and handle other events.
		- Generate `/palettes/generate` (POST): This generates a palette based on a model and locked colors the user has selected. When the generate button is clicked, JavaScript and JQuery are first used to get the model, as well as any colors that might be locked it. This is then packaged and sent to the server. Since JQuery by default returns HEX codes for colorpicker values, and Colormind needs RGB, the server converts from HEX to RGB and sends it to the API. It then takes the response and converts back to HEX and sends it back to the client. Here the colorpickers are then updated to show the generated colors.
		- Save `/palettes/save` (POST): Save the palette to the database. First the client uses JavaScript and JQuery to get all the values needed (colors, title, description, tags) and then sends it to the server. The server then creates a palette, adds it to the current logged in user's palettes, and adds all the tags to the palettes. It then returns a URL for the new palette, with the client then follows. Clients that are not logged in shouldn't see the link, but if they type in the URL the save button will not be rendered.
	- View `/palettes/[ID]` (GET): Display a palette. Rendered using Jinja. Only logged in users can see the favorite button, and only the creator can see the edit button.
	- Edit `/palettes/[ID]/edit` (GET): Display the editing page for palettes. Since I could not find a way to have the tag selection work with flask-wtforms, this is done through a traditional HTML form, with JavaScript to process the data and send it to the server. There is also Javascript to ensure the title and description don't go over the character limits. There is also authorization done to make sure only the creator can access this page.
	- Save Edit `/palettes/[ID]/edit` (POST): As previously mentioned, since I couldn't get this to work with flask-wtforms, this is a separate route that saves the edits done to the palette.
	- Delete `/palettes/[ID]/delete` (GET): Delete a palette. Authorization is done to make sure the user can only delete their palettes. On success, it deletes the palette and redirects back to their profile.
	- Favorite `/palettes/[ID]/favorite` (GET): Adds a palette to the user's favorites. Authorization is done to make sure the client is logged in and not trying to favorite their own palette.
	- Unfavorite `palettes/[ID]/unfavorite` (GET): Remove a palette to the user's favorites. Authorization is done to make sure the client is logged in and not trying to favorite their own palette.
- Browsing Routes
	- Show `/palettes/browse [page, name, user, tags, check]` (GET): Allows the user to browse and search palettes. Users can search based on palette names, the user who made them, and the tags. All search parameters are sent via query parameters to the server. The `page` parameter starts at 0. The `check` param is only to be used to check if there are more palettes to load. The server will return `True/False` if there is another page of palettes that can be loaded. If it is true, the "Next" button will be displayed at the bottom of the page, and users can click it. Otherwise it will not be shown.
- Error Routes
	- 403: Shows a custom 403 Forbidden page. This is called when the user tries to access a page they shouldn't be able to, such as editing another user's profile.
	- 404: Shows a custom 404 Not Found page. Many routes use `get_or_404` when querying the database. If nothing is found, this page will be shown instead.

## Other Notes

I made the decision early on to have all the tags be pre-generated, instead of allowing users to create their own. This avoids two problems. The first is that it avoids too many tags that are basically the same such as sea green versus ocean green. It also avoids the problem of what happens if a user makes a very basic tag, such as "Gray", that a lot of people use, and then the creator decides to delete the tag. Suddenly hundreds of palettes that use that tag can't anymore.

If you decide to run this locally, you'll need to open ipython, run app.py, and then run the function `setup()`. This creates all the tables for the models, generates all the tags, and adds them to the database. If you want to pre-populate your database with palettes, you can use `make_random_palettes([num_palettes])`. This will create a specified amount of random palettes. Important: only the colors will be random. The names, description, and tags will not be. It will also require a user with the ID of 1.

### To Be Done

The main feature I want to add in the future is searching functionality to the browse page. The ability to search by tags, creators, and titles etc. Also, the page for each palette was going to have a demo website below it to show each color in use. This was cut for time. Other features could be a commenting system on palettes.

### Tools Used

This is a list of what I used to make this. Use `requirements.txt` to install all required  Python packages, not this list.

- JavaScript
	- JQuery
	- Bootstrap
	- Axios
- Python
	- Flask
		- Debug Toolbar
		- SQLAlchemy
		- Bcrypt
		- WTForms
	- Jinja
	- Beautiful Soup
	- Requests
- SQL
	- Postgresql
- Git

## Changelog

- 10/28/23
	- Improved tag adding and editing system with search functionality
- 12/4/23
	- Users are now able to search for palettes based on name, users, and tags
	- Minor quality of life changes on certain pages.
	- Tag searching and checking name/description lengths are now in their own JavaScript files