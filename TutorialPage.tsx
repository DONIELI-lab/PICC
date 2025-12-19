import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Moon, 
  Sun, 
  ChevronRight, 
  Search, 
  BookOpen, 
  Upload, 
  Palette, 
  Sparkles, 
  Download,
  Code,
  MessageCircle,
  Home
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

// 定义教程分类类型
type TutorialCategory = {
  id: string;
  title: string;
  icon: React.ReactNode;
};

// 定义教程项类型
type TutorialItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: Array<{
    title: string;
    content: string;
    imageUrl?: string;
  }>;
};

const TutorialPage: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('quickstart');
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 教程分类数据
  const categories: TutorialCategory[] = [
    { id: 'quickstart', title: '快速开始', icon: <Home size={18} /> },
    { id: 'upload', title: '上传与设置', icon: <Upload size={18} /> },
    { id: 'style', title: '风格选择', icon: <Palette size={18} /> },
    { id: 'generate', title: '生成与导出', icon: <Sparkles size={18} /> },
    { id: 'api', title: 'API 使用指南', icon: <Code size={18} /> },
    { id: 'ai', title: 'AI 提示词助手', icon: <MessageCircle size={18} /> },
  ];
  
  // 教程数据
  const tutorials: TutorialItem[] = [
    {
      id: 'intro',
      title: 'ContentCreator 简介',
      description: '了解 ContentCreator 的核心功能和使用场景',
      category: 'quickstart',
      steps: [
        {
          title: '什么是 ContentCreator',
          content: 'ContentCreator 是一款智能内容生成工具，专为电商和社交媒体内容创作设计。它利用先进的 AI 技术，帮助用户快速生成高质量的产品图片和营销素材。',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=modern%20content%20creation%20platform%20interface&sign=f994afcc5518719d7503b794e862f814'
        },
        {
          title: '主要功能',
          content: '• AI 智能生成专业级图片\n• 多种预设风格选择\n• 简单直观的用户界面\n• 一键导出和分享\n• AI 提示词助手提供创作建议\n• 创作历史记录'
        },
        {
          title: '使用场景',
          content: 'ContentCreator 适用于各类电商产品展示、社交媒体营销、广告素材制作等场景，帮助商家和营销人员快速制作高质量的视觉内容。'
        }
      ]
    },
    {
      id: 'first-steps',
      title: '首次使用指南',
      description: '快速了解 ContentCreator 的基本操作流程',
      category: 'quickstart',
      steps: [
        {
          title: '注册与登录',
          content: '访问 ContentCreator 官方网站，点击右上角的"登录/注册"按钮进行账户注册或登录。',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=login%20register%20interface%20modern%20design&sign=fdb1b423ca3906cbf133afc6be6fdf87'
        },
        {
          title: '进入主界面',
          content: '登录成功后，您将进入 ContentCreator 的主界面，可以开始创建您的第一个内容。',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=creative%20dashboard%20interface&sign=9daaf9e70755970e2654cbe88c186c0a'
        },
        {
          title: '基本操作流程',
          content: 'ContentCreator 的基本操作流程非常简单：\n1. 上传产品图片\n2. 添加产品描述\n3. 选择风格和调性\n4. 点击"生成内容"按钮\n5. 下载或分享生成的内容'
        }
      ]
    },
    {
      id: 'image-upload',
      title: '图片上传指南',
      description: '学习如何上传高质量的产品图片以获得最佳效果',
      category: 'upload',
      steps: [
        {
          title: '支持的图片格式',
          content: 'ContentCreator 支持 JPG、PNG、WebP 等常见图片格式，建议使用 JPG 或 PNG 格式以获得最佳兼容性。'
        },
        {
          title: '图片大小限制',
          content: '上传的图片文件大小不能超过 10MB。如果您的图片超过这个大小，建议先进行压缩处理。',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=image%20upload%20interface&sign=696af99167b2e5d2a07727894da46768'
        },
        {
          title: '最佳实践',
          content: '为了获得最佳的生成效果，建议：\n• 上传清晰、高质量的产品图片\n• 确保产品在图片中占据主要位置\n• 背景尽量简洁，避免过多干扰元素\n• 光线充足，避免过暗或过曝的图片\n• 产品主体完整，避免裁剪过多'
        }
      ]
    },
    {
      id: 'description-tips',
      title: '如何编写有效的描述',
      description: '学习如何编写高质量的产品描述以获得理想的生成效果',
      category: 'upload',
      steps: [
        {
          title: '描述的重要性',
          content: '产品描述是 AI 理解您需求的关键。详细、准确的描述可以帮助 AI 生成更符合您期望的内容。'
        },
        {
          title: '描述技巧',
          content: '• 尽可能详细地描述产品特点和卖点\n• 指定目标受众和使用场景\n• 描述您期望的视觉风格和氛围\n• 提及产品的主要功能和优势\n• 避免模糊或歧义的表述',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=content%20description%20interface&sign=84fb8f2f0eb56875b88d6d760de106e7'
        },
        {
          title: '示例描述',
          content: '好的描述示例：\n"一款高端智能手机，金属机身，6.7英寸全面屏，具有出色的拍照能力和长效电池续航，适合商务人士和摄影爱好者使用，希望以简约现代的风格展示。"\n\n避免这样的描述：\n"手机，好看的，高质量"'
        }
      ]
    },
    {
      id: 'style-selection',
      title: '风格选择指南',
      description: '了解不同风格特点，选择最适合您产品的视觉风格',
      category: 'style',
      steps: [
        {
          title: '风格分类',
          content: 'ContentCreator 提供多种风格分类，包括电商风格、社媒风格、视觉风格和调性选择，您可以根据产品特点和使用场景选择合适的风格。',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=style%20selection%20interface&sign=701493dfe124919694604364d705bfd6'
        },
        {
          title: '常见风格介绍',
          content: '• 极简风格：简洁、干净的设计，突出产品本身\n• 复古风格：怀旧色调和纹理，营造经典氛围\n• 现代风格：时尚、前卫的设计，适合潮流产品\n• 缤纷色彩：明亮、鲜艳的色彩，吸引注意力\n• 专业正式：严谨、专业的视觉效果，适合商务产品\n• 亲切友好：温暖、亲和力强的设计，适合日常消费品'
        },
        {
          title: '多风格组合',
          content: 'ContentCreator 支持同时选择多种风格，创造独特的视觉效果。您可以尝试不同的风格组合，找到最适合您产品的视觉表现形式。'
        }
      ]
    },
    {
      id: 'content-generation',
      title: '内容生成与优化',
      description: '学习如何生成和优化您的内容以获得最佳效果',
      category: 'generate',
      steps: [
        {
          title: '生成过程',
          content: '完成图片上传、描述填写和风格选择后，点击"生成内容"按钮开始生成过程。生成时间通常为几秒钟，请耐心等待。',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=content%20generation%20process&sign=c278459add2890d0d977778c22928e6b'
        },
        {
          title: '结果优化',
          content: '如果生成的结果不完全符合您的期望，可以：\n• 调整产品描述，使其更加详细和准确\n• 尝试不同的风格组合\n• 使用 AI 提示词助手获取优化建议\n• 上传不同角度或质量更好的产品图片'
        },
        {
          title: '批量生成',
          content: '对于需要多种风格或变体的内容，您可以多次使用不同的设置生成，系统会保存您的创作历史，方便您管理和使用。'
        }
      ]
    },
    {
      id: 'download-share',
      title: '下载与分享',
      description: '学习如何下载和分享生成的内容到不同平台',
      category: 'generate',
      steps: [
        {
          title: '下载内容',
          content: '内容生成完成后，点击"下载生成结果"按钮将图片保存到本地设备。下载的图片为高分辨率格式，适合直接用于各类平台。'
        },
        {
          title: '分享到社交媒体',
          content: '点击"分享"按钮，可以直接将生成的内容分享到主流社交媒体平台，如微信、微博、抖音等，节省您的时间和精力。',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=social%20media%20sharing%20interface&sign=c5f2756c44200d844959c80ea8a646f5'
        },
        {
          title: '保存到历史记录',
          content: '所有生成的内容都会自动保存到您的创作历史中，您可以随时查看、重新下载或基于历史创作进行修改和优化。'
        }
      ]
    },
    {
      id: 'api-overview',
      title: 'API 概览',
      description: '了解 ContentCreator API 的基本概念和使用方式',
      category: 'api',
      steps: [
        {
          title: '什么是 ContentCreator API',
          content: 'ContentCreator API 是一组编程接口，允许您将 ContentCreator 的功能集成到您自己的应用程序、网站或工作流程中。'
        },
        {
          title: 'API 主要功能',
          content: '• 上传图片并生成新内容\n• 获取生成历史\n• 管理用户的创作资源\n• 定制生成参数和风格设置\n• 批量处理内容',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=api%20documentation%20interface&sign=9ebbc8a9626e44880982e70dc38a99fc'
        },
        {
          title: 'API 适用场景',
          content: '• 电商平台批量生成产品图片\n• 营销自动化工具集成\n• 内容管理系统扩展\n• 创意设计工作流优化\n• 移动应用功能增强'
        }
      ]
    },
    {
      id: 'api-authentication',
      title: 'API 认证指南',
      description: '学习如何获取和使用 API 密钥进行身份验证',
      category: 'api',
      steps: [
        {
          title: '获取 API 密钥',
          content: '要使用 ContentCreator API，您需要先获取 API 密钥。登录您的 ContentCreator 账户，前往设置页面，找到 API 部分，点击"生成新密钥"按钮获取您的 API 密钥。'
        },
        {
          title: 'API 密钥安全',
          content: '• 妥善保管您的 API 密钥，不要分享给他人\n• 定期更换 API 密钥以增强安全性\n• 如果怀疑 API 密钥泄露，请立即在账户设置中撤销并生成新密钥\n• 建议使用环境变量或密钥管理系统存储 API 密钥',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=api%20security%20authentication&sign=7ca5386afe80ae46c9578df6064c21e7'
        },
        {
          title: 'API 请求格式',
          content: '所有 API 请求都需要在请求头中包含您的 API 密钥进行身份验证。具体格式如下：\nAuthorization: Bearer YOUR_API_KEY\n\n请确保在每个 API 请求中都包含此授权头。'
        }
      ]
    },
    {
      id: 'ai-assistant',
      title: 'AI 提示词助手使用指南',
      description: '学习如何使用 AI 提示词助手优化您的创作',
      category: 'ai',
      steps: [
        {
          title: '什么是 AI 提示词助手',
          content: 'AI 提示词助手是 ContentCreator 提供的智能辅助工具，可以帮助您优化产品描述和提示词，提供创作建议，以获得更好的生成效果。',
          imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=ai%20assistant%20interface&sign=b5a78db2bcb54d46754aa4fb2baf6cfb'
        },
        {
          title: '如何使用 AI 提示词助手',
          content: '• 点击顶部导航栏中的"提示词"图标或生成结果区域的"与AI助手讨论提示词"按钮\n• 在对话框中描述您的产品特点、需求和遇到的问题\n• AI 助手会提供专业的建议和优化方案\n• 使用助手提供的建议修改您的产品描述和风格选择'
        },
        {
          title: '快捷提示词',
          content: 'AI 提示词助手页面提供了多种电商相关的快捷提示词按钮，涵盖产品相关、平台相关、策略与技巧、节日与活动等多个类别，您可以直接点击使用这些预设的提示词。'
        }
      ]
    }
  ];
  
  // 筛选教程
  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // 获取当前选中的教程详情
  const currentTutorial = selectedTutorial ? tutorials.find(t => t.id === selectedTutorial) : null;
  
  // 滚动到顶部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [selectedTutorial, selectedCategory]);
  
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
              <BookOpen size={24} />
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">ContentCreator 教程</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 主题切换按钮 */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-gray-700'} hover:opacity-80 transition-opacity`}
              aria-label="切换主题"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-2">ContentCreator 使用教程</h2>
            <p className={`max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              通过我们的详细教程，快速掌握 ContentCreator 的各项功能，提升您的内容创作效率
            </p>
          </motion.div>
          
          {/* 教程主体内容 */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左侧：分类和教程列表 */}
            <div className="lg:w-1/4">
              {/* 搜索框 */}
              <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索教程..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 placeholder-gray-400'
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              
              {/* 分类列表 */}
              <div className={`mb-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-hidden`}>
                <h3 className="px-4 py-3 font-bold border-b border-gray-200 dark:border-gray-700">教程分类</h3>
                <nav className="p-2">
                  <button
                    className={`w-full flex items-center px-3 py-2 rounded-lg mb-1 transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-500 text-white'
                        : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    <span className="mr-2">全部教程</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>{tutorials.length}</span>
                  </button>
                  
                  {categories.map((category) => {
                    const count = tutorials.filter(t => t.category === category.id).length;
                    return (
                      <button
                        key={category.id}
                        className={`w-full flex items-center px-3 py-2 rounded-lg mb-1 transition-all ${
                          selectedCategory === category.id
                            ? 'bg-indigo-500 text-white'
                            : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span className="mr-3">{category.icon}</span>
                        <span>{category.title}</span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>{count}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
            
            {/* 右侧：教程内容 */}
            <div className="lg:w-3/4" ref={contentRef}>
              {currentTutorial ? (
                // 教程详情
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md mb-6`}
                >
                  {/* 返回按钮 */}
                  <button 
                    onClick={() => setSelectedTutorial(null)}
                    className={`flex items-center mb-4 text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'} transition-colors`}
                  >
                    <ChevronRight className="mr-1 transform rotate-180" size={16} />
                    返回教程列表
                  </button>
                  
                  {/* 教程标题和描述 */}
                  <h2 className="text-2xl font-bold mb-4">{currentTutorial.title}</h2>
                  <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentTutorial.description}
                  </p>
                  
                  {/* 教程步骤 */}
                  <div className="space-y-8">
                    {currentTutorial.steps.map((step, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                        <h3 className="text-lg font-bold mb-3">
                          {index + 1}. {step.title}
                        </h3>
                        
                        {step.imageUrl && (
                          <div className="mb-4 rounded-lg overflow-hidden shadow-sm">
                            <img 
                              src={step.imageUrl} 
                              alt={`${currentTutorial.title} - 步骤 ${index + 1}`} 
                              className="w-full h-auto"
                            />
                          </div>
                        )}
                        
                        <div className={`whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {step.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                // 教程列表
                <div className="space-y-4">
                  {filteredTutorials.length > 0 ? (
                    filteredTutorials.map((tutorial) => (
                      <motion.div
                        key={tutorial.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.01 }}
                        className={`rounded-xl p-6 cursor-pointer ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} shadow-md transition-all duration-300`}
                        onClick={() => setSelectedTutorial(tutorial.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold mb-2">{tutorial.title}</h3>
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                              {tutorial.description}
                            </p>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              isDark ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              {categories.find(c => c.id === tutorial.category)?.title || tutorial.category}
                            </div>
                          </div>
                          <ChevronRight className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-300'}`} size={20} />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className={`rounded-xl p-12 text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                      <div className={`p-4 rounded-full inline-flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <BookOpen size={24} className="text-indigo-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">未找到教程</h3>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        没有找到匹配的教程，请尝试其他搜索关键词或浏览其他分类
                      </p>
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setSearchTerm('');
                        }}
                        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
                      >
                        查看所有教程
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* 页脚 */}
      <footer className={`mt-auto py-8 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            © 2025 ContentCreator. 保留所有权利。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TutorialPage;