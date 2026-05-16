from models import db

class StockLevel(db.Model):
    __tablename__ = "stock_levels"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    location = db.Column(db.String(100), default="Main Warehouse")
    quantity_on_hand = db.Column(db.Integer, default=0)
    company = db.Column(db.String(200), nullable=False)


    product = db.relationship("Product", backref=db.backref("stock_levels", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "product": self.product.name,
            "sku": self.product.sku,
            "location": self.location,
            "quantity_on_hand": self.quantity_on_hand,
            "company": self.company
        }
