import React, { createContext, useState, useEffect, ReactNode } from "react";

// 定义支持的AI模型类型
export type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  isDefault?: boolean;
};

// 定义API上下文类型
export interface APIContextType {
  selectedModel: string | null;
  setSelectedModel: (modelId: string | null) => void;
  apiKeys: Record<string, string>; // 修改为记录每个模型的API密钥
  setApiKey: (modelId: string, key: string) => void; // 修改为为特定模型设置密钥
  models: AIModel[];
  isConfigured: boolean;
  saveConfiguration: () => void;
  loadConfiguration: () => void;
  maskApiKey: (apiKey: string) => string;
  // 添加密码保护相关功能
  hasPassword: boolean;
  verifyPassword: (password: string) => boolean;
  setPassword: (password: string) => void;
  resetPassword: () => void;
  // 获取当前选中模型的API密钥
  getCurrentApiKey: () => string;
}

// 预设的AI模型列表 - 高亮此区域以便后续添加新模型
export const defaultModels: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "功能强大的多模态模型，适合复杂的内容生成和理解任务",
    isDefault: true,
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    description: "平衡性能和速度的模型，适合日常内容创作",
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "擅长长文本处理和创意内容生成的模型，需要配置有效的API密钥才能调用云算力",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "多模态模型，在视觉和文本交互方面表现出色，需要配置有效的API密钥才能调用云算力",
  },
];

// 用于显示时隐藏API密钥的函数
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey) return "";
  
  // 保留前4个字符和后4个字符，中间用星号替换
  if (apiKey.length <= 8) {
    return "*".repeat(apiKey.length);
  }
  
  const prefix = apiKey.substring(0, 4);
  const suffix = apiKey.substring(apiKey.length - 4);
  return prefix + "*".repeat(apiKey.length - 8) + suffix;
};

// 创建API上下文
export const APIContext = createContext<APIContextType>({
  selectedModel: null,
  setSelectedModel: () => {},
  apiKeys: {},
  setApiKey: () => {},
  models: defaultModels,
  isConfigured: false,
  saveConfiguration: () => {},
  loadConfiguration: () => {},
  maskApiKey: maskApiKey,
  hasPassword: false,
  verifyPassword: () => false,
  setPassword: () => {},
  resetPassword: () => {},
  getCurrentApiKey: () => "",
});

// API上下文提供者组件
export const APIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 从本地存储加载配置
  const loadFromStorage = (): { 
    apiKeys: Record<string, string>;
    selectedModel: string | null;
    passwordHash?: string;
  } => {
    try {
      const savedConfig = localStorage.getItem("apiConfiguration");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        // 兼容旧版本的配置格式
        if (parsed.apiKey && !parsed.apiKeys) {
          // 旧版本存储的是单个密钥，我们将其应用到所有模型
          const apiKeys: Record<string, string> = {};
          defaultModels.forEach(model => {
            apiKeys[model.id] = parsed.apiKey;
          });
          return {
            apiKeys,
            selectedModel: parsed.selectedModel,
            passwordHash: parsed.passwordHash
          };
        }
        return parsed;
      }
    } catch (error) {
      console.error("Failed to load API configuration from localStorage:", error);
    }
    
    // 默认选择第一个模型
    return { 
      apiKeys: {}, 
      selectedModel: defaultModels.find(model => model.isDefault)?.id || defaultModels[0].id 
    };
  };

  const savedConfig = loadFromStorage();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(savedConfig.apiKeys);
  const [selectedModel, setSelectedModel] = useState<string | null>(savedConfig.selectedModel);
  const [models] = useState<AIModel[]>(defaultModels);
  const [passwordHash, setPasswordHash] = useState<string | null>(savedConfig.passwordHash || null);
  
  // 检查是否已配置（当前选中模型的密钥是否存在）
  const isConfigured = !!selectedModel && !!apiKeys[selectedModel];
  
  // 检查是否设置了密码
  const hasPassword = !!passwordHash;
  
  // 保存配置到本地存储
  const saveConfiguration = () => {
    try {
      localStorage.setItem(
        "apiConfiguration",
        JSON.stringify({ apiKeys, selectedModel, passwordHash })
      );
    } catch (error) {
      console.error("Failed to save API configuration to localStorage:", error);
    }
  };
  
  // 加载配置
  const loadConfiguration = () => {
    const config = loadFromStorage();
    setApiKeys(config.apiKeys);
    setSelectedModel(config.selectedModel);
    setPasswordHash(config.passwordHash || null);
  };
  
  // 密码哈希函数（简化版，实际项目中应使用更安全的哈希算法）
  const hashPassword = (password: string): string => {
    // 注意：这只是一个简化的哈希实现，实际应用中应使用更安全的方法
    return btoa(password); // Base64编码作为简单的哈希模拟
  };
  
  // 验证密码
  const verifyPassword = (password: string): boolean => {
    if (!hasPassword) return true; // 如果没有设置密码，则验证通过
    return hashPassword(password) === passwordHash;
  };
  
  // 设置密码
  const setPassword = (password: string): void => {
    if (password.trim()) {
      setPasswordHash(hashPassword(password.trim()));
    } else {
      setPasswordHash(null); // 清除密码
    }
  };
  
  // 重置密码
  const resetPassword = (): void => {
    setPasswordHash(null);
  };
  
  // 为特定模型设置API密钥
  const setApiKey = (modelId: string, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [modelId]: key
    }));
  };
  
  // 获取当前选中模型的API密钥
  const getCurrentApiKey = (): string => {
    return selectedModel ? apiKeys[selectedModel] || "" : "";
  };
  
  // 监听配置变化并自动保存
  useEffect(() => {
    saveConfiguration();
  }, [apiKeys, selectedModel, passwordHash]);
  
  return React.createElement(
    APIContext.Provider,
    {
      value: {
        selectedModel,
        setSelectedModel,
        apiKeys,
        setApiKey,
        models,
        isConfigured,
        saveConfiguration,
        loadConfiguration,
        maskApiKey,
        hasPassword,
        verifyPassword,
        setPassword,
        resetPassword,
        getCurrentApiKey,
      }
    },
    children
  );
};