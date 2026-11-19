import axios from "axios";

const API = axios.create({
    baseURL:'http://https://agentic-ai-website-driver.vercel.app/api',
});

API.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 🟢 Response Interceptor: Handle Unauthorized/Expired tokens globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/authentication';
        }
        return Promise.reject(error);
    }
);

export default API;