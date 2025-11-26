import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react(),
      // Gzip 压缩
      isProduction && viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240, // 10KB 以上才压缩
        algorithm: 'gzip',
        ext: '.gz',
      }),
      // Brotli 压缩（比 Gzip 更高效）
      isProduction && viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      // 生成包分析报告（可选）
      isProduction && visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      })
    ].filter(Boolean),
    
    server: {
      port: 3000,
      open: true,
      // 启用 HMR
      hmr: {
        overlay: true
      }
    },
    
    build: {
      outDir: 'dist',
      // 开发环境启用 sourcemap，生产环境禁用以减小体积
      sourcemap: !isProduction,
      // 使用 esbuild 压缩，比 terser 快 20-40 倍
      minify: isProduction ? 'esbuild' : false,
      // 目标浏览器
      target: 'es2015',
      // CSS 代码分割
      cssCodeSplit: true,
      // 构建后清理输出目录
      emptyOutDir: true,
      // Rollup 配置
      rollupOptions: {
        output: {
          // 静态资源分类打包
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // 根据文件类型分类
            if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
            
            const info = assetInfo.name.split('.');
            let extType = info[info.length - 1];
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash].${extType}`;
            } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash].${extType}`;
            } else if (/\.css$/i.test(assetInfo.name)) {
              return `assets/css/[name]-[hash].${extType}`;
            }
            return `assets/[name]-[hash].${extType}`;
          },
          // 手动代码分割
          manualChunks: (id) => {
            // node_modules 依赖分离
            if (id.includes('node_modules')) {
              // React 核心库
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              // Supabase 相关
              if (id.includes('@supabase') || id.includes('supabase')) {
                return 'supabase-vendor';
              }
              // UI 组件库（如果有）
              if (id.includes('antd') || id.includes('@ant-design')) {
                return 'ui-vendor';
              }
              // 其他第三方库
              return 'vendor';
            }
            // 组件按目录分割（可选）
            if (id.includes('/components/')) {
              return 'components';
            }
          }
        },
        // 忽略警告
        onwarn(warning, warn) {
          // 忽略 "this" 关键字的警告
          if (warning.code === 'THIS_IS_UNDEFINED') return;
          warn(warning);
        }
      },
      // chunk 大小警告限制（KB）
      chunkSizeWarningLimit: 1000,
      // 资源内联限制
      assetsInlineLimit: 4096, // 4KB 以下内联为 base64
      // 报告压缩大小
      reportCompressedSize: true,
      // CSS 压缩
      cssMinify: isProduction
    },
    
    // esbuild 配置
    esbuild: {
      // 生产环境移除 console 和 debugger
      drop: isProduction ? ['console', 'debugger'] : [],
      // 压缩标识符
      minifyIdentifiers: isProduction,
      // 压缩语法
      minifySyntax: isProduction,
      // 压缩空白
      minifyWhitespace: isProduction,
      // 保留类名（用于调试）
      keepNames: !isProduction,
      // 目标语法
      target: 'es2015'
    },
    
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@supabase/supabase-js'
      ],
      // 排除某些依赖的预构建
      exclude: []
    },
    
    // 性能优化
    performance: {
      // 性能提示
      hints: isProduction ? 'warning' : false
    }
  };
});