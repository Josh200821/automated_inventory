from flask import Blueprint, request, jsonify
from models import db
from models.users import User, bcrypt
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from datetime import timedelta

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    company = data.get("company")
    role = data.get("role")

    if not username or not email or not password or not company:
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "User already exists"}), 400

    new_user = User(username=username, email=email, company=company, role=role )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201



@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(
        identity=str(user.id),  
        additional_claims={
            "role": user.role,
            "username": user.username,
            "company": user.company
        },
        expires_delta=timedelta(hours=6)
    )

    return jsonify({
        "message": "Login successful",
        "access": access_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/api/logout", methods=["POST"])
@jwt_required()
def logout():

    return jsonify({"message": "Logout successful"}), 200


@auth_bp.route("/api/me", methods=["GET"])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()["id"]
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200
