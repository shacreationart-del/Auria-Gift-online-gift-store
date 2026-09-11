import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
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

function ProductImage({ product, onWishlist }) {
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
        onClick={() => onWishlist?.(product)}
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
/* Product Reviews */
/* ============================= */

function ReviewModal({
  product,
  reviews,
  onClose,
  onAddReview,
}) {
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  if (!product) return null;

  const productReviews = reviews
    .filter((review) => review.productId === product.id)
    .sort((a, b) => b.id - a.id);

  const average =
    productReviews.length > 0
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) /
        productReviews.length
      : 0;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!customerName.trim() || !comment.trim()) {
      setReviewMessage("Name සහ review එක දෙකම ඇතුළත් කරන්න.");
      return;
    }

    onAddReview({
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      customerName: customerName.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      date: new Date().toLocaleDateString("en-LK"),
    });

    setCustomerName("");
    setRating(5);
    setComment("");
    setReviewMessage("Review එක සාර්ථකව add කළා. ❤️");
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <button
          type="button"
          className="review-modal-close"
          onClick={onClose}
          aria-label="Close reviews"
        >
          ×
        </button>

        <p className="eyebrow">Customer Reviews</p>
        <h2>{product.name}</h2>

        <div className="review-summary">
          <div className="review-big-rating">
            <strong>
              {average > 0 ? average.toFixed(1) : "New"}
            </strong>

            {average > 0 && (
              <div className="review-stars" aria-label={`${average.toFixed(1)} out of 5 stars`}>
                {"★★★★★".split("").map((star, index) => (
                  <span
                    key={index}
                    className={
                      index < Math.round(average)
                        ? "star filled"
                        : "star"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            <small>
              {productReviews.length} review
              {productReviews.length !== 1 ? "s" : ""}
            </small>
          </div>
        </div>

        <div className="review-list">
          {productReviews.length === 0 ? (
            <div className="empty-reviews">
              <span>♡</span>
              <p>No reviews yet.</p>
              <small>Be the first customer to share your experience.</small>
            </div>
          ) : (
            productReviews.map((review) => (
              <article className="review-item" key={review.id}>
                <div className="review-item-header">
                  <div>
                    <strong>{review.customerName}</strong>
                    <small>{review.date}</small>
                  </div>

                  <div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                    {"★★★★★".split("").map((star, index) => (
                      <span
                        key={index}
                        className={
                          index < review.rating
                            ? "star filled"
                            : "star"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <p>{review.comment}</p>
              </article>
            ))
          )}
        </div>

        <form className="review-form" onSubmit={handleSubmit}>
          <h3>Write a Review</h3>

          <label>
            Your name
            <input
              type="text"
              placeholder="Example: Nadeesha"
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
            />
          </label>

          <label>
            Your rating
            <div className="rating-picker" role="radiogroup" aria-label="Choose a rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    value <= rating
                      ? "rating-star selected"
                      : "rating-star"
                  }
                  onClick={() => setRating(value)}
                  aria-label={`${value} star`}
                  aria-pressed={value === rating}
                >
                  ★
                </button>
              ))}
            </div>
          </label>

          <label>
            Your review
            <textarea
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              rows="4"
            />
          </label>

          {reviewMessage && (
            <p className="review-message">{reviewMessage}</p>
          )}

          <button
            type="submit"
            className="primary-button review-submit"
          >
            Submit Review <span>♡</span>
          </button>
        </form>
      </div>
    </div>
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

  const hasPersonalizedProduct = cartItems.some(
    (item) =>
      item.product.category?.toLowerCase() === "personalized" ||
      item.product.type === "frame"
  );

  const handleWhatsAppOrder = async (event) => {
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
${appliedCoupon ? `Coupon: ${appliedCoupon.code} (${appliedCoupon.label})\nDiscount: LKR ${discountAmount.toLocaleString("en-LK")}\n` : ""}${hasPersonalizedProduct ? `

📸 PERSONALIZED PHOTO / පුද්ගලීකරණ ඡායාරූපය

සිංහල:
මෙය Personalized Product එකක් බැවින්, කරුණාකර ඔබට අවශ්‍ය ඡායාරූපය මෙම WhatsApp Chat එකට වෙනම Upload / Attach කරන්න.
හොඳම Quality එක සඳහා Original / High-Resolution Photo එකක් එවන්න. Original Quality එක ආරක්ෂා කරගැනීමට Photo එක WhatsApp එකේ Document ලෙස Attach කරන්න. Photo එක 10MB ට වඩා වැඩි වුවත් ගැටලුවක් නැහැ.

English:
Since this is a Personalized Product, please Upload / Attach the required photo directly to this WhatsApp Chat.
For the best quality, please send the Original / High-Resolution Photo as a Document on WhatsApp. The photo can be larger than 10MB.

` : ""}Total Items: ${cartCount}
Order Total: LKR ${total.toLocaleString("en-LK")}

Thank you.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    const orderSaved = await onOrderComplete({
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

    if (orderSaved === false) {
      setCheckoutMessage("Order save failed. Please try again.");
      return;
    }

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
/* Admin Login - Supabase Auth */
/* ============================= */

function AdminLogin({ onLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Email සහ Password දෙකම ඇතුළත් කරන්න.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    if (authError || !data.user) {
      setPassword("");
      setIsSubmitting(false);
      setError(
        authError?.message === "Invalid login credentials"
          ? "Email හෝ Password වැරදියි."
          : authError?.message || "Login failed. නැවත උත්සාහ කරන්න."
      );
      return;
    }

    // Server-side authorization check.
    // The RLS policy only allows an authenticated user to read
    // their own admin_roles row.
    const { data: adminRole, error: roleError } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (roleError || adminRole?.role !== "admin") {
      await supabase.auth.signOut();
      setPassword("");
      setIsSubmitting(false);
      setError("මෙම account එකට Admin access ලබාදී නැහැ.");
      return;
    }

    setPassword("");
    setIsSubmitting(false);
    setError("");
    onLogin(data.user);
  };

  return (
    <div className="admin-login-overlay">
      <style>{`
        .admin-login-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(39, 24, 32, .72);
          backdrop-filter: blur(12px);
        }

        .admin-login-card {
          position: relative;
          width: min(430px, 100%);
          padding: 38px;
          border: 1px solid #ead6cb;
          border-radius: 26px;
          background: #fffaf7;
          box-shadow: 0 30px 80px rgba(25, 14, 21, .3);
          animation: adminLoginIn .45s ease both;
        }

        .admin-login-brand {
          margin-bottom: 26px;
          text-align: center;
        }

        .admin-login-brand .eyebrow {
          margin-bottom: 8px;
        }

        .admin-login-brand h2 {
          margin: 0;
          color: #3b1f35;
          font-family: Georgia, serif;
          font-size: 32px;
          font-weight: 500;
        }

        .admin-login-subtitle {
          margin: 8px auto 0;
          max-width: 300px;
          color: #90756d;
          font-size: 12px;
          line-height: 1.6;
        }

        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .admin-login-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .admin-login-field label {
          color: #6d4b53;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .04em;
        }

        .admin-login-input-wrap {
          position: relative;
        }

        .admin-login-input {
          width: 100%;
          box-sizing: border-box;
          min-height: 50px;
          padding: 0 14px;
          border: 1px solid #dfc8bd;
          border-radius: 12px;
          outline: none;
          background: #fff;
          color: #3b1f35;
          font-family: inherit;
          font-size: 13px;
          transition: border-color .2s, box-shadow .2s;
        }

        .admin-login-input:focus {
          border-color: #8c5c6d;
          box-shadow: 0 0 0 3px rgba(140, 92, 109, .1);
        }

        .admin-password-input {
          padding-right: 72px;
        }

        .admin-show-password {
          position: absolute;
          top: 50%;
          right: 9px;
          transform: translateY(-50%);
          padding: 7px 9px;
          border: 0;
          border-radius: 8px;
          background: #f7eee9;
          color: #795565;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .admin-login-error {
          margin: 0;
          padding: 10px 12px;
          border: 1px solid #edc9c9;
          border-radius: 10px;
          background: #fff1f1;
          color: #a34c4c;
          font-size: 11px;
          line-height: 1.5;
        }

        .admin-login-actions {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          margin-top: 4px;
        }

        .admin-login-submit,
        .admin-login-cancel {
          min-height: 50px;
          border-radius: 12px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .admin-login-submit {
          border: 0;
          background: #3b1f35;
          color: #fff;
          box-shadow: 0 10px 25px rgba(59, 31, 53, .18);
        }

        .admin-login-submit:disabled {
          cursor: not-allowed;
          opacity: .6;
        }

        .admin-login-cancel {
          padding: 0 17px;
          border: 1px solid #dfc8bd;
          background: #fff;
          color: #795565;
        }

        .admin-login-security-note {
          margin: 17px 0 0;
          text-align: center;
          color: #a2877e;
          font-size: 10px;
          line-height: 1.6;
        }

        @keyframes adminLoginIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 480px) {
          .admin-login-card {
            padding: 28px 20px;
            border-radius: 22px;
          }

          .admin-login-brand h2 {
            font-size: 27px;
          }

          .admin-login-actions {
            grid-template-columns: 1fr;
          }

          .admin-login-cancel {
            min-height: 46px;
          }
        }
      `}</style>

      <div className="admin-login-card">
        <div className="admin-login-brand">
          <p className="eyebrow">Secure Administration</p>
          <h2>Auria Gift</h2>
          <p className="admin-login-subtitle">
            Sign in with your authorized Supabase Admin account.
          </p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label htmlFor="auria-admin-email">Admin Email</label>
            <input
              id="auria-admin-email"
              className="admin-login-input"
              type="email"
              autoComplete="username"
              placeholder="admin@auriagift.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="auria-admin-password">Password</label>

            <div className="admin-login-input-wrap">
              <input
                id="auria-admin-password"
                className="admin-login-input admin-password-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />

              <button
                type="button"
                className="admin-show-password"
                onClick={() => setShowPassword((current) => !current)}
                disabled={isSubmitting}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {error && <p className="admin-login-error">{error}</p>}

          <div className="admin-login-actions">
            <button
              type="submit"
              className="admin-login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Secure Login →"}
            </button>

            <button
              type="button"
              className="admin-login-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="admin-login-security-note">
          Authentication is handled by Supabase Auth. Admin authorization is
          checked against the protected database role.
        </p>
      </div>
    </div>
  );
}

/* ============================= */
/* Admin Panel */
/* ============================= */

function AdminPanel({
  products,
  onAddProduct,
  onDeleteProduct,
  onUpdateStock,
  offers,
  setOffers,
  orders,
  setOrders,
  onUpdateOrderStatus,
  onDeleteOrder,
  coupons,
  setCoupons,
  reviews,
  onDeleteReview,
  newOrderIds = [],
  onMarkOrdersSeen,
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

  const handleAddProduct = async (event) => {
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

    const saved = await onAddProduct(newProduct);
    if (!saved) return;

    setName("");
    setPrice("");
    setStock("0");
    setCategory("Gift Boxes");
    setImage("");
    setMessage("Product එක සාර්ථකව add කළා.");
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm(
      "මේ product එක delete කරන්නද?"
    );

    if (!confirmed) return;

    const deleted = await onDeleteProduct(id);
    if (!deleted) return;

    setMessage("Product එක delete කළා.");
  };

  const handleUpdateStock = async (id, value) => {
    const newStock = Math.max(0, Number(value) || 0);

    const updated = await onUpdateStock(id, newStock);
    if (!updated) return;

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

  const handleUpdateOrderStatus = async (id, status) => {
    await onUpdateOrderStatus(id, status);
  };

  const handleDeleteOrder = async (id) => {
    const confirmed = window.confirm("මේ order එක delete කරන්නද?");

    if (!confirmed) return;

    await onDeleteOrder(id);
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

  const adminNewOrderStyles = `
    .admin-new-order-alert{display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:13px 15px;border:1px solid #e1b9a8;border-radius:15px;background:linear-gradient(135deg,#fff4ec,#fffaf7);box-shadow:0 8px 24px rgba(91,49,39,.08);animation:newOrderAlertIn .45s ease both}
    .admin-new-order-alert-icon{display:flex;align-items:center;justify-content:center;width:40px;height:40px;flex:0 0 40px;border-radius:50%;background:#3b1f35;color:#fff;font-size:18px;animation:newOrderBell 1.2s ease-in-out infinite}
    .admin-new-order-alert-text{display:flex;flex:1;flex-direction:column;gap:3px}
    .admin-new-order-alert-text strong{color:#4a2832;font-family:Georgia,serif;font-size:15px}
    .admin-new-order-alert-text span{color:#876b62;font-size:11px;line-height:1.4}
    .admin-new-order-seen{flex:0 0 auto;padding:8px 12px;border:1px solid #d8b6aa;border-radius:9px;background:#fff;color:#714657;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer}
    .admin-new-order-seen:hover{background:#3b1f35;border-color:#3b1f35;color:#fff}
    .admin-header-actions {
      display: flex;
      align-items: center;
      gap: 9px;
    }

    .admin-logout-button {
      min-height: 38px;
      padding: 0 13px;
      border: 1px solid #dcc2b7;
      border-radius: 10px;
      background: #fffaf7;
      color: #704756;
      font-family: inherit;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: .2s ease;
    }

    .admin-logout-button:hover {
      border-color: #3b1f35;
      background: #3b1f35;
      color: #fff;
      transform: translateY(-1px);
    }

    .admin-order-card.new-order-highlight{position:relative;border:2px solid #b77862!important;box-shadow:0 0 0 4px rgba(183,120,98,.11),0 15px 35px rgba(91,49,39,.12)!important;animation:newOrderHighlight 1.1s ease-in-out 3}
    .new-order-badge{display:inline-flex;align-items:center;width:fit-content;margin-bottom:5px;padding:4px 8px;border-radius:999px;background:#3b1f35;color:#fff;font-size:9px;font-weight:800;letter-spacing:.08em;animation:newOrderBadgePop .35s ease both}
    @keyframes newOrderAlertIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes newOrderBell{0%,100%{transform:rotate(0)}15%{transform:rotate(12deg)}30%{transform:rotate(-12deg)}45%{transform:rotate(8deg)}60%{transform:rotate(-5deg)}}
    @keyframes newOrderHighlight{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
    @keyframes newOrderBadgePop{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
    @media(max-width:600px){
      .admin-new-order-alert{align-items:flex-start;flex-wrap:wrap}
      .admin-new-order-alert-text{min-width:0}
      .admin-new-order-seen{width:100%;margin-left:52px}
      .admin-header-actions{gap:6px}
      .admin-logout-button{padding:0 9px;font-size:10px}
    }
  `;

  return (
    <div className="admin-overlay">
      <style>{adminNewOrderStyles}</style>
      <div className="admin-panel">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Auria Gift</p>
            <h2>Admin Panel</h2>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-logout-button"
              onClick={onClose}
              aria-label="Logout from admin panel"
            >
              🔐 Logout
            </button>

            <button
              type="button"
              className="admin-close"
              onClick={onClose}
              aria-label="Close admin panel"
            >
              ×
            </button>
          </div>
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
          <a href="#admin-reviews">Reviews</a>
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

          <div id="admin-reviews" className="admin-products">
            <div className="admin-products-heading">
              <h3>Customer Reviews</h3>
              <span>{reviews.length} reviews</span>
            </div>

            <div className="admin-review-list">
              {reviews.length === 0 ? (
                <p className="empty-admin-message">
                  තවම customer reviews add කරලා නැහැ.
                </p>
              ) : (
                reviews
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((review) => (
                    <div className="admin-review-row" key={review.id}>
                      <div className="admin-review-content">
                        <strong>{review.productName}</strong>
                        <span>
                          {review.customerName} • {review.date}
                        </span>
                        <div className="review-stars">
                          {"★★★★★".split("").map((star, index) => (
                            <span
                              key={index}
                              className={
                                index < Number(review.rating)
                                  ? "star filled"
                                  : "star"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p>{review.comment}</p>
                      </div>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => onDeleteReview(review.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div id="admin-customer-orders" className="admin-products admin-orders-section">
            {newOrderIds.length > 0 && (
              <div className="admin-new-order-alert">
                <div className="admin-new-order-alert-icon">🔔</div>
                <div className="admin-new-order-alert-text">
                  <strong>New Customer Order!</strong>
                  <span>
                    අලුත් customer order එකක් ලැබිලා තියෙනවා. පහළින් highlighted order එක බලන්න.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onMarkOrdersSeen}
                  className="admin-new-order-seen"
                >
                  Mark as Seen
                </button>
              </div>
            )}

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
                orders.map((order) => {
                  const isNewOrder = newOrderIds.includes(order.id);

                  return (
                    <div
                      className={`admin-order-card ${
                        isNewOrder ? "new-order-highlight" : ""
                      }`}
                      key={order.id}
                    >
                    <div className="admin-order-header">
                      <div>
                        {isNewOrder && (
                          <span className="new-order-badge">NEW ORDER</span>
                        )}
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
                  );
                })
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
  const [products, setProducts] = useState(defaultProducts);

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

  const [orders, setOrders] = useState([]);

  const [reviews, setReviews] = useState(() => {
    const savedReviews = localStorage.getItem("auria-reviews");

    if (!savedReviews) return [];

    try {
      return JSON.parse(savedReviews);
    } catch {
      return [];
    }
  });

  const [reviewProduct, setReviewProduct] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [newOrderIds, setNewOrderIds] = useState(() => {
    const saved = localStorage.getItem("auria-new-order-ids");
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminAuthLoading, setIsAdminAuthLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifyAdminSession = async (session) => {
      if (!session?.user) {
        if (mounted) {
          setIsAdminAuthenticated(false);
          setIsAdminAuthLoading(false);
        }
        return;
      }

      const { data: adminRole, error: roleError } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (roleError || adminRole?.role !== "admin") {
        await supabase.auth.signOut();
        setIsAdminAuthenticated(false);
      } else {
        setIsAdminAuthenticated(true);
      }

      setIsAdminAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      verifyAdminSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      verifyAdminSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const normalizeProducts = (rows) =>
      (rows || []).map((product) => ({
        ...product,
        stock: Number(product.stock || 0),
      }));

    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,category,price,type,image,stock,created_at")
        .order("id", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("Supabase products load error:", error);
        return;
      }

      if (data && data.length > 0) {
        setProducts(normalizeProducts(data));
        return;
      }

      // First-time migration: use existing browser products when the
      // Supabase table is empty. Only an authenticated admin can write them.
      if (isAdminAuthenticated) {
        let seedProducts = defaultProducts;
        const savedProducts = localStorage.getItem("auria-products");

        if (savedProducts) {
          try {
            const parsed = JSON.parse(savedProducts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              seedProducts = parsed;
            }
          } catch {
            // Keep defaultProducts when old localStorage is invalid.
          }
        }

        const normalizedSeed = normalizeProducts(seedProducts).map(
          ({ created_at, ...product }) => product
        );

        const { data: inserted, error: insertError } = await supabase
          .from("products")
          .upsert(normalizedSeed, { onConflict: "id" })
          .select("id,name,category,price,type,image,stock,created_at")
          .order("id", { ascending: true });

        if (cancelled) return;

        if (insertError) {
          console.error("Supabase products seed error:", insertError);
          return;
        }

        setProducts(normalizeProducts(inserted));
        return;
      }

      // Before the admin has logged in, keep the existing local catalogue
      // visible while the empty database waits for the first admin session.
      const savedProducts = localStorage.getItem("auria-products");
      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(normalizeProducts(parsed));
          }
        } catch {
          // Keep defaultProducts.
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [isAdminAuthenticated]);

  useEffect(() => {
    let cancelled = false;

    const normalizeOrders = (rows) =>
      (rows || []).map((row) => ({
        id: Number(row.id),
        date: row.order_date,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerAddress: row.customer_address,
        items: Array.isArray(row.items) ? row.items : [],
        subtotal: Number(row.subtotal || 0),
        couponCode: row.coupon_code || "",
        discount: Number(row.discount || 0),
        total: Number(row.total || 0),
        status: row.status,
        createdAt: row.created_at,
      }));

    const loadOrders = async () => {
      if (!isAdminAuthenticated) {
        setOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id,order_date,customer_name,customer_phone,customer_address,items,subtotal,coupon_code,discount,total,status,created_at")
        .order("id", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Supabase orders load error:", error);
        return;
      }

      setOrders(normalizeOrders(data));
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [isAdminAuthenticated]);

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
    localStorage.setItem("auria-coupons", JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem("auria-reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(
      "auria-new-order-ids",
      JSON.stringify(newOrderIds)
    );
  }, [newOrderIds]);

  const activeOffer = offers.find(
    (offer) => offer.active
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleAddProductToSupabase = async (product) => {
    const { data, error } = await supabase
      .from("products")
      .insert({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        type: product.type,
        image: product.image,
        stock: Number(product.stock || 0),
      })
      .select("id,name,category,price,type,image,stock,created_at")
      .single();

    if (error) {
      console.error("Supabase product insert error:", error);
      alert(`Product save failed: ${error.message}`);
      return false;
    }

    setProducts((currentProducts) => [
      ...currentProducts,
      { ...data, stock: Number(data.stock || 0) },
    ]);
    return true;
  };

  const handleDeleteProductFromSupabase = async (id) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase product delete error:", error);
      alert(`Product delete failed: ${error.message}`);
      return false;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id)
    );
    return true;
  };

  const handleUpdateProductStockInSupabase = async (id, newStock) => {
    const { data, error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", id)
      .select("id,stock")
      .single();

    if (error) {
      console.error("Supabase product stock update error:", error);
      alert(`Stock update failed: ${error.message}`);
      return false;
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id
          ? { ...product, stock: Number(data.stock || 0) }
          : product
      )
    );
    return true;
  };

  const handleAddReview = (review) => {
    setReviews((currentReviews) => [
      ...currentReviews,
      review,
    ]);
  };

  const handleDeleteReview = (id) => {
    const confirmed = window.confirm("මේ review එක delete කරන්නද?");

    if (!confirmed) return;

    setReviews((currentReviews) =>
      currentReviews.filter((review) => review.id !== id)
    );
  };

  const getProductRating = (productId) => {
    const productReviews = reviews.filter(
      (review) => review.productId === productId
    );

    if (!productReviews.length) {
      return {
        average: 0,
        count: 0,
      };
    }

    const average =
      productReviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0
      ) / productReviews.length;

    return {
      average,
      count: productReviews.length,
    };
  };

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

  const productCategories = [
    "All",
    ...Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      )
    ),
  ];

  const visibleProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  const getCategoryCount = (category) =>
    category === "All"
      ? products.length
      : products.filter(
          (product) => product.category === category
        ).length;
  const categoryBarStyles = `
    .product-category-bar {
      margin: 24px 0 10px;
      padding: 8px;
      border: 1px solid #eadbd2;
      border-radius: 18px;
      background: rgba(255, 250, 247, .92);
      box-shadow: 0 8px 24px rgba(64, 42, 45, .05);
    }

    .product-category-scroll {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding: 2px;
      scrollbar-width: thin;
    }

    .product-category-scroll::-webkit-scrollbar {
      height: 5px;
    }

    .product-category-tab {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 42px;
      padding: 0 15px;
      border: 1px solid #e3cfc4;
      border-radius: 999px;
      background: #fffdfb;
      color: #76564d;
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all .22s ease;
    }

    .product-category-tab small {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 21px;
      height: 21px;
      padding: 0 5px;
      border-radius: 999px;
      background: #f4e7e1;
      color: #9b7167;
      font-size: 10px;
      font-weight: 700;
    }

    .product-category-tab:hover {
      transform: translateY(-1px);
      border-color: #b98292;
      color: #713f58;
    }

    .product-category-tab.active {
      border-color: #3b1f35;
      background: #3b1f35;
      color: #fff;
      box-shadow: 0 7px 18px rgba(59, 31, 53, .16);
    }

    .product-category-tab.active small {
      background: rgba(255,255,255,.16);
      color: #fff;
    }

    .product-filter-result {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin: 8px 2px 16px;
      color: #795d56;
      font-size: 12px;
    }

    .product-filter-result span {
      font-weight: 700;
      color: #53343c;
    }

    .product-filter-result small {
      color: #a28277;
    }

    @media (max-width: 600px) {
      .product-category-bar {
        position: sticky;
        top: 8px;
        z-index: 20;
        margin-top: 18px;
        border-radius: 15px;
        padding: 6px;
      }

      .product-category-scroll {
        gap: 6px;
        scrollbar-width: none;
      }

      .product-category-scroll::-webkit-scrollbar {
        display: none;
      }

      .product-category-tab {
        min-height: 39px;
        padding: 0 12px;
        font-size: 11px;
      }

      .product-filter-result {
        margin-bottom: 13px;
      }
    }
  `;

  const handleCreateOrderInSupabase = async (order) => {
    const orderId = Number(order.id || Date.now());

    const { error } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        order_date: order.date,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_address: order.customerAddress,
        items: order.items,
        subtotal: Number(order.subtotal || 0),
        coupon_code: order.couponCode || "",
        discount: Number(order.discount || 0),
        total: Number(order.total || 0),
        status: order.status || "Pending",
      });

    if (error) {
      console.error("Supabase order insert error:", error);
      alert(`Order save failed: ${error.message}`);
      return false;
    }

    const savedOrder = {
      ...order,
      id: orderId,
    };

    setOrders((currentOrders) => [savedOrder, ...currentOrders]);
    setNewOrderIds((currentIds) => [
      savedOrder.id,
      ...currentIds.filter((id) => id !== savedOrder.id),
    ]);

    return true;
  };

  const handleUpdateOrderStatus = async (id, status) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Supabase order status update error:", error);
      alert(`Order status update failed: ${error.message}`);
      return false;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );

    return true;
  };

  const handleDeleteOrder = async (id) => {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase order delete error:", error);
      alert(`Order delete failed: ${error.message}`);
      return false;
    }

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== id)
    );

    setNewOrderIds((currentIds) =>
      currentIds.filter((orderId) => orderId !== id)
    );

    return true;
  };

  return (
    <div className="app">
      <style>{categoryBarStyles}</style>
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

          {/* Product Category Status Bar */}
          <div className="product-category-bar" role="tablist" aria-label="Product categories">
            <div className="product-category-scroll">
              {productCategories.map((category) => {
                const count = getCategoryCount(category);
                const isActive = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`product-category-tab ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span>{category}</span>
                    <small>{count}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="product-filter-result">
            <span>
              {selectedCategory === "All"
                ? "All gifts"
                : selectedCategory}
            </span>
            <small>
              {visibleProducts.length} product
              {visibleProducts.length !== 1 ? "s" : ""}
            </small>
          </div>

          <div className="product-grid">
            {visibleProducts.map((product) => {
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
                  <ProductImage
                    product={product}
                    onWishlist={(selectedProduct) => {
                      // Keep the existing wishlist button safe while reviews are enabled.
                      // If a wishlist handler exists in a future version, it can be passed here.
                    }}
                  />

                  <div className="product-info">
                    <p>{product.category}</p>

                    <h3>{product.name}</h3>

                    {(() => {
                      const rating = getProductRating(product.id);

                      return (
                        <button
                          type="button"
                          className="product-rating-button"
                          onClick={() => setReviewProduct(product)}
                        >
                          <span className="product-stars">
                            {"★★★★★".split("").map((star, index) => (
                              <span
                                key={index}
                                className={
                                  index < Math.round(rating.average)
                                    ? "star filled"
                                    : "star"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </span>

                          <span>
                            {rating.count > 0
                              ? `${rating.average.toFixed(1)} (${rating.count})`
                              : "Write a review"}
                          </span>
                        </button>
                      );
                    })()}

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
        onOrderComplete={async (order) => {
          const saved = await handleCreateOrderInSupabase(order);
          if (saved) setCart([]);
          return saved;
        }}
      />

      {/* Product Reviews */}

      {reviewProduct && (
        <ReviewModal
          product={reviewProduct}
          reviews={reviews}
          onClose={() => setReviewProduct(null)}
          onAddReview={handleAddReview}
        />
      )}

      {/* Admin Panel */}

      {isAdminOpen && (
        isAdminAuthLoading ? (
          <div
            className="admin-login-overlay"
            role="status"
            aria-live="polite"
          >
            <div className="admin-login-card" style={{ textAlign: "center" }}>
              <p className="eyebrow">Secure Administration</p>
              <h2 style={{ margin: 0, color: "#3b1f35", fontFamily: "Georgia, serif" }}>
                Checking secure session...
              </h2>
              <p className="admin-login-subtitle">
                Supabase authentication and admin authorization are being checked.
              </p>
            </div>
          </div>
        ) : isAdminAuthenticated ? (
          <AdminPanel
            products={products}
            onAddProduct={handleAddProductToSupabase}
            onDeleteProduct={handleDeleteProductFromSupabase}
            onUpdateStock={handleUpdateProductStockInSupabase}
            offers={offers}
            setOffers={setOffers}
            orders={orders}
            setOrders={setOrders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            coupons={coupons}
            setCoupons={setCoupons}
            reviews={reviews}
            onDeleteReview={handleDeleteReview}
            newOrderIds={newOrderIds}
            onMarkOrdersSeen={() => setNewOrderIds([])}
            onClose={async () => {
              await supabase.auth.signOut();
              setIsAdminAuthenticated(false);
              setIsAdminOpen(false);
            }}
          />
        ) : (
          <AdminLogin
            onLogin={() => setIsAdminAuthenticated(true)}
            onClose={() => setIsAdminOpen(false)}
          />
        )
      )}
    </div>
  );
}

export default App;