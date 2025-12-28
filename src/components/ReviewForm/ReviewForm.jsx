import React, { useState, useEffect } from "react";
import { createReview, updateReview, deleteReview, getUserReview } from "../../services/review";
import "./ReviewForm.scss";

const ReviewForm = ({ productId, serviceId, onReviewSubmitted, onReviewUpdated, onReviewDeleted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserInfo(user);
    
    if (user._id) {
      loadUserReview();
    } else {
      setLoadingReview(false);
    }
  }, [productId, serviceId]);

  const loadUserReview = async () => {
    try {
      setLoadingReview(true);
      const review = await getUserReview(productId, serviceId);
      if (review) {
        setExistingReview(review);
        setRating(review.rating);
        setComment(review.comment || "");
      }
    } catch (error) {
      console.error("Failed to load user review:", error);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInfo || !userInfo._id) {
      alert("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá");
      return;
    }

    setLoading(true);
    try {
      const data = {
        rating,
        comment: comment.trim(),
        ...(productId ? { productId } : { serviceId })
      };

      if (existingReview) {
        // Update existing review
        const result = await updateReview(existingReview._id, data);
        setExistingReview(result.review);
        if (onReviewUpdated) onReviewUpdated(result.review);
        alert("Cập nhật đánh giá thành công!");
      } else {
        // Create new review
        const result = await createReview(data);
        setExistingReview(result.review);
        if (onReviewSubmitted) onReviewSubmitted(result.review);
        alert("Gửi đánh giá thành công!");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    setLoading(true);
    try {
      await deleteReview(existingReview._id);
      setExistingReview(null);
      setRating(0);
      setComment("");
      if (onReviewDeleted) onReviewDeleted();
      alert("Xóa đánh giá thành công!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi xóa đánh giá");
    } finally {
      setLoading(false);
    }
  };

  if (loadingReview) {
    return <div className="review-form-loading">Đang tải...</div>;
  }

  if (!userInfo || !userInfo._id) {
    return (
      <div className="review-form-login-prompt">
        <p>Vui lòng <a href="/login">đăng nhập</a> để đánh giá sản phẩm/dịch vụ này</p>
      </div>
    );
  }

  return (
    <div className="review-form">
      <h4>{existingReview ? "Cập nhật đánh giá của bạn" : "Viết đánh giá"}</h4>
      
      <form onSubmit={handleSubmit}>
        <div className="rating-input">
          <label>Đánh giá của bạn:</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                ⭐
              </span>
            ))}
            {rating > 0 && <span className="rating-text">({rating}/5)</span>}
          </div>
        </div>

        <div className="comment-input">
          <label htmlFor="comment">Nhận xét (tùy chọn):</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm/dịch vụ này..."
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading || rating === 0}>
            {loading ? "Đang xử lý..." : existingReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
          </button>
          {existingReview && (
            <button type="button" onClick={handleDelete} disabled={loading} className="delete-btn">
              Xóa đánh giá
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;

