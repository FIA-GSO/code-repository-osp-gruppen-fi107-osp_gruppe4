from flask import Flask, render_template, send_from_directory
import os

# "Backend" for the frontend
# This file is used to start the frontend server

app = Flask(__name__, static_url_path='', static_folder='static', template_folder='Views')

@app.route('/')
def homepage():
    return render_template('Homepage.html')

@app.route('/create-group')
def create_group():
    return render_template('createGroup.html')

@app.route('/impressum')
def impressum():
    return render_template('impressum.html')

@app.route('/datenschutz')
def datenschutz():
    return render_template('datenschutz.html')

@app.route('/agb')
def agb():
    return render_template('agb.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/registration')
def registration():
    return render_template('registration.html')

@app.route('/my-groups')
def my_groups():
    return render_template('myGroups.html')

@app.route('/profile')
def profile():
    return render_template('profil.html')

@app.route('/css/<path:filename>')
def css(filename):
    return send_from_directory('CSS', filename)

@app.route('/js/<path:filename>')
def js(filename):
    return send_from_directory('JavaScript', filename)

if __name__ == '__main__':
    app.run(debug=True)