from flask import Blueprint, jsonify, request
from models import db
from models.product import Product
from flask_jwt_extended import jwt_required, get_jwt

product_bp = Blueprint("product_bp", __name__)


@product_bp.route("/api/products", methods=["GET"])
@jwt_required() 
def get_products():
    claims = get_jwt()
    company = claims["company"]  
    products = Product.query.filter_by(company=company).all()
    return jsonify([p.to_dict() for p in products]), 200



@product_bp.route("/api/products", methods=["POST"])
@jwt_required()  
def add_product():
    claims = get_jwt()
    company = claims["company"]

    data = request.get_json()
    product = Product(
        sku=data["sku"],
        name=data["name"],
        cost_price=data.get("cost_price", 0),
        sell_price=data.get("sell_price", 0),
        reorder_point=data.get("reorder_point", 0),
        reorder_qty=data.get("reorder_qty", 0),
        company=company 
    )

    db.session.add(product)
    db.session.commit()
    return jsonify({"message": "Product added successfully"}), 201
