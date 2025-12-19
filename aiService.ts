import { toast } from 'sonner';

// 定义AI模型类型，与apiContext中的保持一致
export type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  isDefault?: boolean;
};

// 定义API调用参数接口
export interface GenerateParams {
  modelId: string;
  apiKey: string;
  prompt: string;
  images?: string[];
  styles?: string[];
}

// 定义API响应接口
export interface GenerateResponse {
  success: boolean;
  data?: {
    imageUrl?: string;
    text?: string;
  };
  error?: string;
}

// 云算力API基础URL - 可通过环境变量配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.cloud算力服务.com/v1';

/**
 * 根据模型ID获取对应的API端点
 */
const getModelEndpoint = (modelId: string): string => {
  // 不同模型可能需要不同的API端点
  switch (modelId) {
    case 'gpt-4o':
    case 'gpt-3.5-turbo':
      return `${API_BASE_URL}/openai/generate`;
    case 'claude-3-opus':
      return `${API_BASE_URL}/anthropic/generate`;
    case 'gemini-pro':
      return `${API_BASE_URL}/google/generate`;
    default:
      return `${API_BASE_URL}/generate`;
  }
};

/**
 * 获取模型对应的请求头
 */
const getRequestHeaders = (apiKey: string, modelId: string): Headers => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  
  // 不同模型提供商可能需要不同的授权方式
  if (modelId.includes('gpt-')) {
    headers.append('Authorization', `Bearer ${apiKey}`);
  } else if (modelId.includes('claude-')) {
    headers.append('x-api-key', apiKey);
  } else if (modelId.includes('gemini-')) {
    headers.append('x-google-api-key', apiKey);
  } else {
    headers.append('Authorization', `Bearer ${apiKey}`);
  }
  
  return headers;
};

/**
 * 处理图片数据（如果有上传图片）
 */
const processImages = async (images?: string[]): Promise<string[] | undefined> => {
  if (!images || images.length === 0) return undefined;
  
  try {
    // 这里简化处理，实际项目中可能需要上传图片到云存储获取URL
    // 或者对base64图片进行处理
    return images;
  } catch (error) {
    console.error('图片处理失败:', error);
    toast('图片处理失败，请重试');
    return undefined;
  }
};

/**
 * 生成内容的主函数
 */
export const generateContent = async ({
  modelId,
  apiKey,
  prompt,
  images,
  styles
}: GenerateParams): Promise<GenerateResponse> => {
  try {
    // 验证必要参数
    if (!modelId || !apiKey || !prompt) {
      return {
        success: false,
        error: '缺少必要参数'
      };
    }

    // 获取API端点和请求头
    const endpoint = getModelEndpoint(modelId);
    const headers = getRequestHeaders(apiKey, modelId);
    
    // 处理图片
    const processedImages = await processImages(images);
    
    // 构建请求体
    const requestBody = {
      model: modelId,
      prompt,
      images: processedImages,
      styles,
      parameters: {
        temperature: 0.7,
        max_tokens: 1000,
        quality: 'standard'
      }
    };
    
    // 发送API请求
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      // 配置请求超时
      signal: AbortSignal.timeout(60000) // 60秒超时
    });
    
    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API请求失败，状态码: ${response.status}`);
    }
    
    // 解析响应数据
    const data = await response.json();
    
    // 返回成功响应
    return {
      success: true,
      data: {
        imageUrl: data.image_url || data.result?.image_url,
        text: data.text || data.result?.text
      }
    };
    
  } catch (error) {
    console.error('内容生成失败:', error);
    
    // 处理特定错误类型
    let errorMessage = '生成内容时发生错误，请重试';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // 特定错误处理
      if (errorMessage.includes('401')) {
        errorMessage = 'API密钥无效，请检查您的密钥设置';
      } else if (errorMessage.includes('429')) {
        errorMessage = '请求过于频繁，请稍后再试';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = '请求超时，请检查网络连接或稍后再试';
      }
    }
    
    // 显示错误提示
    toast(errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * 检查API连接是否正常
 */
export const checkApiConnection = async (apiKey: string, modelId: string): Promise<boolean> => {
  try {
    const endpoint = getModelEndpoint(modelId);
    const headers = getRequestHeaders(apiKey, modelId);
    
    const response = await fetch(`${endpoint}/health`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(5000) // 5秒超时
    });
    
    return response.ok;
  } catch (error) {
    console.error('API连接检查失败:', error);
    return false;
  }
};

/**
 * 获取模型的使用状态和配额信息
 */
export const getModelUsage = async (apiKey: string, modelId: string) => {
  try {
    const endpoint = getModelEndpoint(modelId);
    const headers = getRequestHeaders(apiKey, modelId);
    
    const response = await fetch(`${endpoint}/usage`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(5000) // 5秒超时
    });
    
    if (!response.ok) {
      throw new Error('获取使用情况失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取模型使用情况失败:', error);
    return null;
  }
};