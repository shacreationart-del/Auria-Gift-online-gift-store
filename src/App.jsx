import { useEffect, useState } from "react";
import "./App.css";

const WHATSAPP_NUMBER = "94782676693";

const defaultProducts = [
  {
    id: 1,
    name: "Velvet Rose Gift Box",
    category: "Gift Boxes",
    price: "LKR 4,950",
    type: "box",
    image: "",
    stock: 5,
  },
  {
    id: 2,
    name: "Blush Scented Candle",
    category: "Candles",
    price: "LKR 3,250",
    type: "candle",
    image: "",
    stock: 0,
  },
  {
    id: 3,
    name: "Luxury Memory Frame",
    category: "Personalized",
    price: "LKR 2,850",
    type: "frame",
    image: "",
    stock: 8,
  },
  {
    id: 4,
    name: "Sweet Love Hamper",
    category: "Hampers",
    price: "LKR 5,750",
    type: "hamper",
    image: "",
    stock: 0,
  },
];

/* ============================= */
/* Product Mockup */
/* ============================= */

function ProductMockup({ type }) {
  return (
    <div className={`mock-product ${type}`}>
      {type === "box" && (
        <>
          <div className="gift-box-lid">
            <span>✦</span>
          </div>

          <div className="gift-box-body">
            <div className="box-ribbon"></div>
          </div>
        </>
      )}

      {type === "candle" && (
        <div className="candle">
          <div className="candle-flame">✦</div>

          <div className="candle-label">
            <small>AURIA</small>
            <strong>ROSE</strong>
            <span>SCENTED CANDLE</span>
          </div>
        </div>
      )}

      {type === "frame" && (
        <div className="photo-frame">
          <div className="frame-photo">
            <span>♡</span>
            <small>Your Memory</small>
          </div>
        </div>
      )}

      {type === "hamper" && (
        <>
          <div className="hamper">
            <div className="hamper-handle"></div>
            <div className="hamper-ribbon">✦</div>
          </div>

          <div className="hamper-item item-one">♡</div>
          <div className="hamper-item item-two">✦</div>
        </>
      )}
    </div>
  );
}

/* ============================= */
/* Product Image */
/* ============================= */

function ProductImage({ product }) {
  const isOutOfStock = Number(product.stock || 0) <= 0;

  return (
    <div className={`product-image ${product.type}`}>
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="uploaded-product-image"
        />
      ) : (
        <ProductMockup type={product.type} />
      )}

      {isOutOfStock && (
        <div className="out-of-stock-overlay">
          Out of Stock
        </div>
      )}

      <button
        type="button"
        className="heart-button"
        aria-label={`Add ${product.name} to wishlist`}
      >
        ♡
      </button>
    </div>
  );
}

/* ============================= */
/* Offer Banner */
/* ============================= */

