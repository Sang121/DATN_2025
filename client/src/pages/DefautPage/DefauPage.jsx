import React, { useState } from "react";
import Footer from "../../components/Footer/Footer";
import BelowHeader from "../../components/BelowHeader/BelowHeader";
import Header from "../../components/Header/Header";
import SignInPage from "../SignInPage/SignInPage";
import SignUpPage from "../SignUpPage/SignUpPage";
import ChatbotUser from "../../components/AI/UserChatbot";
import "./DefauPage.css";
import Banner from "../../components/Banner/Banner";

const DefauPage = ({ children }) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSwitchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };
  const handleSwitchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  return (
    <div>
      <Banner />
      <Header onShowSignIn={() => setShowSignIn(true)} />

      <SignInPage
        open={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      <SignUpPage
        open={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={handleSwitchToSignIn}
      />

      {/* <BelowHeader /> */}
      {children}
      <Footer />
      <div className="global-chatbot-container">
        <ChatbotUser />
      </div>
    </div>
  );
};

export default DefauPage;
