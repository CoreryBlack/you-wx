import Request from '../sdk/luch-request/index.js';
import cacheManager, { CACHE_TYPES } from '../utils/cache.js';
import imageCacheManager from '../utils/imageCache.js';

const http = new Request();

/**
 * 请求任务管理Map，存储请求ID与任务对象的映射
 */
const requestTasks = new Map();

/**
 * 请求标识管理Map，存储请求唯一标识与请求ID的映射，用于检测重复请求
 */
const requestKeys = new Map();

/**
 * 请求ID计数器
 */
let requestId = 0;

/**
 * 生成请求的唯一标识
 * @param {Object} config - 请求配置对象
 * @param {string} config.url - 请求URL
 * @param {string} [config.method='GET'] - 请求方法
 * @param {Object} [config.params={}] - URL查询参数
 * @param {Object} [config.data={}] - 请求体数据
 * @returns {string} 请求唯一标识字符串
 */
function generateRequestKey(config) {
    const { url, method = 'GET' } = config;
    
    // 处理参数，确保顺序一致
    const params = config.params || {};
    const data = config.data || {};

    // 将参数转换为有序字符串
    const paramsStr = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    const dataStr = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('&');

    return `${method.toUpperCase()}:${url}?${paramsStr}#${dataStr}`;
}

/**
 * 修改全局默认配置
 * @param {Function} configCallback - 配置回调函数
 * @returns {Object} 修改后的配置对象
 */
http.setConfig((config) => {
    /* config 为默认全局配置*/
    // 优先级：运行时覆盖(debug_base_api) > 条件编译环境变量 > 开发默认 localhost:8080
    let runtimeDebugBase = '';
    try {
        // 在小程序环境使用 uni.getStorageSync
        if (typeof uni !== 'undefined' && uni.getStorageSync) {
            runtimeDebugBase = uni.getStorageSync('debug_base_api') || '';
        }
    } catch (e) {
        runtimeDebugBase = '';
    }
    // 浏览器环境下也尝试读取 localStorage（H5调试场景）
    if (!runtimeDebugBase && typeof window !== 'undefined' && window.localStorage) {
        try {
            runtimeDebugBase = window.localStorage.getItem('debug_base_api') || '';
        } catch (e) {
            runtimeDebugBase = '';
        }
    }

    // 条件编译读取环境变量（仅在支持的平台生效）
    let envBase = '';
    // #ifdef H5
    envBase = import.meta.env.VITE_APP_BASE_API || '';
    // #endif
    
    // 如果环境变量未生效，使用开发默认值
    const fallback = 'http://localhost:8080';

    const chosenBase = (runtimeDebugBase || envBase || fallback).replace(/\/+$/, '');
    config.baseURL = chosenBase + '/api'; /* 根域名 */
    console.log('[HTTP Config] baseURL =', config.baseURL, ' (source:', runtimeDebugBase ? 'debug_base_api' : (envBase ? 'env_var' : 'default:8080') + ')');
    
    config.header = {
        'Content-Type': 'application/json;charset=utf-8',
        // #ifdef MP-WEIXIN
        'x-platform': 'wechat',
        'x-app-id': 'wxc9c7dc34af711d97', // 小程序 AppID
        // #endif
        // #ifdef APP-PLUS
        'x-platform': 'app',
        'x-app-id': '__UNI__FDB2637', // App AppID
        // #endif
    };
    // 添加getTask回调以获取请求任务对象
    config.getTask = (task, options) => {
        if (options.requestId) {
            // 存储任务对象而非配置
            requestTasks.set(options.requestId, task);
        }
    };
    
    // 启用缓存配置
    config.cache = true;
    config.cacheTime = 12 * 60 * 60 * 1000; // 12小时缓存
    
    return config;
});

/**
 * 请求拦截器
 * @param {Object} config - 请求配置对象
 * @returns {Object} 处理后的请求配置对象
 */
