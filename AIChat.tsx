import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { X, Send, MessageSquare, FileText, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { APIContext } from '../contexts/apiContext';
import { generateContent } from '../services/aiService';

// 定义消息类型
type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, isDark }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedModel, getCurrentApiKey } = useContext(APIContext);
  
  // 预设的AI回复模板
  const aiResponses = [
    "您可以尝试更具体地描述您的产品特点和期望的风格，例如：'一款简约风格的智能手表，适合商务人士使用，背景为干净的白色'",
    "为了获得更好的生成效果，建议您提供关于产品的关键卖点、目标受众和使用场景的详细信息",
    "如果您想突出产品的某个特性，可以在描述中特别强调，例如：'这款相机具有出色的低光拍摄能力和防水功能'",
    "您选择的风格组合很有创意！极简风格与专业正式的调性搭配非常适合科技产品展示",
    "建议您上传高质量、清晰的产品图片，这样AI能更好地理解产品细节，生成更符合预期的内容",
    "针对社交媒体平台，您可以考虑添加一些流行元素和互动性强的文案，以提高用户参与度",
    "如果您需要为特定节日或促销活动生成内容，可以在描述中包含相关的主题元素",
    "为了让生成的内容更具吸引力，建议您描述产品的使用场景和能为用户带来的实际价值"
  ];

  // 调用AI API获取回复
  const handleSend = async () => {
    if (!input.trim()) {
      toast('请输入您的问题或需求');
      return;
    }

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // 检查是否配置了API
    if (!getCurrentApiKey() || !selectedModel) {
      // 如果没有配置API，使用模拟回复
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    } else {
      try {
        // 调用实际的AI服务
        const response = await generateContent({
          modelId: selectedModel,
          apiKey: getCurrentApiKey(),
          prompt: input,
          images: [], // 聊天模式没有图片
          styles: []  // 聊天模式不需要风格
        });
        
        if (response.success && response.data?.text) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: response.data.text,
            isUser: false,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, aiMessage]);
        } else {
          // 如果API调用失败，使用模拟回复
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: response.error || "抱歉，我暂时无法处理您的请求。请稍后再试或检查您的API配置。",
            isUser: false,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, aiMessage]);
        }
      } catch (error) {
        console.error('调用AI API失败:', error);
        
        // 发生错误时，使用模拟回复
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "抱歉，处理您的请求时发生错误。请稍后再试或检查您的API配置。",
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 初始化欢迎消息
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: '您好！我是您的AI助手，请问有什么可以帮助您优化提示词的吗？',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // 按Enter发送消息，Shift+Enter换行
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } rounded-2xl shadow-2xl overflow-hidden`}
      >
        {/* 聊天头部 */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold">AI 提示词助手</h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                帮助您优化提示词，获得更好的生成效果
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } transition-colors`}
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>

        {/* 聊天内容 */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {/* 提示卡片 */}
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-indigo-900/20' : 'bg-indigo-50'
          } border ${isDark ? 'border-indigo-800' : 'border-indigo-100'}`}>
            <div className="flex items-start">
              <FileText className="text-indigo-500 mr-3 mt-1 flex-shrink-0" size={18} />
              <div>
                <h4 className="font-medium text-indigo-500 mb-1">提示词优化建议</h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  详细描述产品特点、目标受众和期望风格，可以获得更精准的生成结果
                </p>
              </div>
            </div>
          </div>

          {/* 消息列表 */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none'
                    : isDark
                    ? 'bg-gray-700 rounded-bl-none'
                    : 'bg-gray-100 rounded-bl-none'
                }`}
              >
                <p>{message.content}</p>
                <div className={`text-right text-xs mt-1 ${message.isUser ? 'text-indigo-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* 正在输入指示器 */}
          {isTyping && (
            <div className="flex justify-start">
              <div className={`max-w-[80%] p-3 rounded-lg ${
                isDark ? 'bg-gray-700 rounded-bl-none' : 'bg-gray-100 rounded-bl-none'
              }`}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* 滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className={`p-4 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题或需求..."
              className={`flex-grow px-4 py-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 placeholder-gray-400'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none`}
              rows={2}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex-shrink-0 transition-all ${
                (!input.trim() || isTyping) ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
              }`}
              aria-label="发送消息"
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </motion.button>
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <HelpCircle size={14} className="inline-block mr-1" />
            提示：输入详细的产品信息和需求，可获得更精准的AI建议
          </p>
        </div>
      </motion.div>
    </div>
  );
};