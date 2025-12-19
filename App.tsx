import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AIChatPage from "@/pages/AIChatPage";
import TutorialPage from "@/pages/TutorialPage";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';
import { Empty } from "@/components/Empty";
import { APIProvider } from "@/contexts/apiContext";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <APIProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/templates" element={<Empty title="模板库" description="探索各种精美的预设模板" />} />
          <Route path="/tutorials" element={<TutorialPage />} />
          <Route path="/api" element={<Empty title="API文档" description="了解如何集成我们的服务" />} />
          <Route path="/settings" element={<Empty title="设置" description="配置您的账户和偏好" />} />
          <Route path="/ai-chat" element={<AIChatPage />} />
          {/* 重定向确保正确的路由导航 */}
          <Route path="/ai-chat/" element={<AIChatPage />} />
        </Routes>
      </APIProvider>
    </AuthContext.Provider>
  );
}
