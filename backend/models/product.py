from models import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    cost_price = db.Column(db.Numeric(10,2))
    sell_price = db.Column(db.Numeric(10,2))
    reorder_point = db.Column(db.Integer, default=0)
    reorder_qty = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    company = db.Column(db.String(200), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "sku": self.sku,
            "name": self.name,
            "cost_price": float(self.cost_price or 0),
            "sell_price": float(self.sell_price or 0),
            "reorder_point": self.reorder_point,
            "reorder_qty": self.reorder_qty,
            "company" : self.company
        }
