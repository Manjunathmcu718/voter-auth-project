from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Import blueprints from the routes package
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.data_routes import data_bp
from routes.gov_verify_routes import gov_verify_bp
from routes.image_routes import image_bp


# Initialize Flask App
app = Flask(__name__)

# --- Configuration ---
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/voter_auth_db")
CORS(app)  # Enable Cross-Origin Resource Sharing

# Initialize PyMongo and attach it to the app
mongo = PyMongo(app)
app.mongo = mongo # Make mongo accessible in blueprints via current_app

#Register Blueprints
# This organizes the routes into separate files for better maintainability
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(data_bp, url_prefix='/api') # For dashboard and AI routes
app.register_blueprint(gov_verify_bp, url_prefix='/api/auth')
app.register_blueprint(image_bp, url_prefix='/api/admin')
#Root Route 
@app.route('/')
def index():
    """A simple route to confirm the backend is running."""
    return {"status": "running", "message": "AI Voter Authentication Backend"}

#Main Execution
if __name__ == '__main__':
    # Runs the Flask app in debug mode
    app.run(debug=True, host='0.0.0.0', port=5000)
    # venv\Scripts\activate
    # pip install -r requirements.txt