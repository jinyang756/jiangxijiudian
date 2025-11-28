import { MenuCategory, MenuItem } from '../types/types';

export class ImageLoader {
  private static cache: Map<string, boolean> = new Map();

  // 预加载单张图片
  static preloadImage(src: string): Promise<boolean> {
    // 检查缓存
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src)!);
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, true);
        resolve(true);
      };
      img.onerror = () => {
        this.cache.set(src, false);
        resolve(false);
      };
      img.src = src;
    });
  }

  // 批量预加载图片
  static async preloadImages(sources: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    // 并行加载所有图片
    const promises = sources.map(src => 
      this.preloadImage(src).then(result => ({ src, result }))
    );
    
    const loaded = await Promise.all(promises);
    
    // 构建结果对象
    loaded.forEach(({ src, result }) => {
      results[src] = result;
    });
    
    return results;
  }

  // 预加载菜单图片
  static async preloadMenuImages(menuData: MenuCategory[]): Promise<void> {
    const imageUrls: string[] = [];
    
    // 收集所有菜品图片URL
    menuData.forEach(category => {
      if (category.items) {
        category.items.forEach((item: MenuItem) => {
          if (item.imageUrl) {
            imageUrls.push(item.imageUrl);
          } else {
            // 生成默认图片URL
            const seed = item.id.charCodeAt(0) + parseInt(item.id.slice(1) || '0');
            imageUrls.push(`https://loremflickr.com/300/200/food,chinese/all?lock=${seed}`);
          }
        });
      }
    });
    
    // 去重
    const uniqueUrls = [...new Set(imageUrls)];
    
    // 预加载图片
    await this.preloadImages(uniqueUrls);
  }

  // 清除缓存
  static clearCache(): void {
    this.cache.clear();
  }
}