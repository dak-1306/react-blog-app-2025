import React, { useState } from "react";

export default function DeleteModal({ isOpen, onClose, userInfo }) {
  const [step, setStep] = useState(1); // 1: warning, 2: confirmation, 3: final confirm
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (confirmText !== "XÓA TÀI KHOẢN") {
      newErrors.confirmText = "Vui lòng nhập chính xác 'XÓA TÀI KHOẢN'";
    }

    if (!password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteAccount = async () => {
    if (!validateStep2()) return;

    setIsDeleting(true);

    try {
      // Call delete account API
      const response = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          password: password,
          confirmText: confirmText,
        }),
      });

      if (response.ok) {
        alert("Tài khoản đã được xóa thành công!");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        const errorData = await response.json();
        setErrors({
          general: errorData.message || "Có lỗi xảy ra khi xóa tài khoản",
        });
      }
    } catch (error) {
      console.error("Delete account error:", error);
      setErrors({ general: "Không thể kết nối đến server" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setStep(1);
      setConfirmText("");
      setPassword("");
      setErrors({});
      onClose();
    }
  };

  const renderStep1 = () => (
    <div className="delete-step">
      <div className="delete-warning">
        <div className="warning-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Cảnh báo: Xóa tài khoản vĩnh viễn</h3>
        <p>
          Bạn sắp xóa tài khoản <strong>{userInfo?.username}</strong>. Hành động
          này <span className="text-danger">không thể hoàn tác</span>.
        </p>
      </div>

      <div className="data-loss-warning">
        <h4>Dữ liệu sẽ bị mất vĩnh viễn:</h4>
        <ul className="loss-list">
          <li>
            <i className="fas fa-user"></i>
            Thông tin profile và cài đặt cá nhân
          </li>
          <li>
            <i className="fas fa-edit"></i>
            Tất cả bài viết đã đăng ({userInfo?.blogCount || 0} bài viết)
          </li>
          <li>
            <i className="fas fa-comments"></i>
            Tất cả bình luận và tương tác
          </li>
          <li>
            <i className="fas fa-heart"></i>
            Lượt thích và lượt theo dõi
          </li>
          <li>
            <i className="fas fa-history"></i>
            Lịch sử hoạt động và thống kê
          </li>
        </ul>
      </div>

      <div className="alternatives">
        <h4>Thay vì xóa tài khoản, bạn có thể:</h4>
        <div className="alternative-options">
          <div className="alternative-option">
            <i className="fas fa-eye-slash"></i>
            <div>
              <strong>Ẩn profile</strong>
              <p>Đặt profile ở chế độ riêng tư</p>
            </div>
          </div>
          <div className="alternative-option">
            <i className="fas fa-pause"></i>
            <div>
              <strong>Tạm dừng tài khoản</strong>
              <p>Vô hiệu hóa tạm thời, có thể kích hoạt lại sau</p>
            </div>
          </div>
          <div className="alternative-option">
            <i className="fas fa-download"></i>
            <div>
              <strong>Tải xuống dữ liệu</strong>
              <p>Sao lưu thông tin trước khi xóa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="delete-step">
      <div className="confirmation-form">
        <h3>Xác nhận xóa tài khoản</h3>
        <p>Để tiếp tục, vui lòng:</p>

        <div className="form-group">
          <label>
            1. Nhập chính xác: <code>XÓA TÀI KHOẢN</code>
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Nhập 'XÓA TÀI KHOẢN'"
            className={errors.confirmText ? "error" : ""}
          />
          {errors.confirmText && (
            <span className="error-message">{errors.confirmText}</span>
          )}
        </div>

        <div className="form-group">
          <label>2. Nhập mật khẩu hiện tại</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu của bạn"
            className={errors.password ? "error" : ""}
          />
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}
      </div>

      <div className="final-warning">
        <div className="warning-box">
          <i className="fas fa-skull-crossbones"></i>
          <p>
            <strong>Lưu ý cuối cùng:</strong> Sau khi xóa, bạn sẽ mất tất cả dữ
            liệu và không thể khôi phục. Email {userInfo?.email} sẽ không thể
            đăng ký lại trong 30 ngày.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="delete-step">
      <div className="final-confirmation">
        <div className="skull-icon">
          <i className="fas fa-skull"></i>
        </div>
        <h3>Xác nhận lần cuối</h3>
        <p>
          Tài khoản <strong>{userInfo?.username}</strong> sẽ bị xóa vĩnh viễn
          cùng với tất cả dữ liệu liên quan.
        </p>
        <p className="final-question">
          Bạn có <strong>hoàn toàn chắc chắn</strong> muốn tiếp tục không?
        </p>

        <div className="countdown-info">
          <i className="fas fa-hourglass-half"></i>
          <p>
            Quá trình xóa sẽ hoàn tất trong vòng 24 giờ. Trong thời gian này,
            bạn có thể liên hệ hỗ trợ để hủy yêu cầu.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="step-indicator">
            <div className="steps">
              <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
              <div className="step-line"></div>
              <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
              <div className="step-line"></div>
              <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
            </div>
            <div className="step-labels">
              <span>Cảnh báo</span>
              <span>Xác nhận</span>
              <span>Hoàn tất</span>
            </div>
          </div>

          <button
            className="close-btn"
            onClick={handleClose}
            disabled={isDeleting}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="modal-footer">
          <div className="footer-actions">
            {step > 1 && (
              <button
                className="btn btn-outline"
                onClick={handleBack}
                disabled={isDeleting}
              >
                <i className="fas fa-arrow-left"></i>
                Quay lại
              </button>
            )}

            <button
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Hủy bỏ
            </button>

            {step < 3 && (
              <button
                className="btn btn-danger"
                onClick={handleNext}
                disabled={isDeleting}
              >
                Tiếp tục
                <i className="fas fa-arrow-right"></i>
              </button>
            )}

            {step === 3 && (
              <button
                className="btn btn-danger delete-final-btn"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <i className="fas fa-skull"></i>
                    Xóa tài khoản vĩnh viễn
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
