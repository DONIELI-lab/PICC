import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, FileText, HelpCircle, Loader2, Moon, Sun, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { APIContext, maskApiKey } from '../contexts/apiContext';
import { generateContent } from '../services/aiService';

// 定义消息类型
type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

// 定义提示词快捷按钮类型
type PromptButton = {
  id: string;
  text: string;
  category: string;
};

const AIChatPage: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { apiKeys, selectedModel, setApiKey, setSelectedModel, models, getCurrentApiKey } = useContext(APIContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAPIKey, setShowAPIKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAPIConfig, setShowAPIConfig] = useState(false);
  
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

  // 电商相关提示词快捷按钮 - 增加更多电商相关的快捷提示词
  const promptButtons: PromptButton[] = [
    { id: '1', text: '如何为电子产品创建吸引人的电商图片', category: 'product' },
    { id: '2', text: '服装类产品的最佳社媒推广风格', category: 'product' },
    { id: '3', text: '食品摄影的光线和构图技巧', category: 'product' },
    { id: '4', text: '生成适合Instagram的产品展示文案', category: 'platform' },
    { id: '5', text: '如何优化产品描述以提高转化率', category: 'strategy' },
    { id: '6', text: '节日促销活动的视觉设计建议', category: 'seasonal' },
    { id: '7', text: '如何为家居产品创建生活化场景', category: 'product' },
    { id: '8', text: '撰写吸引人的产品标题技巧', category: 'strategy' },
    { id: '9', text: 'TikTok短视频产品展示技巧', category: 'platform' },
    { id: '10', text: '如何突出产品的核心卖点', category: 'strategy' }
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

  // 点击快捷提示词按钮
  const handlePromptButtonClick = (text: string) => {
    setInput(text);
    // 自动聚焦到输入框
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 初始化欢迎消息和检查临时提示词
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: '您好！我是您的AI提示词助手，请问有什么可以帮助您优化电商/社媒内容的吗？',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // 检查是否有临时提示词
      const tempPrompt = localStorage.getItem('tempPrompt');
      if (tempPrompt) {
        setInput(tempPrompt);
        localStorage.removeItem('tempPrompt');
        
        // 自动聚焦到输入框
        setTimeout(() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            textarea.focus();
          }
        }, 100);
      }
    }
  }, []);

  // 按Enter发送消息，Shift+Enter换行
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* 导航栏 */}
      <header className={`sticky top-0 z-50 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b transition-all duration-300`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div 
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-indigo-500"
            >
              <MessageSquare size={24} />
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">AI提示词助手</h1>
          </div>
          
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full ${isDark ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-gray-700'} hover:opacity-80 transition-opacity`}
            aria-label="切换主题"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">与AI助手讨论提示词</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>获取专业建议，优化您的电商和社交媒体内容创作</p>
          </div>

          {/* 提示卡片 */}
          <div className={`p-4 rounded-lg mb-6 ${
            isDark ? 'bg-indigo-900/20' : 'bg-indigo-50'
          } border ${isDark ? 'border-indigo-800' : 'border-indigo-100'}`}>
            <div className="flex items-start">
              <FileText className="text-indigo-500 mr-3 mt-1 flex-shrink-0" size={18} />
              <div>
                <h4 className="font-medium text-indigo-500 mb-1">提示词优化建议</h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  详细描述产品特点、目标受众和期望风格，可以获得更精准的生成结果。您可以使用下方的快捷按钮快速提问。
                </p>
              </div>
            </div>
          </div>

          {/* 快捷提示词按钮 - 按分类分组显示 */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 text-sm">快捷提问</h3>
            
            {/* 产品相关提示词 */}
            <div className="mb-3">
              <h4 className="text-xs font-medium text-indigo-500 mb-2">产品相关</h4>
              <div className="flex flex-wrap gap-2">
                {promptButtons.filter(btn => btn.category === 'product').map((button) => (
                  <motion.button
                    key={button.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePromptButtonClick(button.text)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {button.text}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* 平台相关提示词 */}
            <div className="mb-3">
              <h4 className="text-xs font-medium text-indigo-500 mb-2">平台相关</h4>
              <div className="flex flex-wrap gap-2">
                {promptButtons.filter(btn => btn.category === 'platform').map((button) => (
                  <motion.button
                    key={button.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePromptButtonClick(button.text)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {button.text}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* 策略相关提示词 */}
            <div className="mb-3">
              <h4 className="text-xs font-medium text-indigo-500 mb-2">策略与技巧</h4>
              <div className="flex flex-wrap gap-2">
                {promptButtons.filter(btn => btn.category === 'strategy').map((button) => (
                  <motion.button
                    key={button.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePromptButtonClick(button.text)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {button.text}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* 节日相关提示词 */}
            <div className="mb-3">
              <h4 className="text-xs font-medium text-indigo-500 mb-2">节日与活动</h4>
              <div className="flex flex-wrap gap-2">
                {promptButtons.filter(btn => btn.category === 'seasonal').map((button) => (
                  <motion.button
                    key={button.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePromptButtonClick(button.text)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {button.text}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* 聊天内容 */}
          <div className={`flex-grow overflow-y-auto p-6 mb-6 rounded-xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-lg min-h-[500px] max-h-[600px]`}>
            {/* 消息列表 */}
            <div className="space-y-4">
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
          </div>

          {/* 输入区域 */}
          <div className={`p-4 rounded-xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
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
        </div>
      </main>

      {/* 页脚 */}
      <footer className={`mt-auto py-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t text-center`}>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          AI提示词助手 - 帮助您创建出色的电商和社交媒体内容
        </p>
      </footer>
      
      {/* API配置弹窗 */}
      {showAPIConfig && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}
          >
            <h3 className="text-xl font-bold mb-4">配置AI提示词API</h3>
            
                {/* 显示当前选中的模型 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    当前选择的模型
                  </label>
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  } flex items-center`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">{models.find(m => m.id === selectedModel)?.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {models.find(m => m.id === selectedModel)?.name}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {models.find(m => m.id === selectedModel)?.provider}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                    配置 {models.find(m => m.id === selectedModel)?.name} API密钥
                  </label>
                  <input
                    id="apiKey"
                    type={showAPIKey ? "text" : "password"}
                    value={selectedModel ? apiKeys[selectedModel] || "" : ""}
                    onChange={(e) => selectedModel && setApiKey(selectedModel, e.target.value)}
                    placeholder={`输入 ${models.find(m => m.id === selectedModel)?.name} API密钥`}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300'
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAPIKey(!showAPIKey)}
                    className="mt-1 text-xs text-indigo-500 hover:underline"
                  >
                    {showAPIKey ? "隐藏密钥" : "显示密钥"}
                  </button>
                </div>
             
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                选择AI模型
              </label>
              <select
                value={selectedModel || ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-300'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </option>
                ))}
              </select>
            </div>
            
            <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              配置完成后，您的API密钥将保存在本地。如果设置了编辑保护密码，下次编辑时需要验证密码。
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAPIConfig(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!getCurrentApiKey()) {
                    toast('请输入API密钥');
                    return;
                  }
                  setShowAPIConfig(false);
                  toast('API配置已保存');
                }}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                保存配置
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AIChatPage;