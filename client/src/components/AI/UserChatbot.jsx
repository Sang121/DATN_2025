import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Button, Avatar } from "antd";
import { UserChatbot, AdminChatbot } from "../../services/aiService";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useFirstVisit } from "../../hooks/useFirstVisit";
import "./UserChatbot.css";

const ChatbotUser = () => {
  // First visit detection
  const { isFirstVisit, markAsVisited } = useFirstVisit();

  // Chat states
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const userId = sessionStorage.getItem("userId") || "guest";
  const isAdmin = useSelector((state) => state.user.isAdmin);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Demo states
  const [showDemo, setShowDemo] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [demoCompleted, setDemoCompleted] = useState(false);

  // Messages state - initialize based on demo or real chat
  const [messages, setMessages] = useState([]);

  // Demo messages
  const demoMessages = useMemo(
    () => [
      {
        type: "ai",
        text: "Chào bạn! Tôi là AI S-Fashion Assistant 👋",
        delay: 1000,
      },
      {
        type: "ai",
        text: "Tôi có thể giúp bạn tìm kiếm sản phẩm thời trang phù hợp",
        delay: 2000,
      },
      {
        type: "user",
        text: "Tôi muốn tìm áo sơ mi nam",
        delay: 1500,
      },
      {
        type: "ai",
        text: "Tuyệt vời! Bạn thích kiểu dáng nào? Formal hay casual?",
        delay: 2000,
      },
      {
        type: "user",
        text: "Casual, màu xanh dương",
        delay: 1500,
      },
      {
        type: "ai",
        text: "Tôi đã tìm thấy 15 sản phẩm phù hợp! ✨",
        delay: 2000,
      },
    ],
    []
  );

  // Initialize real chat messages
  const initializeRealChat = useCallback(() => {
    const initialMessage =
      userId === "guest"
        ? {
            text: "Bạn cần phải đăng nhập để sử dụng chức năng này!",
            sender: "bot",
          }
        : {
            text: "Xin chào! Tôi là trợ lý bán hàng của nhà S-Fashion. Tôi có thể giúp gì cho bạn?",
            sender: "bot",
          };
    setMessages([initialMessage]);
  }, [userId]);

  // Demo logic
  const playNextMessage = useCallback(
    (index) => {
      if (index >= demoMessages.length) {
        // Demo finished
        setTimeout(() => {
          setIsTyping(false);
          setDemoCompleted(true);
        }, 1000);
        return;
      }

      const message = demoMessages[index];

      setTimeout(() => {
        if (message.type === "ai") {
          setIsTyping(true);
          setTimeout(() => {
            setCurrentMessage(index + 1);
            setIsTyping(false);
            playNextMessage(index + 1);
          }, message.delay);
        } else {
          setCurrentMessage(index + 1);
          playNextMessage(index + 1);
        }
      }, 500);
    },
    [demoMessages]
  );

  const startDemo = useCallback(() => {
    setIsOpen(true);
    setShowDemo(true);
    setCurrentMessage(0);
    setDemoCompleted(false);
    playNextMessage(0);
  }, [playNextMessage]);

  // First visit effect
  useEffect(() => {
    if (isFirstVisit) {
      // Show floating AI after 3 seconds for first-time visitors
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Start demo after another 2 seconds
        setTimeout(() => {
          startDemo();
        }, 2000);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Show immediately for returning visitors
      setIsVisible(true);
    }
  }, [isFirstVisit, startDemo]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMessage]);

  // Real chat submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading && !showDemo) {
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
        } else if (userId === "guest") {
          setMessages((prev) => [
            ...prev,
            {
              text: "Bạn cần phải đăng nhập để sử dụng chức năng này!",
              sender: "bot",
            },
          ]);
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
        console.error("Chat error:", error);
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

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (!showDemo && messages.length === 0) {
        initializeRealChat();
      }
    } else {
      setIsOpen(false);
    }
  };

  const switchToRealChat = () => {
    setShowDemo(false);
    setDemoCompleted(false);
    setCurrentMessage(0);
    setIsTyping(false);
    initializeRealChat();
    markAsVisited(); // Mark as visited when user starts real chat
  };

  const handleClose = () => {
    setIsOpen(false); // Chỉ đóng chat window, không ẩn hoàn toàn
    if (showDemo) {
      markAsVisited(); // Mark as visited if closing demo
    }
  };

  if (!isVisible) return null;

  return (
    <div className="chatbot-user-container">
      {/* Floating AI Button */}
      <div className={`floating-chatbot-button ${isOpen ? "expanded" : ""}`}>
        {!isOpen ? (
          <div className="ai-avatar" onClick={toggleChat}>
            <Avatar
              size={60}
              icon={<MessageOutlined />}
              className="ai-avatar-icon"
            />
            <div className="pulse-ring"></div>
            <div className="pulse-ring pulse-ring-delay"></div>
          </div>
        ) : (
          <div className="ai-chat-window">
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <Avatar
                  size={32}
                  icon={<MessageOutlined />}
                  className="chat-avatar"
                />
                <div>
                  <div className="chat-title">AI S-Fashion Assistant</div>
                  <div className="chat-status">Online</div>
                </div>
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                size="small"
                onClick={handleClose}
                className="chat-close"
              />
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {showDemo ? (
                // Demo messages
                <>
                  {demoMessages
                    .slice(0, currentMessage)
                    .map((message, index) => (
                      <div
                        key={index}
                        className={`message ${
                          message.type === "ai" ? "ai-message" : "user-message"
                        }`}
                      >
                        {message.type === "ai" && (
                          <Avatar
                            size={24}
                            icon={<RobotOutlined />}
                            className="message-avatar"
                          />
                        )}
                        <div className="message-content">
                          <div className="message-bubble">{message.text}</div>
                        </div>
                      </div>
                    ))}

                  {isTyping && (
                    <div className="message ai-message">
                      <Avatar
                        size={24}
                        icon={<RobotOutlined />}
                        className="message-avatar"
                      />
                      <div className="message-content">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Real chat messages
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${
                      message.sender === "user" ? "user-message" : "ai-message"
                    }`}
                  >
                    {message.sender === "bot" && (
                      <Avatar
                        size={24}
                        icon={<RobotOutlined />}
                        className="message-avatar"
                      />
                    )}
                    <div className="message-content">
                      <div className="message-bubble">{message.text}</div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && !showDemo && (
                <div className="message ai-message">
                  <Avatar
                    size={24}
                    icon={<RobotOutlined />}
                    className="message-avatar"
                  />
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="chat-footer">
              {showDemo ? (
                // Demo footer
                demoCompleted ? (
                  <div className="chat-cta">
                    <Button
                      type="primary"
                      icon={<MessageOutlined />}
                      onClick={switchToRealChat}
                      className="chat-now-btn"
                      size="large"
                    >
                      Chat với AI ngay!
                    </Button>
                  </div>
                ) : (
                  <div className="chat-input-demo">
                    <div className="demo-input">Demo AI chatbot...</div>
                  </div>
                )
              ) : (
                // Real chat input
                <form onSubmit={handleSubmit} className="chat-input-form">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nhập tin nhắn của bạn..."
                    className="chat-input"
                    disabled={isLoading}
                  />
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    disabled={isLoading || !inputMessage.trim()}
                    className="send-button"
                  />
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Particles effect */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
    </div>
  );
};

export default ChatbotUser;
