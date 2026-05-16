from flask import Blueprint, jsonify, request
from models import db
from models.stock import StockLevel
from flask_jwt_extended import jwt_required, get_jwt

stock_bp = Blueprint("stock_bp", __name__)


@stock_bp.route("/api/stock", methods=["GET"])
@jwt_required() 
def get_stock():
    claims = get_jwt()
    company = claims["company"] 
    stocks = StockLevel.query.filter_by(company=company).all()
    return jsonify([s.to_dict() for s in stocks]), 200



@stock_bp.route("/api/stock", methods=["POST"])
@jwt_required()  
def update_stock():
    claims = get_jwt()
    company = claims["company"]

    data = request.get_json()

    stock = StockLevel.query.filter_by(
        product_id=data["product_id"],
        location=data.get("location", "Main Warehouse"),
        company=company  
    ).first()

    if not stock:
        stock = StockLevel(
            product_id=data["product_id"],
            location=data.get("location", "Main Warehouse"),
            quantity_on_hand=data["quantity_on_hand"],
            company=company  
        )
        db.session.add(stock)
    else:
        stock.quantity_on_hand = data["quantity_on_hand"]

    db.session.commit()
    return jsonify({"message": "Stock updated"}), 200
