# 缓存管理功能说明

## 功能概述

本项目已集成完整的缓存管理机制，包括：

### 1. HTTP请求缓存
- **自动缓存**: GET请求自动缓存响应数据12小时
- **智能去重**: 相同请求自动去重，避免重复网络请求
- **缓存命中**: 缓存命中时直接返回本地数据，提升响应速度

### 2. 图片资源缓存
- **自动下载缓存**: 网络图片自动下载到本地并缓存
- **预加载机制**: 支持图片预加载，提升用户体验
- **智能加载**: 优先使用缓存，失败时自动降级到原始URL

### 3. 缓存过期管理
- **自动过期**: 缓存数据12小时后自动过期
- **定期清理**: 每6小时自动清理过期缓存
- **手动清理**: 提供手动清理接口

## 使用方法

### HTTP请求缓存
```javascript
// 自动启用缓存(GET请求)
const data = await http.get('/api/user/info');

// 禁用特定请求的缓存
const data = await http.get('/api/real-time-data', { cache: false });

// 自定义缓存时间
const data = await http.get('/api/config', { cacheTime: 24 * 60 * 60 * 1000 }); // 24小时
```

### 图片缓存组件
```vue
<!-- 使用缓存图片组件，自动管理缓存 -->
<cached-image 
  src="https://example.com/image.jpg"
  mode="aspectFit"
  :preload="true"
  :enable-cache="true"
/>

<!-- 传统image组件对比 -->
<image src="https://example.com/image.jpg" mode="aspectFit"></image>
```

### 手动缓存管理
```javascript
import AppCacheInit from '@/utils/appCacheInit.js';

// 获取缓存统计
const stats = AppCacheInit.getCacheStats();

// 清理所有缓存
AppCacheInit.clearAllCache();

// 获取缓存大小
const size = await AppCacheInit.getCacheSize();
```

## 性能优化效果

1. **网络请求减少**: 重复的API请求直接从缓存返回
2. **图片加载提速**: 图片缓存到本地，二次访问无需网络请求
3. **用户体验提升**: 预加载关键资源，页面打开更流畅
4. **流量节省**: 减少重复下载，节省用户流量

## 缓存策略

- **API缓存**: 12小时过期，适合相对静态的数据
- **图片缓存**: 12小时过期，支持预加载和懒加载
- **自动清理**: 定期清理过期缓存，避免存储空间膨胀
- **容量限制**: 每种类型缓存最多100项，超出自动删除最旧的

## 注意事项

1. 敏感数据(如实时价格、用户余额等)建议禁用缓存
2. 缓存基于URL和参数，相同请求会复用缓存
3. 图片缓存存储在临时目录，系统清理时可能被删除
4. 建议在设置页面提供手动清理缓存的选项