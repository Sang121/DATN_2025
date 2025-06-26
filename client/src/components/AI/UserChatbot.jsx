import React, { useState, useRef, useEffect } from "react";
import styles from "./UserChatbot.module.css";
import { UserChatbot, AdminChatbot } from "../../services/aiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";

const ChatbotUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const userId = sessionStorage.getItem("userId") || "guest";
  const isAdmin = useSelector((state) => state.user.isAdmin);
  const [messages, setMessages] = useState([
    {
      text: "Xin chào! Tôi là trợ lý bán hàng của nhà S-Fashion. Tôi có thể giúp gì cho bạn?",
      sender: "bot",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      const userMessage = inputMessage.trim();
      setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
      setInputMessage("");
      setIsLoading(true);

      try {
        if (isAdmin) {
          const response = await AdminChatbot({
            question: userMessage,
            userId: userId,
            isAdmin: isAdmin,
          });
          const answer = response.answer;
          setMessages((prev) => [...prev, { text: answer, sender: "bot" }]);
        } else {
          const response = await UserChatbot({
            question: userMessage,
            userId: userId,
            isAdmin: isAdmin,
          });
          const answer = response.answer;
          setMessages((prev) => [...prev, { text: answer, sender: "bot" }]);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.",
            sender: "bot",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  const openChat = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };
  return (
    <>
      <button
        className={styles.chatButton}
        onClick={() => openChat()}
        aria-label="Mở chat"
      >
        <FontAwesomeIcon icon={faComments} />
      </button>

      {isOpen && (
        <div className={styles.chatbotContainer}>
          <div className={styles.chatHeader}>
            <h2>AI S-Fashion</h2>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chat"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className={styles.messageList}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  message.sender === "user"
                    ? styles.userMessage
                    : styles.botMessage
                }`}
              >
                <div className={styles.messageContent}>{message.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.messageContent}>
                  <span className={styles.typingIndicator}>Đang nhập...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              className={styles.input}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading}
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotUser;
