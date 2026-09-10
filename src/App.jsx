import { useEffect, useRef, useState } from "react";
import "./App.css";

const WHATSAPP_NUMBER = "94782676693";

const couponCodes = {
  AURIA10: { type: "percent", value: 10, label: "10% OFF" },
  GIFT500: { type: "fixed", value: 500, label: "LKR 500 OFF" },
};

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
  coupons,
}) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [surpriseCoupon, setSurpriseCoupon] = useState(null);
  const previousSubtotalRef = useRef(0);
  const unlockedCouponIdsRef = useRef(new Set());

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

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.round((subtotal * appliedCoupon.value) / 100)
      : Math.min(appliedCoupon.value, subtotal)
    : 0;

  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCheckoutMessage("Coupon code එක ඇතුළත් කරන්න.");
      return;
    }

    const coupon = coupons.find(
      (item) => item.code.toUpperCase() === code && item.active
    );

    if (!coupon) {
      setAppliedCoupon(null);
      setCheckoutMessage("Invalid or inactive coupon code එකක්. නැවත check කරන්න.");
      return;
    }

    if (coupon.expiry && new Date(`${coupon.expiry}T23:59:59`) < new Date()) {
      setAppliedCoupon(null);
      setCheckoutMessage("මේ coupon එකේ validity period එක ඉවරයි.");
      return;
    }

    if (subtotal < Number(coupon.minOrder || 0)) {
      setAppliedCoupon(null);
      setCheckoutMessage(
        `මේ coupon එක භාවිතා කරන්න minimum order එක LKR ${Number(coupon.minOrder || 0).toLocaleString("en-LK")} ක් විය යුතුයි.`
      );
      return;
    }

    setCouponCode(code);
    setAppliedCoupon({ ...coupon, code });
    setCheckoutMessage(`${code} coupon එක apply කළා — ${coupon.label}.`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCheckoutMessage("");
  };

  useEffect(() => {
    const previousSubtotal = previousSubtotalRef.current;

    // Reset the unlock session when the cart becomes empty.
    if (subtotal <= 0) {
      previousSubtotalRef.current = 0;
      unlockedCouponIdsRef.current.clear();
      setSurpriseCoupon(null);
      return;
    }

    // Trigger when the cart crosses a coupon minimum OR when the cart
    // is already above the minimum (for example after a page refresh).
    const unlockedCoupon = coupons.find((coupon) => {
      const minimum = Number(coupon.minOrder || 0);

      if (!coupon.active || minimum <= 0) return false;
      if (unlockedCouponIdsRef.current.has(coupon.id)) return false;

      const notExpired =
        !coupon.expiry ||
        new Date(`${coupon.expiry}T23:59:59`) >= new Date();

      return (
        notExpired &&
        subtotal >= minimum &&
        (previousSubtotal < minimum || previousSubtotal === 0)
      );
    });

    if (unlockedCoupon && !appliedCoupon && !surpriseCoupon) {
      unlockedCouponIdsRef.current.add(unlockedCoupon.id);
      setSurpriseCoupon(unlockedCoupon);
    }

    previousSubtotalRef.current = subtotal;
  }, [subtotal, coupons]);

  useEffect(() => {
    // If the cart total changes, only keep an applied coupon while it remains valid.
    if (appliedCoupon) {
      const stillValid =
        appliedCoupon.active &&
        (!appliedCoupon.expiry ||
          new Date(`${appliedCoupon.expiry}T23:59:59`) >= new Date()) &&
        subtotal >= Number(appliedCoupon.minOrder || 0);

      if (!stillValid) {
        setAppliedCoupon(null);
        setCouponCode("");
      }
    }
  }, [subtotal, appliedCoupon]);

  if (!isOpen) return null;

  const unlockedCoupons = coupons.filter((coupon) => {
    const isActive = coupon.active;
    const notExpired =
      !coupon.expiry ||
      new Date(`${coupon.expiry}T23:59:59`) >= new Date();
    const minimumReached = subtotal >= Number(coupon.minOrder || 0);

    return isActive && notExpired && minimumReached;
  });

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

