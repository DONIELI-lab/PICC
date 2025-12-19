import { useState, useEffect } from 'react';

// 定义快捷提示词类型
export interface QuickPrompt {
  id: string;
  text: string;
  category: string;
}

// 定义提示词分类
export const promptCategories = [
  { id: 'product', name: '产品相关' },
  { id: 'platform', name: '平台相关' },
  { id: 'strategy', name: '策略与技巧' },
  { id: 'seasonal', name: '节日与活动' }
];

// 默认提示词
const defaultPrompts: QuickPrompt[] = [
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

const STORAGE_KEY = 'quickPrompts';

export function useQuickPrompts() {
  const [prompts, setPrompts] = useState<QuickPrompt[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<QuickPrompt | null>(null);
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState('product');

  // 从本地存储加载提示词
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPrompts(JSON.parse(saved));
      } else {
        // 如果没有保存的提示词，使用默认提示词
        setPrompts(defaultPrompts);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPrompts));
      }
    } catch (error) {
      console.error('Failed to load quick prompts:', error);
      setPrompts(defaultPrompts);
    }
  }, []);

  // 保存提示词到本地存储
  const savePrompts = (updatedPrompts: QuickPrompt[]) => {
    setPrompts(updatedPrompts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));
  };

  // 添加新提示词
  const addPrompt = () => {
    if (!newPromptText.trim()) return;
    
    const newPrompt: QuickPrompt = {
      id: Date.now().toString(),
      text: newPromptText.trim(),
      category: newPromptCategory
    };
    
    const updatedPrompts = [...prompts, newPrompt];
    savePrompts(updatedPrompts);
    
    // 重置表单
    setNewPromptText('');
    setNewPromptCategory('product');
  };

  // 编辑提示词
  const updatePrompt = () => {
    if (!editingPrompt || !newPromptText.trim()) return;
    
    const updatedPrompts = prompts.map(prompt => 
      prompt.id === editingPrompt.id 
        ? { ...prompt, text: newPromptText.trim(), category: newPromptCategory }
        : prompt
    );
    
    savePrompts(updatedPrompts);
    
    // 退出编辑模式
    setIsEditMode(false);
    setEditingPrompt(null);
    setNewPromptText('');
    setNewPromptCategory('product');
  };

  // 删除提示词
  const deletePrompt = (id: string) => {
    const updatedPrompts = prompts.filter(prompt => prompt.id !== id);
    savePrompts(updatedPrompts);
    
    // 如果正在编辑的提示词被删除，退出编辑模式
    if (editingPrompt && editingPrompt.id === id) {
      setIsEditMode(false);
      setEditingPrompt(null);
      setNewPromptText('');
      setNewPromptCategory('product');
    }
  };

  // 开始编辑提示词
  const startEditing = (prompt: QuickPrompt) => {
    setEditingPrompt(prompt);
    setNewPromptText(prompt.text);
    setNewPromptCategory(prompt.category);
    setIsEditMode(true);
  };

  // 取消编辑
  const cancelEditing = () => {
    setIsEditMode(false);
    setEditingPrompt(null);
    setNewPromptText('');
    setNewPromptCategory('product');
  };

  // 按分类获取提示词
  const getPromptsByCategory = (category: string) => {
    return prompts.filter(prompt => prompt.category === category);
  };

  return {
    prompts,
    isEditMode,
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
  };
}