http.interceptors.request.use(
    (config) => {
        console.log('[HTTP Request] 发起请求 ====');
        console.log('[HTTP Request] Method:', config.method);
        console.log('[HTTP Request] URL:', config.baseURL + config.url);
        console.log('[HTTP Request] Data:', config.data);
        console.log('[HTTP Request] Params:', config.params);
        console.log('============================');
        
        // 生成请求唯一标识
        const requestKey = generateRequestKey(config);

        // 检查缓存(仅对GET请求)
        if (config.method === 'GET' && config.cache !== false) {
            const cacheKey = `api_${requestKey}`;
            const cachedData = cacheManager.get(CACHE_TYPES.API, cacheKey);
            
            if (cachedData) {
                console.log(`[HTTP Cache] API缓存命中: ${config.url}`);
                // 返回缓存数据，模拟请求响应
                return Promise.resolve({
                    data: cachedData,
                    config,
                    header: {},
                    statusCode: 200,
                    cookies: []
                });
            }
        }

        // 检查是否存在重复请求
        if (requestKeys.has(requestKey)) {
            // 取消之前的重复请求
            const previousRequestId = requestKeys.get(requestKey);
            http.cancelRequest(previousRequestId, '重复请求，已取消');
        }

        // 生成唯一请求ID
        const currentRequestId = requestId++;
        config.requestId = currentRequestId;

        // 存储请求标识与requestId的映射
        requestKeys.set(requestKey, currentRequestId);

        const token = uni.getStorageSync('token')
        if (token) {
            config.header.authorization = 'Bearer ' + token
        }

        return config;
    },
    (config) => {
        // 可使用async await 做异步操作
        return Promise.reject(config);
    },
);

/**
 * 响应拦截器
 * @param {Object} response - 响应对象
 * @returns {Promise<any>} 处理后的响应数据
 */
http.interceptors.response.use(
    async (response) => {
        // 请求完成后移除请求任务和请求标识
        if (response.config?.requestId) {
            console.log('请求完成:', response.config.requestId);
            requestTasks.delete(response.config.requestId);

            // 生成请求标识并从映射中删除
            const requestKey = generateRequestKey(response.config);
            if (requestKeys.get(requestKey) === response.config.requestId) {
                requestKeys.delete(requestKey);
            }
        }

        const res = response.data
        
        // 缓存GET请求的成功响应
        if (response.config?.method === 'GET' && response.config?.cache !== false && res.code === 0) {
            const requestKey = generateRequestKey(response.config);
            const cacheKey = `api_${requestKey}`;
            const cacheTime = response.config.cacheTime || 12 * 60 * 60 * 1000; // 12小时
            
            cacheManager.set(CACHE_TYPES.API, cacheKey, res.data, cacheTime);
            console.log(`[HTTP Cache] API响应已缓存: ${response.config.url}`);
        }
        
        // 业务成功处理
        if (res.code === 0) return res.data

        uni.showToast({
            title: res.message || '请求失败',
            icon: 'none',
            mask: true
        })

        return Promise.reject(new Error(res.message || 'Error'))
    },
    async (error) => {
        // 请求失败后移除请求任务和请求标识
        if (error.config?.requestId) {
            requestTasks.delete(error.config.requestId);

            // 生成请求标识并从映射中删除
            const requestKey = generateRequestKey(error.config);
            if (requestKeys.get(requestKey) === error.config.requestId) {
                requestKeys.delete(requestKey);
            }
        }

        // 处理取消请求的错误
        if (error && error.errMsg === "request:fail abort") {
            console.log('请求已取消:', error.message || error.errMsg);
            return Promise.reject(new Error('请求已取消'));
        }

        const isFirstLaunch = uni.getStorageSync('isFirstLaunch');
        if (!isFirstLaunch && error.statusCode === 401) {
            uni.reLaunch({
                url: '/pages/personal/login'
            })
        }
        uni.showToast({
            title: error?.data?.message || '请求失败',
            icon: 'none'
        })
        return Promise.reject(error);
    },
);

/**
 * 取消请求的方法
 * @param {number} [requestId] - 可选，请求ID，如果提供则取消特定请求，否则取消所有请求
 * @param {string} [message='切换路由，已取消'] - 可选，取消请求的原因
 */
http.cancelRequest = function (requestId, message = '切换路由，已取消') {
    if (requestId !== undefined) {
        // 取消特定请求
        const task = requestTasks.get(requestId);
        if (task) {
            // 使用任务对象的abort方法取消请求
            task.abort();
            requestTasks.delete(requestId);
            console.log(`取消请求: ${requestId}, 原因: ${message}`);
        }
    } else {
        // 取消所有请求
        requestTasks.forEach((task, id) => {
            task.abort();
            console.log(`取消请求: ${id}, 原因: ${message}`);
        });
        requestTasks.clear();
        requestKeys.clear(); // 清空请求标识映射
    }
};

export default http;