from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate  
from config import Config
from models import db
from models.users import bcrypt
from routes.product_routes import product_bp
from routes.stock_routes import stock_bp
from routes.movement_routes import movement_bp
from routes.auth_routes import auth_bp
from routes.analytics_routes import analytics_bp

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)  


app.register_blueprint(product_bp)
app.register_blueprint(stock_bp)
app.register_blueprint(movement_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(analytics_bp)

@app.route("/")
def home():
    return {"message": "Inventory Control API running!"}

if __name__ == "__main__":
    with app.app_context():
        try:
            with db.engine.connect() as conn:
                print("Connected to PostgreSQL successfully!")
        except Exception as e:
            print("Connection failed:", e)

    app.run(debug=True)
