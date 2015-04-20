from flask import Flask
from .views.booking import booking

app = Flask(__name__)
app.register_blueprint(booking)
