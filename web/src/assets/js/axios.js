import axios from 'axios'

// 添加请求拦截器
axios.interceptors.request.use((config) => {
    return config
}, (err) => {
    return Promise.reject(err)
})

// 添加响应拦截器
axios.interceptors.response.use((response) => {
    return response
}, (err) => {
    return Promise.reject(err)
})

export default axios