function OfferBanner({ offer }) {
  if (!offer || !offer.active) {
    return null;
  }

  return (
    <section className="offer-banner">
      <div className="offer-content">
        <p className="eyebrow">Limited time offer</p>

        <h2>{offer.title}</h2>

        {offer.description && <p>{offer.description}</p>}

        <div className="offer-price">
          <strong>{offer.discount}% OFF</strong>
          <span>{offer.price}</span>
        </div>

        <a href="#shop" className="primary-button">
          Shop offer <span>→</span>
        </a>
      </div>

      <div className="offer-image">
        {offer.image ? (
          <img src={offer.image} alt={offer.title} />
        ) : (
          <div className="offer-placeholder">
            <span>✦</span>
            <strong>AURIA</strong>
            <small>Special Offer</small>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================= */
/* Cart Drawer */
/* ============================= */

function CartDrawer({
  cart,
  products,
  isOpen,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onOrderComplete,
}) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  if (!isOpen) return null;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartItems = cart
    .map((item) => {
      const product = products.find((productItem) => productItem.id === item.id);
      if (!product) return null;

      const price = Number(String(product.price).replace(/[^0-9]/g, ""));
      return {
        ...item,
        product,
        subtotal: price * item.quantity,
      };
    })
    .filter(Boolean);

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleWhatsAppOrder = (event) => {
    event.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setCheckoutMessage(
        "Customer Name, Phone Number සහ Delivery Address තුනම ඇතුළත් කරන්න."
      );
      return;
    }

    const orderItems = cartItems
      .map(
        (item) =>
          `• ${item.product.name} x ${item.quantity} = LKR ${item.subtotal.toLocaleString("en-LK")}`
      )
      .join("\n");

    const message = `AURIA GIFT - NEW ORDER

Customer Name: ${customerName.trim()}
Phone Number: ${customerPhone.trim()}
Delivery Address: ${customerAddress.trim()}

Order Items:
${orderItems}

Total Items: ${cartCount}
Order Total: LKR ${total.toLocaleString("en-LK")}

Thank you.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    onOrderComplete({
      id: Date.now(),
      date: new Date().toLocaleString("en-LK"),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items: cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      total,
      status: "Pending",
    });

    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCheckoutMessage("");
    setIsCheckoutOpen(false);
  };

  return (
    <div className="cart-overlay">
      <div className="cart-drawer">
        <div className="cart-header">
          <div>
            <p className="eyebrow">
              {isCheckoutOpen ? "Complete your order" : "Your selections"}
            </p>
            <h2>{isCheckoutOpen ? "Checkout" : "Shopping Cart"}</h2>
          </div>

          <button type="button" className="cart-close" onClick={onClose}>
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">♡</div>
            <h3>Your cart is empty</h3>
            <p>Add something beautiful to your cart.</p>
            <button type="button" className="primary-button" onClick={onClose}>
              Continue Shopping →
            </button>
          </div>
        ) : isCheckoutOpen ? (
          <div className="checkout-content">
            <button
              type="button"
              className="back-to-cart-button"
              onClick={() => setIsCheckoutOpen(false)}
            >
              ← Back to Cart
            </button>

            <div className="checkout-summary">
              <h3>Order Summary</h3>

              {cartItems.map((item) => (
                <div className="checkout-summary-row" key={item.product.id}>
                  <span>{item.product.name} × {item.quantity}</span>
                  <strong>LKR {item.subtotal.toLocaleString("en-LK")}</strong>
                </div>
              ))}

              <div className="checkout-total-row">
                <span>Total</span>
                <strong>LKR {total.toLocaleString("en-LK")}</strong>
              </div>
            </div>

            <form className="checkout-form" onSubmit={handleWhatsAppOrder}>
              <label>
                Customer Name
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  placeholder="Example: 0781234567"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  required
                />
              </label>

              <label>
                Delivery Address
                <textarea
                  placeholder="Enter your complete delivery address"
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                  rows="4"
                  required
                />
              </label>

              {checkoutMessage && (
                <p className="checkout-message">{checkoutMessage}</p>
              )}

              <button type="submit" className="primary-button whatsapp-order-button">
                Order via WhatsApp <span>↗</span>
              </button>

              <small className="checkout-note">
                WhatsApp එක open වුණාම order message එක send කරන්න.
              </small>
            </form>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => {
                const productStock = Number(item.product.stock || 0);

                return (
                  <div className="cart-item" key={item.product.id}>
                    <div className="cart-item-image">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} />
                      ) : (
                        <ProductMockup type={item.product.type} />
                      )}
                    </div>

                    <div className="cart-item-details">
                      <span>{item.product.category}</span>
                      <h3>{item.product.name}</h3>
                      <strong>{item.product.price}</strong>

                      <div className="cart-item-bottom">
                        <div className="quantity-control">
                          <button
                            type="button"
                            onClick={() => onDecrease(item.product.id)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onIncrease(item.product.id)}
                            disabled={item.quantity >= productStock}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-cart-item"
                          onClick={() => onRemove(item.product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-footer">
              <div className="cart-summary-row">
                <span>Items</span>
                <strong>{cartCount}</strong>
              </div>

              <div className="cart-summary-row cart-total">
                <span>Total</span>
                <strong>LKR {total.toLocaleString("en-LK")}</strong>
              </div>

              <button
                type="button"
                className="primary-button cart-checkout-button"
                onClick={() => setIsCheckoutOpen(true)}
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================= */
/* Admin Panel */
/* ============================= */

function AdminPanel({
  products,
  setProducts,
  offers,
  setOffers,
  orders,
  setOrders,
  onClose,
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Gift Boxes");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [image, setImage] = useState("");

  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] =
    useState("");
  const [offerDiscount, setOfferDiscount] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerImage, setOfferImage] = useState("");
  const [offerActive, setOfferActive] = useState(true);

  const [message, setMessage] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("කරුණාකර image file එකක් තෝරන්න.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
      setMessage("Product image එක තෝරාගත්තා.");
    };

    reader.readAsDataURL(file);
  };

  const handleOfferImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("කරුණාකර image file එකක් තෝරන්න.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setOfferImage(reader.result);
      setMessage("Offer image එක තෝරාගත්තා.");
    };

    reader.readAsDataURL(file);
  };

  const handleAddProduct = (event) => {
    event.preventDefault();

    if (!name.trim() || !price.trim()) {
      setMessage("Product name සහ price දෙකම ඇතුළත් කරන්න.");
      return;
    }

    const enteredStock = Number(stock);

    if (enteredStock < 0 || Number.isNaN(enteredStock)) {
      setMessage(
        "Stock quantity එක 0 හෝ ඊට වැඩි අගයක් විය යුතුයි."
      );
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: name.trim(),
      category,
      price: price.trim().startsWith("LKR")
        ? price.trim()
        : `LKR ${price.trim()}`,
      type: "box",
      image,
      stock: enteredStock,
    };

    setProducts((currentProducts) => [
      ...currentProducts,
      newProduct,
    ]);

    setName("");
    setPrice("");
    setStock("0");
    setCategory("Gift Boxes");
    setImage("");
    setMessage("Product එක සාර්ථකව add කළා.");
  };

  const handleDeleteProduct = (id) => {
    const confirmed = window.confirm(
      "මේ product එක delete කරන්නද?"
    );

    if (!confirmed) return;

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id)
    );

    setMessage("Product එක delete කළා.");
  };

  const handleUpdateStock = (id, value) => {
    const newStock = Math.max(0, Number(value) || 0);

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id
          ? { ...product, stock: newStock }
          : product
      )
    );

    setMessage("Stock quantity එක update කළා.");
  };

  const handleAddOffer = (event) => {
    event.preventDefault();

    if (
      !offerTitle.trim() ||
      !offerDiscount.trim() ||
      !offerPrice.trim()
    ) {
      setMessage(
        "Offer title, discount සහ price ඇතුළත් කරන්න."
      );
      return;
    }

    const newOffer = {
      id: Date.now(),
      title: offerTitle.trim(),
      description: offerDescription.trim(),
      discount: offerDiscount.trim(),
      price: offerPrice.trim().startsWith("LKR")
        ? offerPrice.trim()
        : `LKR ${offerPrice.trim()}`,
      image: offerImage,
      active: offerActive,
    };

    setOffers((currentOffers) => [
      ...currentOffers,
      newOffer,
    ]);

    setOfferTitle("");
    setOfferDescription("");
    setOfferDiscount("");
    setOfferPrice("");
    setOfferImage("");
    setOfferActive(true);

    setMessage("Offer එක සාර්ථකව add කළා.");
  };

  const handleDeleteOffer = (id) => {
    const confirmed = window.confirm(
      "මේ offer එක delete කරන්නද?"
    );

    if (!confirmed) return;

    setOffers((currentOffers) =>
      currentOffers.filter((offer) => offer.id !== id)
    );

    setMessage("Offer එක delete කළා.");
  };

  const handleToggleOffer = (id) => {
    setOffers((currentOffers) =>
      currentOffers.map((offer) =>
        offer.id === id
          ? { ...offer, active: !offer.active }
          : offer
      )
    );

    setMessage("Offer status එක update කළා.");
  };

  const handleUpdateOrderStatus = (id, status) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );

    setMessage("Order status එක update කළා.");
  };

  const handleDeleteOrder = (id) => {
    const confirmed = window.confirm("මේ order එක delete කරන්නද?");

    if (!confirmed) return;

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== id)
    );

    setMessage("Order එක delete කළා.");
  };

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Auria Gift</p>
            <h2>Admin Panel</h2>
          </div>

          <button
            type="button"
            className="admin-close"
            onClick={onClose}
            aria-label="Close admin panel"
          >
            ×
          </button>
        </div>

        <div className="admin-content">
        <div
          className="admin-status-bar"
          aria-label="Admin section navigation"
          style={{ gridColumn: "1 / -1", width: "100%", minWidth: 0 }}
        >
          <a href="#admin-add-product">Add Product</a>
          <a href="#admin-current-products">Products</a>
          <a href="#admin-add-offer">Add Offer</a>
          <a href="#admin-current-offers">Offers</a>
          <a href="#admin-customer-orders">Orders</a>
        </div>

          <form
            id="admin-add-product"
            className="product-form"
            onSubmit={handleAddProduct}
          >
            <h3>Add New Product</h3>

            <label>
              Product name
              <input
                type="text"
                placeholder="Example: Rose Gift Basket"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                <option>Gift Boxes</option>
                <option>Candles</option>
                <option>Personalized</option>
                <option>Hampers</option>
                <option>Flowers</option>
                <option>For Him</option>
                <option>For Her</option>
              </select>
            </label>

            <label>
              Price
              <input
                type="text"
                placeholder="Example: 4950"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
              />
            </label>

            <label>
              Stock quantity
              <input
                type="number"
                min="0"
                placeholder="Example: 10"
                value={stock}
                onChange={(event) =>
                  setStock(event.target.value)
                }
              />
            </label>

            <label>
              Product image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
              />
            </label>

            {image && (
              <div className="image-preview">
                <img
                  src={image}
                  alt="Selected product preview"
                />
              </div>
            )}

            <button
              type="submit"
              className="primary-button admin-submit"
            >
              Add Product <span>+</span>
            </button>
          </form>

          <div id="admin-current-products" className="admin-products">
            <div className="admin-products-heading">
              <h3>Current Products</h3>
              <span>{products.length} products</span>
            </div>

            <div className="admin-product-list">
              {products.map((product) => {
                const productStock = Number(
                  product.stock || 0
                );

                return (
                  <div
                    className="admin-product-row"
                    key={product.id}
                  >
                    <div className="admin-product-thumb">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <ProductMockup type={product.type} />
                      )}
                    </div>

                    <div className="admin-product-details">
                      <strong>{product.name}</strong>
                      <span>{product.category}</span>
                      <small>{product.price}</small>

                      <small
                        className={
                          productStock <= 0
                            ? "admin-stock out-stock-text"
                            : "admin-stock"
                        }
                      >
                        {productStock <= 0
                          ? "Out of Stock"
                          : `Stock: ${productStock}`}
                      </small>
                    </div>

                    <div className="admin-product-actions">
                      <label className="stock-edit-label">
                        Stock
                        <input
                          type="number"
                          min="0"
                          value={productStock}
                          onChange={(event) =>
                            handleUpdateStock(
                              product.id,
                              event.target.value
                            )
                          }
                        />
                      </label>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDeleteProduct(product.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form
            id="admin-add-offer"
            className="product-form offer-form"
            onSubmit={handleAddOffer}
          >
            <h3>Add New Offer</h3>

            <label>
              Offer title
              <input
                type="text"
                placeholder="Example: Weekend Special"
                value={offerTitle}
                onChange={(event) =>
                  setOfferTitle(event.target.value)
                }
              />
            </label>

            <label>
              Description
              <textarea
                placeholder="Example: Make someone smile this weekend"
                value={offerDescription}
                onChange={(event) =>
                  setOfferDescription(event.target.value)
                }
              />
            </label>

            <label>
              Discount percentage
              <input
                type="number"
                min="1"
                max="100"
                placeholder="Example: 20"
                value={offerDiscount}
                onChange={(event) =>
                  setOfferDiscount(event.target.value)
                }
              />
            </label>

            <label>
              Offer price
              <input
                type="text"
                placeholder="Example: 3990"
                value={offerPrice}
                onChange={(event) =>
                  setOfferPrice(event.target.value)
                }
              />
            </label>

            <label>
              Offer image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleOfferImageChange}
              />
            </label>

            {offerImage && (
              <div className="image-preview">
                <img
                  src={offerImage}
                  alt="Selected offer preview"
                />
              </div>
            )}

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={offerActive}
                onChange={(event) =>
                  setOfferActive(event.target.checked)
                }
              />
              Show this offer on homepage
            </label>

            <button
              type="submit"
              className="primary-button admin-submit"
            >
              Add Offer <span>+</span>
            </button>
          </form>

          <div id="admin-current-offers" className="admin-products">
            <div className="admin-products-heading">
              <h3>Current Offers</h3>
              <span>{offers.length} offers</span>
            </div>

            <div className="admin-product-list">
              {offers.length === 0 ? (
                <p className="empty-admin-message">
                  තවම offers add කරලා නැහැ.
                </p>
              ) : (
                offers.map((offer) => (
                  <div
                    className="admin-product-row"
                    key={offer.id}
                  >
                    <div className="admin-product-thumb">
                      {offer.image ? (
                        <img
                          src={offer.image}
                          alt={offer.title}
                        />
                      ) : (
                        <div className="offer-mini-placeholder">
                          ✦
                        </div>
                      )}
                    </div>

                    <div className="admin-product-details">
                      <strong>{offer.title}</strong>
                      <span>{offer.discount}% OFF</span>
                      <small>{offer.price}</small>
                    </div>

                    <div className="offer-admin-actions">
                      <button
                        type="button"
                        className={
                          offer.active
                            ? "status-button active"
                            : "status-button"
                        }
                        onClick={() =>
                          handleToggleOffer(offer.id)
                        }
                      >
                        {offer.active ? "Active" : "Inactive"}
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDeleteOffer(offer.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div id="admin-customer-orders" className="admin-products admin-orders-section">
            <div className="admin-products-heading">
              <h3>Customer Orders</h3>
              <span>{orders.length} orders</span>
            </div>

            <div className="admin-order-list">
              {orders.length === 0 ? (
                <p className="empty-admin-message">
                  තවම orders නැහැ.
                </p>
              ) : (
                orders.map((order) => (
                  <div className="admin-order-card" key={order.id}>
                    <div className="admin-order-header">
                      <div>
                        <strong>Order #{String(order.id).slice(-6)}</strong>
                        <span>{order.date}</span>
                      </div>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="admin-order-customer">
                      <p><strong>Customer:</strong> {order.customerName}</p>
                      <p><strong>Phone:</strong> {order.customerPhone}</p>
                      <p><strong>Address:</strong> {order.customerAddress}</p>
                    </div>

                    <div className="admin-order-items">
                      {order.items.map((item) => (
                        <div className="admin-order-item" key={item.id}>
                          <span>{item.name} × {item.quantity}</span>
                          <strong>LKR {Number(item.subtotal).toLocaleString("en-LK")}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="admin-order-footer">
                      <strong>
                        Total: LKR {Number(order.total).toLocaleString("en-LK")}
                      </strong>

                      <select
                        value={order.status}
                        onChange={(event) =>
                          handleUpdateOrderStatus(order.id, event.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {message && (
            <p className="admin-message">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================= */
/* Main App */
/* ============================= */

function App() {
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem(
      "auria-products"
    );

    if (!savedProducts) {
      return defaultProducts;
    }

    try {
      const parsedProducts = JSON.parse(savedProducts);

      return parsedProducts.map((product) => ({
        ...product,
        stock: Number(product.stock || 0),
      }));
    } catch {
      return defaultProducts;
    }
  });

  const [offers, setOffers] = useState(() => {
    const savedOffers = localStorage.getItem("auria-offers");

    if (!savedOffers) return [];

    try {
      return JSON.parse(savedOffers);
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("auria-cart");

    if (!savedCart) return [];

    try {
      return JSON.parse(savedCart);
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem("auria-orders");

    if (!savedOrders) return [];

    try {
      return JSON.parse(savedOrders);
    } catch {
      return [];
    }
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "auria-products",
      JSON.stringify(products)
    );
  }, [products]);

  useEffect(() => {
    localStorage.setItem(
      "auria-offers",
      JSON.stringify(offers)
    );
  }, [offers]);

  useEffect(() => {
    localStorage.setItem("auria-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("auria-orders", JSON.stringify(orders));
  }, [orders]);

  const activeOffer = offers.find(
    (offer) => offer.active
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const addToCart = (product) => {
    const productStock = Number(product.stock || 0);

    if (productStock <= 0) {
      alert("මේ product එක දැනට Out of Stock.");
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        if (existingItem.quantity >= productStock) {
          alert("Available stock ප්‍රමාණය ඉක්මවන්න බැහැ.");
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          id: product.id,
          quantity: 1,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const increaseCartQuantity = (productId) => {
    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) return;

    const productStock = Number(product.stock || 0);

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId &&
        item.quantity < productStock
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseCartQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  return (
    <div className="app">
      <div className="announcement">
        Complimentary gift wrapping on orders over LKR 5,000
      </div>

      {/* Navigation */}

      <header className="navbar">
        <a className="brand" href="#home">
          <img
            src="/logo.png"
            alt="Auria Gift logo"
            className="brand-logo"
          />
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#collections">Collections</a>
          <a href="#about">Our Story</a>
        </nav>

        <div className="nav-actions">
          <button type="button" aria-label="Search">
            ⌕
          </button>

          <button type="button" aria-label="Wishlist">
            ♡
          </button>

          <button
            type="button"
            className="cart-nav-button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping cart"
          >
            🛒

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="admin-open-button"
            onClick={() => setIsAdminOpen(true)}
          >
            Admin
          </button>

          <button
            type="button"
            className="menu-button"
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}

        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">Gifts made memorable</p>

            <h2>
              Little things,
              <br />
              <em>beautifully</em>
              <br />
              remembered.
            </h2>

            <p className="hero-text">
              Curated gifts and thoughtful details for every
              meaningful moment.
            </p>

            <div className="hero-buttons">
              <a className="primary-button" href="#shop">
                Explore gifts <span>→</span>
              </a>

              <a
                className="text-button"
                href="#collections"
              >
                View collections
              </a>
            </div>
          </div>

          <div className="hero-art">
            <div className="sun-circle"></div>

            <div className="gift-card">
              <span className="gift-ribbon">✦</span>

              <p>A little</p>

              <strong>
                Something
                <br />
                special
              </strong>

              <small>with love, always</small>
            </div>

            <div className="floating-note">
              Made with love ♡
            </div>
          </div>
        </section>

        {/* Offer Banner */}

        <OfferBanner offer={activeOffer} />

        {/* Collections */}

        <section
          className="category-section"
          id="collections"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Find your feeling</p>
              <h2>Shop by occasion</h2>
            </div>

            <a href="#shop" className="text-button">
              View all →
            </a>
          </div>

          <div className="category-grid">
            <a href="#shop" className="category-card rose">
              <span>💐</span>
              <h3>For Her</h3>
              <p>Soft, lovely and unforgettable</p>
            </a>

            <a href="#shop" className="category-card plum">
              <span>🎀</span>
              <h3>For Him</h3>
              <p>Thoughtful gifts with character</p>
            </a>

            <a href="#shop" className="category-card cream">
              <span>✨</span>
              <h3>Just Because</h3>
              <p>Little surprises, big feelings</p>
            </a>

            <a href="#shop" className="category-card gold">
              <span>🎉</span>
              <h3>Celebrations</h3>
              <p>Make every moment special</p>
            </a>
          </div>
        </section>

        {/* Products */}

        <section className="product-section" id="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Our favourites</p>
              <h2>Gifts worth giving</h2>
            </div>

            <a href="#shop" className="text-button">
              Shop all →
            </a>
          </div>

          <div className="product-grid">
            {products.map((product) => {
              const productStock = Number(
                product.stock || 0
              );

              const isOutOfStock = productStock <= 0;

              return (
                <article
                  className={`product-card ${
                    isOutOfStock
                      ? "product-out-of-stock"
                      : ""
                  }`}
                  key={product.id}
                >
                  <ProductImage product={product} />

                  <div className="product-info">
                    <p>{product.category}</p>

                    <h3>{product.name}</h3>

                    <strong>{product.price}</strong>

                    {isOutOfStock ? (
                      <span className="stock-status out-of-stock">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="stock-status in-stock">
                        In Stock
                      </span>
                    )}

                    {isOutOfStock ? (
                      <button
                        type="button"
                        className="add-cart-button disabled"
                        disabled
                      >
                        Out of Stock
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="add-cart-button"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart <span>+</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Story Section */}

        <section className="story-section" id="about">
          <div className="story-image">
            <span>🎁</span>
          </div>

          <div className="story-content">
            <p className="eyebrow">The Auria way</p>

            <h2>Every gift tells a story.</h2>

            <p>
              We believe the most beautiful gifts are the
              ones that make someone feel remembered,
              appreciated and loved.
            </p>

            <a href="#shop" className="primary-button">
              Discover our story <span>→</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}

      <footer>
        <div className="footer-brand">
          <h2>Auria Gift</h2>
          <p>Thoughtfully yours.</p>
        </div>

        <p>© 2026 Auria Gift. Made with love.</p>
      </footer>

      {/* Shopping Cart */}

      <CartDrawer
        cart={cart}
        products={products}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onIncrease={increaseCartQuantity}
        onDecrease={decreaseCartQuantity}
        onRemove={removeFromCart}
        onOrderComplete={(order) => {
          setOrders((currentOrders) => [order, ...currentOrders]);
          setCart([]);
        }}
      />

      {/* Admin Panel */}

      {isAdminOpen && (
        <AdminPanel
          products={products}
          setProducts={setProducts}
          offers={offers}
          setOffers={setOffers}
          orders={orders}
          setOrders={setOrders}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}

export default App;