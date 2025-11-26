// 图片管理配置
// 用于处理菜品图片的加载和占位图

// Supabase存储桶配置
const SUPABASE_STORAGE_URL = import.meta.env.VITE_APP_SUPABASE_STORAGE_URL || '';
const STORAGE_BUCKET = 'dish-images'; // Supabase存储桶名称

// 本地占位图路径
const LOCAL_PLACEHOLDER = '/placeholder-dish.svg';

// 默认占位图（如果没有配置本地占位图）
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23f5f5f0" width="300" height="200"/%3E%3Ctext fill="%23a0a0a0" font-family="sans-serif" font-size="16" dy="50%25" dx="50%25" text-anchor="middle" alignment-baseline="middle"%3E暂无图片%3C/text%3E%3C/svg%3E';

/**
 * 获取菜品图片URL
 * 优先级：
 * 1. 数据库中的imageUrl（完整URL或存储桶路径）
 * 2. 本地占位图
 * 3. SVG默认占位图
 * 
 * @param imageUrl - 数据库中的图片URL或路径
 * @param dishId - 菜品ID，用于生成一致的占位图
 * @returns 完整的图片URL
 */
export function getDishImageUrl(imageUrl?: string | null, _dishId?: string): string {
  // 如果有数据库URL
  if (imageUrl) {
    // 如果是完整的HTTP/HTTPS URL，直接返回
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // 如果是存储桶路径（如 "dishes/H1.jpg"）
    if (SUPABASE_STORAGE_URL) {
      return `${SUPABASE_STORAGE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${imageUrl}`;
    }
    
    // 如果是相对路径，返回本地路径
    return imageUrl;
  }
  
  // 降级到本地占位图
  return LOCAL_PLACEHOLDER;
}

/**
 * 获取占位图URL（用于加载失败时的降级）
 * @returns 占位图URL
 */
export function getPlaceholderImageUrl(): string {
  return LOCAL_PLACEHOLDER;
}

/**
 * 获取默认占位图（SVG，不依赖网络）
 * @returns SVG占位图data URL
 */
export function getDefaultPlaceholder(): string {
  return DEFAULT_PLACEHOLDER;
}

/**
 * 预加载图片
 * @param url - 图片URL
 * @returns Promise，成功时resolve，失败时reject
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * 批量预加载图片
 * @param urls - 图片URL数组
 * @returns Promise，所有图片加载完成时resolve
 */
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map(url => 
    preloadImage(url).catch(err => {
      console.warn(`Image preload failed: ${url}`, err);
      return Promise.resolve(); // 单个失败不影响整体
    })
  );
  await Promise.all(promises);
}

// 上传配置说明
export const IMAGE_UPLOAD_GUIDE = {
  instructions: '如需上传菜品图片：',
  steps: [
    '1. 登录Supabase Dashboard',
    '2. 进入Storage管理',
    `3. 在 "${STORAGE_BUCKET}" 存储桶中上传图片`,
    '4. 复制图片的公开URL',
    '5. 在数据库dishes表中更新对应菜品的image_url字段'
  ],
  formats: '支持格式: JPG, PNG, WebP',
  maxSize: '建议大小: 500KB以内',
  dimensions: '建议尺寸: 800x600 或 16:9 比例'
};