Subtotal: LKR ${subtotal.toLocaleString("en-LK")}
${appliedCoupon ? `Coupon: ${appliedCoupon.code} (${appliedCoupon.label})\nDiscount: LKR ${discountAmount.toLocaleString("en-LK")}\n` : ""}Total Items: ${cartCount}
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
      subtotal,
      couponCode: appliedCoupon?.code || "",
      discount: discountAmount,
      total,
      status: "Pending",
    });

    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCheckoutMessage("");
    setCouponCode("");
    setAppliedCoupon(null);
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

        {surpriseCoupon && (
          <>
            <style>{`
              .coupon-surprise-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: rgba(45, 25, 35, 0.48);
                backdrop-filter: blur(8px);
                animation: auriaCouponFadeIn .3s ease both;
              }

              .coupon-surprise-card {
                position: relative;
                width: min(420px, 100%);
                padding: 34px 28px 28px;
                border: 1px solid #ead3c8;
                border-radius: 28px;
                background: #fffaf7;
                box-shadow: 0 25px 70px rgba(45, 25, 35, .28);
                text-align: center;
                animation: auriaCouponPop .65s cubic-bezier(.17,.89,.32,1.35) both;
              }

              .coupon-surprise-close {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 34px;
                height: 34px;
                border: 1px solid #e2c9bd;
                border-radius: 50%;
                background: #fff;
                color: #79564e;
                font-size: 20px;
                cursor: pointer;
              }

              .coupon-surprise-icon {
                width: 82px;
                height: 82px;
                margin: 0 auto 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: #f4e2da;
                font-size: 44px;
                animation: auriaGiftBounce 1s ease-in-out .1s infinite;
              }

              .coupon-surprise-eyebrow {
                margin-bottom: 7px;
                color: #a56c7c;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: .18em;
              }

              .coupon-surprise-card h3 {
                margin: 0 0 8px;
                color: #422b34;
                font-size: 25px;
              }

              .coupon-surprise-card p {
                margin: 0 0 20px;
                color: #96766b;
                font-size: 14px;
              }

              .coupon-surprise-code {
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin: 0 auto 20px;
                padding: 16px;
                border: 1px dashed #c99582;
                border-radius: 16px;
                background: #fdf1ec;
                animation: auriaCodeGlow 1.4s ease-in-out .3s infinite alternate;
              }

              .coupon-surprise-code strong {
                color: #713f58;
                font-size: 24px;
                letter-spacing: .08em;
              }

              .coupon-surprise-code span {
                color: #9b6d60;
                font-size: 13px;
                font-weight: 600;
              }

              .coupon-surprise-use {
                width: 100%;
                min-height: 52px;
                border: none;
                border-radius: 14px;
                background: #3b1f35;
                color: #fff;
                font-family: inherit;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 10px 25px rgba(59, 31, 53, .2);
                transition: transform .2s ease, box-shadow .2s ease;
              }

              .coupon-surprise-use:hover {
                transform: translateY(-2px);
                box-shadow: 0 14px 30px rgba(59, 31, 53, .28);
              }

              .coupon-confetti {
                position: absolute;
                inset: 0;
                overflow: hidden;
                pointer-events: none;
              }

              .coupon-confetti span {
                position: absolute;
                top: 15%;
                left: 50%;
                color: #9b6d60;
                font-size: 25px;
                opacity: 0;
                animation: auriaConfetti 1.7s ease-out infinite;
              }

              .coupon-confetti span:nth-child(1) { margin-left: -210px; animation-delay: .05s; }
              .coupon-confetti span:nth-child(2) { margin-left: -125px; animation-delay: .22s; }
              .coupon-confetti span:nth-child(3) { margin-left: -45px; animation-delay: .38s; }
              .coupon-confetti span:nth-child(4) { margin-left: 55px; animation-delay: .14s; }
              .coupon-confetti span:nth-child(5) { margin-left: 135px; animation-delay: .3s; }
              .coupon-confetti span:nth-child(6) { margin-left: 205px; animation-delay: .5s; }

              @keyframes auriaCouponFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              @keyframes auriaCouponPop {
                0% { opacity: 0; transform: scale(.55) translateY(35px) rotate(-2deg); }
                65% { opacity: 1; transform: scale(1.04) translateY(-5px) rotate(.5deg); }
                100% { opacity: 1; transform: scale(1) translateY(0) rotate(0); }
              }

              @keyframes auriaGiftBounce {
                0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
                50% { transform: translateY(-9px) rotate(-5deg) scale(1.05); }
              }

              @keyframes auriaCodeGlow {
                from { transform: scale(1); box-shadow: 0 0 0 rgba(165, 108, 124, 0); }
                to { transform: scale(1.025); box-shadow: 0 8px 28px rgba(165, 108, 124, .18); }
              }

              @keyframes auriaConfetti {
                0% { opacity: 0; transform: translateY(-10px) scale(.5) rotate(0deg); }
                20% { opacity: 1; }
                100% { opacity: 0; transform: translateY(420px) scale(1.2) rotate(220deg); }
              }

              @media (prefers-reduced-motion: reduce) {
                .coupon-surprise-overlay,
                .coupon-surprise-card,
                .coupon-surprise-icon,
                .coupon-surprise-code,
                .coupon-confetti span {
                  animation: none !important;
                }
              }

              @media (max-width: 480px) {
                .coupon-surprise-card {
                  padding: 30px 20px 22px;
                  border-radius: 24px;
                }

                .coupon-surprise-card h3 {
                  font-size: 21px;
                }

                .coupon-surprise-icon {
                  width: 70px;
                  height: 70px;
                  font-size: 37px;
                }
              }
            `}</style>

            <div className="coupon-surprise-overlay" role="dialog" aria-live="polite">
            <div className="coupon-confetti" aria-hidden="true">
              <span>✦</span><span>✧</span><span>•</span><span>✦</span><span>✧</span><span>•</span>
            </div>

            <div className="coupon-surprise-card">
              <button
                type="button"
                className="coupon-surprise-close"
                onClick={() => setSurpriseCoupon(null)}
                aria-label="Close coupon surprise"
              >
                ×
              </button>

              <div className="coupon-surprise-icon">🎁</div>
              <div className="coupon-surprise-eyebrow">SPECIAL SURPRISE</div>
              <h3>🎉 You unlocked a coupon!</h3>
              <p>Your order just reached the minimum spend.</p>

              <div className="coupon-surprise-code">
                <strong>{surpriseCoupon.code}</strong>
                <span>{surpriseCoupon.label}</span>
              </div>

              <button
                type="button"
                className="coupon-surprise-use"
                onClick={() => {
                  setCouponCode(surpriseCoupon.code);
                  setAppliedCoupon(surpriseCoupon);
                  setCheckoutMessage(
                    `${surpriseCoupon.code} coupon එක apply කළා — ${surpriseCoupon.label}.`
                  );
                  setSurpriseCoupon(null);
                }}
              >
                Use My Surprise Coupon ✨
              </button>
            </div>
          </div>
          </>
        )}

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

              <div className="checkout-summary-row checkout-subtotal-row">
                <span>Subtotal</span>
                <strong>LKR {subtotal.toLocaleString("en-LK")}</strong>
              </div>

              {discountAmount > 0 && (
                <div className="checkout-summary-row checkout-discount-row">
                  <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ""}</span>
                  <strong>- LKR {discountAmount.toLocaleString("en-LK")}</strong>
                </div>
              )}

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

              {unlockedCoupons.length > 0 && !appliedCoupon && (
                <div className="coupon-unlocked-box">
                  <div className="coupon-unlocked-title">
                    🎉 You unlocked a coupon!
                  </div>
                  <div className="coupon-unlocked-subtitle">
                    Your order is eligible for these discounts.
                  </div>

                  <div className="coupon-unlocked-list">
                    {unlockedCoupons.map((coupon) => (
                      <button
                        type="button"
                        className="coupon-unlocked-item"
                        key={coupon.id}
                        onClick={() => {
                          setCouponCode(coupon.code);
                          setAppliedCoupon(coupon);
                          setCheckoutMessage(
                            `${coupon.code} coupon එක apply කළා — ${coupon.label}.`
                          );
                        }}
                      >
                        <span>
                          <strong>{coupon.code}</strong>
                          <small>{coupon.label}</small>
                        </span>
                        <span className="coupon-use-now">Use</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="coupon-box">
                <label>
                  Discount Coupon
                  <div className="coupon-input-row">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      disabled={Boolean(appliedCoupon)}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        className="coupon-remove-button"
                        onClick={handleRemoveCoupon}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="coupon-apply-button"
                        onClick={handleApplyCoupon}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </label>

                <small>Try: AURIA10 or GIFT500</small>
              </div>

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
  coupons,
  setCoupons,
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

  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState("percent");
  const [couponValue, setCouponValue] = useState("");
  const [couponMinOrder, setCouponMinOrder] = useState("0");
  const [couponExpiry, setCouponExpiry] = useState("");
  const [couponActive, setCouponActive] = useState(true);

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

  const handleAddCoupon = (event) => {
    event.preventDefault();

    const code = couponCode.trim().toUpperCase();
    const value = Number(couponValue);
    const minOrder = Number(couponMinOrder || 0);

    if (!code || !couponValue) {
      setMessage("Coupon code සහ discount value ඇතුළත් කරන්න.");
      return;
    }

    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
      setMessage("Coupon code එක 3-20 characters අතර letters/numbers වලින් යොදන්න.");
      return;
    }

    if (value <= 0 || Number.isNaN(value)) {
      setMessage("Discount value එක 0 ට වැඩි අගයක් විය යුතුයි.");
      return;
    }

    if (couponType === "percent" && value > 100) {
      setMessage("Percentage discount එක 100% ට වඩා වැඩි වෙන්න බැහැ.");
      return;
    }

    if (minOrder < 0 || Number.isNaN(minOrder)) {
      setMessage("Minimum order value එක නිවැරදිව ඇතුළත් කරන්න.");
      return;
    }

    const alreadyExists = coupons.some(
      (coupon) => coupon.code.toUpperCase() === code
    );

    if (alreadyExists) {
      setMessage("මේ coupon code එක දැනටමත් තියෙනවා.");
      return;
    }

    const label =
      couponType === "percent"
        ? `${value}% OFF`
        : `LKR ${value.toLocaleString("en-LK")} OFF`;

    const newCoupon = {
      id: Date.now(),
      code,
      type: couponType,
      value,
      minOrder,
      expiry: couponExpiry,
      active: couponActive,
      label,
    };

    setCoupons((currentCoupons) => [
      ...currentCoupons,
      newCoupon,
    ]);

    setCouponCode("");
    setCouponValue("");
    setCouponMinOrder("0");
    setCouponExpiry("");
    setCouponType("percent");
    setCouponActive(true);
    setMessage(`Coupon ${code} සාර්ථකව add කළා.`);
  };

  const handleToggleCoupon = (id) => {
    setCoupons((currentCoupons) =>
      currentCoupons.map((coupon) =>
        coupon.id === id
          ? { ...coupon, active: !coupon.active }
          : coupon
      )
    );

    setMessage("Coupon status එක update කළා.");
  };

  const handleDeleteCoupon = (id) => {
    const confirmed = window.confirm("මේ coupon එක delete කරන්නද?");

    if (!confirmed) return;

    setCoupons((currentCoupons) =>
      currentCoupons.filter((coupon) => coupon.id !== id)
    );

    setMessage("Coupon එක delete කළා.");
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
          <a href="#admin-coupons">Coupons</a>
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

          <form
            id="admin-coupons"
            className="product-form coupon-admin-form"
            onSubmit={handleAddCoupon}
          >
            <h3>Discount Coupons</h3>

            <label>
              Coupon code
              <input
                type="text"
                placeholder="Example: AURIA10"
                value={couponCode}
                onChange={(event) =>
                  setCouponCode(event.target.value.toUpperCase())
                }
                maxLength="20"
              />
            </label>

            <label>
              Discount type
              <select
                value={couponType}
                onChange={(event) => setCouponType(event.target.value)}
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (LKR)</option>
              </select>
            </label>

            <label>
              Discount value
              <input
                type="number"
                min="1"
                max={couponType === "percent" ? "100" : undefined}
                placeholder={couponType === "percent" ? "Example: 10" : "Example: 500"}
                value={couponValue}
                onChange={(event) => setCouponValue(event.target.value)}
              />
            </label>

            <label>
              Minimum order value
              <input
                type="number"
                min="0"
                placeholder="Example: 3000"
                value={couponMinOrder}
                onChange={(event) => setCouponMinOrder(event.target.value)}
              />
            </label>

            <label>
              Expiry date
              <input
                type="date"
                value={couponExpiry}
                onChange={(event) => setCouponExpiry(event.target.value)}
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={couponActive}
                onChange={(event) => setCouponActive(event.target.checked)}
              />
              Coupon active
            </label>

            <button
              type="submit"
              className="primary-button admin-submit"
            >
              Add Coupon <span>+</span>
            </button>

            <div className="admin-coupon-list">
              <div className="admin-products-heading">
                <h3>Current Coupons</h3>
                <span>{coupons.length} coupons</span>
              </div>

              {coupons.length === 0 ? (
                <p className="empty-admin-message">
                  තවම coupons add කරලා නැහැ.
                </p>
              ) : (
                coupons.map((coupon) => (
                  <div className="admin-coupon-row" key={coupon.id}>
                    <div className="admin-coupon-main">
                      <strong>{coupon.code}</strong>
                      <span>{coupon.label}</span>
                      <small>
                        Min. order: LKR {Number(coupon.minOrder || 0).toLocaleString("en-LK")}
                        {coupon.expiry ? ` • Expires: ${coupon.expiry}` : " • No expiry"}
                      </small>
                    </div>

                    <div className="admin-coupon-actions">
                      <button
                        type="button"
                        className={coupon.active ? "status-button active" : "status-button"}
                        onClick={() => handleToggleCoupon(coupon.id)}
                      >
                        {coupon.active ? "Active" : "Inactive"}
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </form>

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

  const [coupons, setCoupons] = useState(() => {
    const savedCoupons = localStorage.getItem("auria-coupons");

    if (!savedCoupons) {
      return [
        {
          id: 1,
          code: "AURIA10",
          type: "percent",
          value: 10,
          minOrder: 3000,
          expiry: "",
          active: true,
          label: "10% OFF",
        },
        {
          id: 2,
          code: "GIFT500",
          type: "fixed",
          value: 500,
          minOrder: 3000,
          expiry: "",
          active: true,
          label: "LKR 500 OFF",
        },
      ];
    }

    try {
      const parsedCoupons = JSON.parse(savedCoupons);

      // Migrate the original demo coupons so the requested LKR 3,000
      // unlock rule works even if the browser already has older localStorage.
      return parsedCoupons.map((coupon) => {
        if (
          (coupon.code === "AURIA10" || coupon.code === "GIFT500") &&
          Number(coupon.minOrder || 0) === 0
        ) {
          return {
            ...coupon,
            minOrder: 3000,
          };
        }

        return coupon;
      });
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

  useEffect(() => {
    localStorage.setItem("auria-coupons", JSON.stringify(coupons));
  }, [coupons]);

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
        coupons={coupons}
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
          coupons={coupons}
          setCoupons={setCoupons}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}

export default App;