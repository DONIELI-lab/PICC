import React, { useState, useRef, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';
import { AuthContext } from '../contexts/authContext';
import { APIContext } from '../contexts/apiContext';
import { maskApiKey } from '../contexts/apiContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Upload,
  Palette,
  Sparkles,
  Download,
  Share2,
  Save,
  Trash2,
  MessageCircle,
  Moon,
  Sun,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Image as ImageIcon,
  Layout,
  Code,
  MessageSquare,
  Plus,
  Edit,
  Check,
  Eye,
  Search
} from 'lucide-react';
import { useQuickPrompts } from '../hooks/useQuickPrompts';
import { generateContent } from '../services/aiService';

// 定义风格选项类型
type StyleOption = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
};

// 定义风格分类选项类型
type CategoryOption = {
  id: string;
  name: string;
};

// 定义生成历史类型
type GenerationHistory = {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  createdAt: Date;
};

const Home: React.FC = () => {
  // 使用主题钩子
  const { theme, toggleTheme, isDark } = useTheme();
  const { isAuthenticated, setIsAuthenticated, logout } = useContext(AuthContext);
  const { 
    selectedModel, 
    setSelectedModel, 
    apiKeys, 
    setApiKey, 
    models,
    hasPassword,
    verifyPassword,
    setPassword,
    getCurrentApiKey
  } = useContext(APIContext);
  
  // 使用快捷提示词Hook
  const {
    prompts,
    isEditMode: isPromptEditMode,
    editingPrompt,
    newPromptText,
    newPromptCategory,
    setNewPromptText,
    setNewPromptCategory,
    addPrompt,
    updatePrompt,
    deletePrompt,
    startEditing,
    cancelEditing,
    getPromptsByCategory,
    promptCategories
  } = useQuickPrompts();
  
  // 状态管理
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'ecommerce' | 'social' | 'visual' | 'tone'>('ecommerce');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showAPIConfig, setShowAPIConfig] = useState(false);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // 密码保护相关状态
  const [isEditMode, setIsEditMode] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [verificationPassword, setVerificationPassword] = useState('');
  const [editPassword, setEditPassword] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  // 文件上传引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 应用快捷提示词到描述框
  const applyPrompt = (promptText: string) => {
    setDescription(promptText);
    setShowQuickPrompts(false);
  };
  
  // 导航到AI聊天页面并携带提示词
  const navigateToAIChatWithPrompt = (promptText: string) => {
    // 使用localStorage临时存储要传递的提示词
    localStorage.setItem('tempPrompt', promptText);
    window.location.href = '/ai-chat';
  };

  // 预设风格选项
  const styleOptions: StyleOption[] = [
    {
      id: 'minimal',
      name: '极简风格',
      description: '简洁、干净的设计，突出产品本身',
      thumbnail: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=minimalist%20design%2C%20clean%20background&sign=36c27b4ce5cea5e7a57760fd4010dbf0'
    },
    {
      id: 'vintage',
      name: '复古风格',
      description: '怀旧色调和纹理，营造经典氛围',
      thumbnail: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=vintage%20retro%20style%20design&sign=a5d78ec2cca98830a49b064d144d253b'
    },
    {
      id: 'modern',
      name: '现代风格',
      description: '时尚、前卫的设计，适合潮流产品',
      thumbnail: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=modern%20stylish%20design&sign=3786d44ca796bfe8b45cc1c81e37bb0c'
    },
    {
      id: 'colorful',
      name: '缤纷色彩',
      description: '明亮、鲜艳的色彩，吸引注意力',
      thumbnail: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=colorful%20vibrant%20design&sign=42672d504ce2c011ef92a3cf85f5e2bf'
    }
  ];
  
  // 分类选项数据
  const ecommerceOptions: CategoryOption[] = [
    { id: 'product-showcase', name: '产品展示' },
    { id: 'promotion', name: '促销活动' },
    { id: 'brand', name: '品牌宣传' },
    { id: 'lifestyle', name: '生活方式' }
  ];
  
  const socialOptions: CategoryOption[] = [
    { id: 'instagram', name: 'Instagram风格' },
    { id: 'tiktok', name: 'TikTok风格' },
    { id: 'facebook', name: 'Facebook风格' },
    { id: 'twitter', name: 'Twitter风格' }
  ];
  
  const visualOptions: CategoryOption[] = [
    { id: 'minimal', name: '极简风格' },
    { id: 'vintage', name: '复古风格' },
    { id: 'modern', name: '现代风格' },
    { id: 'colorful', name: '缤纷色彩' }
  ];
  
  const toneOptions: CategoryOption[] = [
    { id: 'professional', name: '专业正式' },
    { id: 'friendly', name: '亲切友好' },
    { id: 'trendy', name: '时尚潮流' },
    { id: 'luxury', name: '高端奢华' }
  ];
  
  // 获取当前分类的选项
  const getCategoryOptions = (category: 'ecommerce' | 'social' | 'visual' | 'tone'): CategoryOption[] => {
    switch (category) {
      case 'ecommerce':
        return ecommerceOptions;
      case 'social':
        return socialOptions;
      case 'visual':
        return visualOptions;
      case 'tone':
        return toneOptions;
      default:
        return ecommerceOptions;
    }
  };

  // 模拟生成历史数据
  React.useEffect(() => {
    const mockHistory: GenerationHistory[] = [
      {
        id: '1',
        imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=smartphone%20product%20photography&sign=0a491dca2044dc47bad3709c71ea88a7',
        prompt: '一款全新智能手机，高性能处理器，高清摄像头',
        style: 'minimal',
        createdAt: new Date(Date.now() - 86400000) // 1天前
      },
      {
        id: '2',
        imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=fashion%20clothing%20product&sign=28bc20634a55b825b44bfab05535732b',
        prompt: '时尚休闲服装，舒适面料，多种颜色选择',
        style: 'modern',
        createdAt: new Date(Date.now() - 172800000) // 2天前
      }
    ];
    setHistory(mockHistory);
  }, []);

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      let loadedCount = 0;
      
      // 限制最多上传10张图片
      const filesToProcess = Array.from(files).slice(0, 10);
      
      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            loadedCount++;
            
            // 当所有文件都加载完成后更新状态
            if (loadedCount === filesToProcess.length) {
              setUploadedImages(prevImages => [...prevImages, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 触发文件选择对话框
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 生成内容
  const generateContent = async () => {
    if (uploadedImages.length === 0 || !description.trim()) {
      toast('请上传图片并输入描述文字');
      return;
    }

    if (!selectedModel) {
      toast('请选择一个AI模型');
      return;
    }

    if (!getCurrentApiKey()) {
      toast('请配置当前选中模型的API密钥');
      setShowAPIConfig(true);
      return;
    }

    setIsGenerating(true);
    
    try {
      // 调用实际的AI服务
      const response = await generateContent({
        modelId: selectedModel,
        apiKey: getCurrentApiKey(),
        prompt: description,
        images: uploadedImages,
        styles: selectedStyles
      });
      
      if (response.success && response.data?.imageUrl) {
        setGeneratedImage(response.data.imageUrl);
        
        // 添加到历史记录
        const newHistoryItem: GenerationHistory = {
          id: Date.now().toString(),
          imageUrl: response.data.imageUrl,
          prompt: description,
          style: selectedStyles.join(', ') + ` | 模型: ${models.find(m => m.id === selectedModel)?.name}`,
          createdAt: new Date()
        };
        
        setHistory([newHistoryItem, ...history]);
        
        toast('内容生成成功！');
      } else {
        toast(response.error || '生成内容失败，请重试');
      }
    } catch (error) {
      console.error('生成内容时发生错误:', error);
      toast('生成内容时发生错误，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载图片
  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `content_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast('图片已下载');
  };

  // 分享图片
  const shareImage = () => {
    if (!generatedImage) return;
    toast('分享功能已触发');
  };

  // 保存到历史记录
  const saveToHistory = () => {
    if (!generatedImage || !description.trim()) return;
    
    const newHistoryItem: GenerationHistory = {
      id: Date.now().toString(),
      imageUrl: generatedImage,
      prompt: description,
      style: selectedStyles.join(', '),
      createdAt: new Date()
    };
    
    setHistory([newHistoryItem, ...history]);
    toast('已保存到历史记录');
  };

  // 删除单个上传的图片
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  // 登录/登出处理
  const handleLogin = () => {
    setIsAuthenticated(true);
    toast('登录成功');
  };

  const handleLogout = () => {
    logout();
    toast('已登出');
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
              <Sparkles size={24} />
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">ContentCreator</h1>
          </div>
          
           {/* 桌面导航 */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="font-medium hover:text-indigo-500 transition-colors">首页</a>
            <a href="/ai-chat" className="font-medium hover:text-indigo-500 transition-colors flex items-center">
              <MessageSquare className="mr-1" size={16} />
              提示词
            </a>
            <button
              onClick={() => setShowQuickPrompts(!showQuickPrompts)}
              className="font-medium hover:text-indigo-500 transition-colors flex items-center"
            >
              <Search className="mr-1" size={16} />
              快捷提问
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* 主题切换按钮 */}
            <button onClick={toggleTheme}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-gray-700'} hover:opacity-80 transition-opacity`}
              aria-label="切换主题"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* 用户操作按钮 */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button 
                  className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} hover:opacity-80 transition-opacity`}
                  aria-label="用户"
                >
                  <User size={20} />
                </button>
                <button 
                  onClick={handleLogout}
                  className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} hover:opacity-80 transition-opacity`}
                  aria-label="登出"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity"
              >
                登录/注册
              </button>
            )}
            
            {/* 移动端菜单按钮 */}
            <button 
              className="md:hidden p-2 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="菜单"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <motion.nav 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-t`}
          >
               <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
                <a href="#" className="py-2 font-medium hover:text-indigo-500 transition-colors">首页</a>
                <a href="/ai-chat" className="py-2 font-medium hover:text-indigo-500 transition-colors flex items-center">
                  <MessageSquare className="mr-1" size={16} />
                  提示词
                </a>
                <button
                  onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                  className="py-2 font-medium hover:text-indigo-500 transition-colors flex items-center w-full justify-start"
                >
                  <Search className="mr-1" size={16} />
                  快捷提问
                </button>
              </div>
          </motion.nav>
        )}
      </header>

      {/* 主内容区 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* 欢迎信息 */}
        <section className="mb-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold mb-4"
          >
            智能生成专业级<span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">电商/社媒</span>内容
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
          >
            上传图片，添加描述，选择风格，一键生成符合电商平台和社交媒体要求的专业内容
           </motion.p>
         </section>
         
         {/* 快捷提问弹出框 */}
         {showQuickPrompts && (
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="fixed top-16 left-1/2 transform -translate-x-1/2 w-full max-w-4xl z-50"
           >
             <div className={`rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
               <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                 <h3 className="font-bold text-lg flex items-center">
                   <Search className="mr-2 text-indigo-500" size={18} />
                   快捷提问
                 </h3>
                 <div className="flex space-x-2">
                   {isPromptEditMode ? (
                     <button
                       onClick={cancelEditing}
                       className={`px-3 py-1.5 text-sm rounded-lg ${
                         isDark ? 'bg-gray-700' : 'bg-gray-100'
                       }`}
                     >
                       取消
                     </button>
                   ) : (
                     <button
                       onClick={() => startEditing({ id: '', text: '', category: 'product' })}
                       className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                     >
                       <Plus size={16} />
                     </button>
                   )}
                   <button
                     onClick={() => setShowQuickPrompts(false)}
                     className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                   >
                     <X size={16} />
                   </button>
                 </div>
               </div>
               
               {/* 编辑模式表单 */}
               {isPromptEditMode && (
                 <div className="p-4">
                   <div className="mb-3">
                     <label className="block text-sm font-medium mb-1">提示词内容</label>
                     <input
                       type="text"
                       value={newPromptText}
                       onChange={(e) => setNewPromptText(e.target.value)}
                       placeholder="请输入提示词内容..."
                       className={`w-full px-3 py-2 rounded-lg border ${
                         isDark
                           ? 'bg-gray-700 border-gray-600 text-white'
                           : 'bg-gray-50 border-gray-300'
                       } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                       autoFocus
                     />
                   </div>
                   <div className="mb-3">
                     <label className="block text-sm font-medium mb-1">分类</label>
                     <select
                       value={newPromptCategory}
                       onChange={(e) => setNewPromptCategory(e.target.value)}
                       className={`w-full px-3 py-2 rounded-lg border ${
                         isDark
                           ? 'bg-gray-700 border-gray-600 text-white'
                           : 'bg-gray-50 border-gray-300'
                       } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                     >
                       {promptCategories.map(category => (
                         <option key={category.id} value={category.id}>
                           {category.name}
                         </option>
                       ))}
                     </select>
                   </div>
                   <div className="flex justify-end space-x-2">
                     <button
                       onClick={cancelEditing}
                       className={`px-4 py-2 rounded-lg ${
                         isDark ? 'bg-gray-700' : 'bg-gray-100'
                       }`}
                     >
                       取消
                     </button>
                     <button
                       onClick={editingPrompt?.id ? updatePrompt : addPrompt}
                       disabled={!newPromptText.trim()}
                       className={`px-4 py-2 rounded-lg bg-indigo-500 text-white ${
                         !newPromptText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'
                       }`}
                     >
                       {editingPrompt?.id ? '保存修改' : '添加提示词'}
                     </button>
                   </div>
                 </div>
               )}
               
               {/* 搜索框 */}
               {!isPromptEditMode && (
                 <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                   <div className="relative">
                     <input
                       type="text"
                       placeholder="搜索提示词..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                         isDark
                           ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                           : 'bg-gray-50 border-gray-300 placeholder-gray-400'
                       } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                     />
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                   </div>
                 </div>
               )}
               
               {/* 提示词列表 */}
               {!isPromptEditMode && (
                 <div className="max-h-[400px] overflow-y-auto">
                   {promptCategories.map(category => {
                     const categoryPrompts = getPromptsByCategory(category.id).filter(prompt => 
                       prompt.text.toLowerCase().includes(searchQuery.toLowerCase())
                     );
                     
                     if (categoryPrompts.length === 0) return null;
                     
                     return (
                       <div key={category.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                         <h4 className="text-xs font-medium text-indigo-500 mb-2">{category.name}</h4>
                         <div className="space-y-2">
                           {categoryPrompts.map(prompt => (
                             <div
                               key={prompt.id}
                               className={`p-3 rounded-lg ${
                                 isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                               } flex justify-between items-center cursor-pointer transition-colors`}
                             >
                               <div className="flex-1 min-w-0">
                                 <p className="text-sm truncate">{prompt.text}</p>
                               </div>
                               <div className="flex space-x-1 ml-2">
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     applyPrompt(prompt.text);
                                   }}
                                   className="p-1.5 rounded hover:bg-gray-500/10 text-gray-400 hover:text-gray-200"
                                   title="应用到描述框"
                                 >
                                   <Layout size={14} />
                                 </button>
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     navigateToAIChatWithPrompt(prompt.text);
                                   }}
                                   className="p-1.5 rounded hover:bg-gray-500/10 text-gray-400 hover:text-gray-200"
                                   title="在AI聊天中使用"
                                 >
                                   <Eye size={14} />
                                 </button>
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     startEditing(prompt);
                                   }}
                                   className="p-1.5 rounded hover:bg-gray-500/10 text-gray-400 hover:text-gray-200"
                                   title="编辑提示词"
                                 >
                                   <Edit size={14} />
                                 </button>
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     deletePrompt(prompt.id);
                                   }}
                                   className="p-1.5 rounded hover:bg-gray-500/10 text-gray-400 hover:text-red-400"
                                   title="删除提示词"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>
             {/* 点击外部关闭弹出框 */}
             <div 
               className="fixed inset-0 bg-transparent z-[-1]"
               onClick={() => setShowQuickPrompts(false)}
             />
           </motion.div>
         )}
        
        {/* 标签页切换 */}
        <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'create' 
              ? 'border-b-2 border-indigo-500 text-indigo-500' 
              : isDark ? 'text-gray-300' : 'text-gray-600'}`}
            onClick={() => setActiveTab('create')}
          >
            新建创作
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'history' 
              ? 'border-b-2 border-indigo-500 text-indigo-500' 
              : isDark ? 'text-gray-300' : 'text-gray-600'}`}
            onClick={() => setActiveTab('history')}
          >
            创作历史
          </button>
        </div>
        
        {/* 新建创作页面 */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：输入区域 */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300`}>
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <ImageIcon className="mr-2 text-indigo-500" />
                上传与设置
              </h3>
              
              {/* 图片上传区域 */}
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDark ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-300 hover:border-indigo-500'
                } ${uploadedImages.length > 0 ? 'border-indigo-500' : ''}`}
                onClick={triggerFileInput}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple  // 支持多文件上传
                />
                {uploadedImages.length > 0 ? (
                  <div className="relative">
                    {uploadedImages.length === 1 ? (
                      // 单个图片时完整显示
                      <div className="relative inline-block">
                        <img 
                          src={uploadedImages[0]} 
                          alt="上传的图片" 
                          className="max-h-64 object-contain mx-auto rounded-lg"
                        />
                        <button 
                          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUploadedImage(0);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      // 多个图片时以网格形式显示
                      <div className="grid grid-cols-2 gap-3">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={image} 
                              alt={`上传的图片 ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button 
                              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeUploadedImage(index);
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* 显示已上传图片数量 */}
                    {uploadedImages.length > 0 && (
                      <div className="mt-3 text-sm text-indigo-500">
                       已上传 {uploadedImages.length} 张图片 {uploadedImages.length < 10 ? '（最多可上传10张）' : '（已达上限）'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload size={48} className="mx-auto text-indigo-500" />
                    <p className="font-medium">拖放多张图片到此处或点击上传</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                       支持 JPG、PNG、WebP 格式，每张最大 10MB，最多上传10张
                    </p>
                  </div>
                )}
              </div>
              
              {/* 描述输入 */}
              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium mb-2">描述内容</label>
                <textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述您想要展示的产品特点、场景、氛围等..."
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300'
                  } border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  rows={4}
                />
              </div>
              
               {/* 风格选择 */}
               <div className="mt-6">
                 <label className="block text-sm font-medium mb-2 flex items-center">
                   <Palette className="mr-2 text-indigo-500" size={16} />
                   选择风格 (可多选)
                 </label>
                
                {/* 风格分类标签页 */}
                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                  <button 
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === 'ecommerce'
                        ? 'bg-indigo-500 text-white'
                        : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCategory('ecommerce')}
                  >
                    电商风格
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === 'social'
                        ? 'bg-indigo-500 text-white'
                        : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCategory('social')}
                  >
                    社媒风格
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === 'visual'
                        ? 'bg-indigo-500 text-white'
                        : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCategory('visual')}
                  >
                    视觉风格
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === 'tone'
                        ? 'bg-indigo-500 text-white'
                        : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCategory('tone')}
                  >
                    调性选择
                  </button>
                </div>
                
                  {/* 风格选项列表 - 支持多选 */}
                  <div className="space-y-3">
                    {getCategoryOptions(selectedCategory).map((option) => (
                      <div
                        key={option.id}
                        className={`rounded-lg p-4 cursor-pointer transition-all ${
                          selectedStyles.includes(option.id)
                            ? isDark 
                              ? 'bg-indigo-900/30 border border-indigo-500' 
                              : 'bg-blue-50 border border-blue-200'
                            : isDark 
                              ? 'bg-gray-700 hover:bg-gray-600' 
                              : 'bg-gray-50 hover:bg-gray-100'
                        } flex items-center justify-between`}
                        onClick={() => {
                          // 切换风格选择状态
                          if (selectedStyles.includes(option.id)) {
                            // 如果已选中，则移除
                            setSelectedStyles(selectedStyles.filter(id => id !== option.id));
                          } else {
                            // 如果未选中，则添加
                            setSelectedStyles([...selectedStyles, option.id]);
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                            selectedStyles.includes(option.id)
                              ? 'bg-indigo-500 text-white'
                              : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {selectedStyles.includes(option.id) && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`font-medium ${
                            selectedStyles.includes(option.id)
                              ? 'text-indigo-500'
                              : isDark ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {option.name}
                          </span>
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 {/* 显示已选择的风格数量 */}
                 {selectedStyles.length > 0 && (
                   <div className="mt-3 text-sm text-indigo-500 font-medium">
                     已选择 {selectedStyles.length} 种风格
                   </div>
                 )}
              </div>
              
               {/* 模型选择 - 高亮区域，方便后续更换新的模型 */}
               <div className="mt-6">
                 <label className="block text-sm font-medium mb-2 flex items-center">
                   <Sparkles className="mr-2 text-indigo-500" size={16} />
                   选择AI模型
                 </label>
                 
                 {/* 模型选择下拉菜单 */}
                 <div className={`relative rounded-lg overflow-hidden ${
                   isDark 
                     ? 'bg-gray-700 border border-gray-600' 
                     : 'bg-gray-50 border border-gray-300'
                 } transition-all`}
                 >
                   <select
                     value={selectedModel || ''}
                     onChange={(e) => setSelectedModel(e.target.value)}
                     className={`w-full px-4 py-3 appearance-none bg-transparent outline-none ${
                       isDark ? 'text-white' : 'text-gray-800'
                     } pr-10 cursor-pointer`}
                   >
                     {models.map((model) => (
                       <option key={model.id} value={model.id}>
                         {model.name} ({model.provider})
                       </option>
                     ))}
                   </select>
                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                     <ChevronRight className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                   </div>
                 </div>
                 
                 {/* 模型描述 */}
                 <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                   {models.find(m => m.id === selectedModel)?.description}
                 </p>
                 
                  {/* API配置提示 - 显示当前选中模型的密钥状态 */}
                  {!selectedModel || !apiKeys[selectedModel] ? (
                    <div className="mt-3 flex items-center">
                      <span className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        还未配置当前模型的API密钥，点击
                      </span>
                      <button 
                        onClick={() => setShowAPIConfig(true)}
                        className="text-xs text-indigo-500 hover:underline ml-1"
                      >
                        配置
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        API密钥已配置: {maskApiKey(apiKeys[selectedModel])}
                      </span>
                      <button 
                        onClick={() => {
                          setIsEditMode(true);
                          setPasswordVerified(false);
                          setVerificationPassword("");
                          setShowAPIConfig(true);
                        }}
                        className="text-xs text-indigo-500 hover:underline ml-1"
                      >
                        编辑
                      </button>
                    </div>
                  )}
              </div>
              
              {/* 生成按钮 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                 onClick={generateContent}
                 disabled={isGenerating || uploadedImages.length === 0 || !description.trim() || selectedStyles.length === 0}
                 className={`w-full mt-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium transition-all ${
                   (isGenerating || uploadedImages.length === 0 || !description.trim() || selectedStyles.length === 0) 
                     ? 'opacity-70 cursor-not-allowed' 
                     : 'hover:opacity-90'}`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>生成中...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles size={18} />
                    <span>生成内容</span>
                  </div>
                )}
              </motion.button>
            </div>
            
            {/* 右侧：结果展示区域 */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300 h-full flex flex-col`}>
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Layout className="mr-2 text-indigo-500" />
                生成结果
              </h3>
               
               <div className="flex-grow flex flex-col">
                {isGenerating ? (
                  <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-medium">正在智能生成内容...</p>
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      这可能需要几秒钟时间
                    </p>
                  </div>
                ) : generatedImage ? (
                  <div className="flex-grow flex flex-col">
                    <div className="relative flex-grow flex items-center justify-center">
                      <img 
                        src={generatedImage} 
                        alt="生成的内容" 
                        className="max-w-full max-h-[400px] object-contain rounded-lg"
                      />
                     </div>
                     
                     {/* 操作按钮 - 下载功能突出显示 */}
                     <div className="mt-6 space-y-4">
                        {/* 打开AI对话按钮 */}
                         <motion.a
                          href="/ai-chat"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full py-3 rounded-lg ${
                            isDark 
                              ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                              : 'bg-white hover:bg-gray-50 border border-gray-200'
                          } text-white font-medium flex items-center justify-center space-x-2 transition-all`}
                        >
                          <MessageCircle size={18} className="text-indigo-500" />
                          <span>与AI助手讨论提示词</span>
                          <ChevronRight size={16} className="text-indigo-400" />
                        </motion.a>
                      {/* 主要下载按钮 */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={downloadImage}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium flex items-center justify-center space-x-2 hover:opacity-90 transition-all"
                      >
                        <Download size={18} />
                        <span>下载生成结果</span>
                      </motion.button>
                      
                      {/* 其他操作按钮 */}
                      <div className="grid grid-cols-3 gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={shareImage}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                            isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                          } transition-all`}
                        >
                          <Share2 size={20} className="mb-1 text-indigo-500" />
                          <span className="text-xs">分享</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={saveToHistory}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                            isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                          } transition-all`}
                        >
                          <Save size={20} className="mb-1 text-indigo-500" />
                          <span className="text-xs">保存</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setGeneratedImage(null)}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                            isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                          } transition-all`}
                        >
                          <Trash2 size={20} className="mb-1 text-red-500" />
                          <span className="text-xs">清除</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                    <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Code size={32} className="text-indigo-500" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">还没有生成内容</h4>
                     <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                       上传图片、添加描述并选择至少一种风格，然后点击"生成内容"按钮
                     </p>
                     <button 
                       onClick={triggerFileInput}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
                     >
                       上传图片
                     </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* 创作历史页面 */}
        {activeTab === 'history' && (
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300`}>
            <h3 className="text-xl font-bold mb-6">创作历史</h3>
            
            {history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-50'} shadow-md transition-all duration-300 hover:shadow-lg`}
                  >
                    <div className="relative">
                      <img 
                        src={item.imageUrl} 
                        alt={`Generated content ${item.id}`} 
                        className="w-full h-48 object-cover"
                      />
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs ${
                        isDark ? 'bg-black/50' : 'bg-white/80'
                      } backdrop-blur-sm`}>
                        {styleOptions.find(s => s.id === item.style)?.name || item.style}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.prompt}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(item.createdAt).toLocaleString('zh-CN')}
                        </span>
                        <button 
                          className="text-indigo-500 hover:text-indigo-600 transition-colors flex items-center text-sm"
                          onClick={() => {
                            setGeneratedImage(item.imageUrl);
                            setActiveTab('create');
                          }}
                        >
                          查看 <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <MessageSquare size={32} className="text-indigo-500" />
                </div>
                <h4 className="text-lg font-medium mb-2">暂无创作历史</h4>
                <p className={`mb-4 max-w-md ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  您的创作历史将保存在这里，方便您随时查看和使用之前生成的内容
                </p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
                >
                  开始创作
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* 功能介绍区域 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-12">为什么选择 ContentCreator</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                <Sparkles className="text-indigo-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">AI 智能生成</h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                利用先进的人工智能技术，根据您的需求生成高质量的电商和社交媒体内容
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                <Palette className="text-indigo-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">多种风格选择</h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                提供多种预设风格，满足不同产品和平台的需求，让您的内容更具吸引力
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                <Layout className="text-indigo-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">一键导出使用</h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                生成的内容可直接下载或分享到各大电商平台和社交媒体，节省您的时间和精力
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className={`mt-auto py-8 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="text-indigo-500" size={20} />
                <h3 className="font-bold text-lg">ContentCreator</h3>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                智能生成专业级电商和社交媒体内容，提升您的品牌影响力
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">功能</h4>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">图片生成</a></li>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">文案创作</a></li>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">模板库</a></li>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">API集成</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">支持</h4>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">帮助中心</a></li>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">教程</a></li>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">API文档</a></li>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">联系我们</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">法律</h4>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">服务条款</a></li>
                <li><a href="#" className="hover:text-indigo-500 transition-colors">版权信息</a></li>
              </ul>
            </div>
          </div>
          
          <div className={`mt-8 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} flex flex-col md:flex-row justify-between items-center`}>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              © 2025 ContentCreator. 保留所有权利。
            </p>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className={`text-${isDark ? 'gray-400 hover:text-white' : 'gray-600 hover:text-indigo-500'} transition-colors`}>
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className={`text-${isDark ? 'gray-400 hover:text-white' : 'gray-600 hover:text-indigo-500'} transition-colors`}>
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className={`text-${isDark ? 'gray-400 hover:text-white' : 'gray-600 hover:text-indigo-500'} transition-colors`}>
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className={`text-${isDark ? 'gray-400 hover:text-white' : 'gray-600 hover:text-indigo-500'} transition-colors`}>
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
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
            <h3 className="text-xl font-bold mb-4">配置API密钥</h3>
            
            {isEditMode && hasPassword && !passwordVerified ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="verificationPassword" className="block text-sm font-medium mb-2">
                    请输入密码以验证身份
                  </label>
                  <input
                    id="verificationPassword"
                    type={showPassword ? "text" : "password"}
                    value={verificationPassword}
                    onChange={(e) => setVerificationPassword(e.target.value)}
                    placeholder="输入您的密码"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300'
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="mt-1 text-xs text-indigo-500 hover:underline"
                  >
                    {showPassword ? "隐藏密码" : "显示密码"}
                  </button>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowAPIConfig(false);
                      setIsEditMode(false);
                      setPasswordVerified(false);
                      setVerificationPassword("");
                    }}
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
                      if (verifyPassword(verificationPassword)) {
                        setPasswordVerified(true);
                        setVerificationPassword("");
                      } else {
                        toast('密码错误，请重试');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    验证密码
                  </button>
                </div>
              </div>
            ) : (
               <>
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
                
                {/* 密码保护设置 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    编辑保护密码 (可选)
                  </label>
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder={hasPassword ? "输入新密码以更改，留空保持不变" : "设置密码以保护编辑权限"}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300'
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="mt-1 text-xs text-indigo-500 hover:underline"
                  >
                    {showEditPassword ? "隐藏密码" : "显示密码"}
                  </button>
                  
                  {editPassword && (
                    <p className={`mt-1 text-xs ${
                      editPassword.length >= 6 
                        ? 'text-green-500' 
                        : 'text-yellow-500'
                    }`}>
                      {editPassword.length >= 6 
                        ? '✓ 密码强度足够' 
                        : '⚠ 建议密码长度至少为6位'}
                    </p>
                  )}
                </div>
                
                <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  配置完成后，您的API密钥将保存在本地。如果设置了编辑保护密码，下次编辑时需要验证密码。
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowAPIConfig(false);
                      setIsEditMode(false);
                      setPasswordVerified(false);
                      setEditPassword("");
                    }}
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
                      
                      // 设置编辑保护密码
                      if (editPassword !== undefined) {
                        setPassword(editPassword);
                      }
                      
                      setShowAPIConfig(false);
                      setIsEditMode(false);
                      setPasswordVerified(false);
                      setEditPassword("");
                      toast('API配置已保存');
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    保存配置
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home;