from models import db
from datetime import datetime

class StockMovement(db.Model):
    __tablename__ = "stock_movements"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    location = db.Column(db.String(100), default="Main Warehouse")
    qty_change = db.Column(db.Integer, nullable=False)
    movement_type = db.Column(db.String(50))  # 'receipt', 'sale', 'adjustment'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    company = db.Column(db.String(200), nullable=False)


    product = db.relationship("Product", backref=db.backref("movements", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "product": self.product.name,
            "sku": self.product.sku,
            "qty_change": self.qty_change,
            "movement_type": self.movement_type,
            "location": self.location,
            "created_at": self.created_at.isoformat(),
            "company" : self.company
        }
