from flask import Blueprint, jsonify, request
from models import db
from models.stock_movement import StockMovement
from models.stock import StockLevel
from flask_jwt_extended import jwt_required, get_jwt

movement_bp = Blueprint("movement_bp", __name__)


@movement_bp.route("/api/movements", methods=["GET"])
@jwt_required()  
def get_movements():
    claims = get_jwt()
    company = claims["company"]
    moves = StockMovement.query.filter_by(company=company).all()
    return jsonify([m.to_dict() for m in moves]), 200


@movement_bp.route("/api/movements", methods=["POST"])
@jwt_required() 
def add_movement():
    claims = get_jwt()
    company = claims["company"]
    
    data = request.get_json()


    movement = StockMovement(
        product_id=data["product_id"],
        qty_change=data["qty_change"],
        movement_type=data["movement_type"],
        location=data.get("location", "Main Warehouse"),
        company=company  
    )
    db.session.add(movement)


    stock = StockLevel.query.filter_by(
        product_id=data["product_id"],
        location=data.get("location", "Main Warehouse"),
        company=company  
    ).first()

    if not stock:
        stock = StockLevel(
            product_id=data["product_id"],
            location=data.get("location", "Main Warehouse"),
            quantity_on_hand=0,
            company=company 
        )
        db.session.add(stock)

    stock.quantity_on_hand += data["qty_change"]

    db.session.commit()
    return jsonify({"message": "Stock movement recorded"}), 201
