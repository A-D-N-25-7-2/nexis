import axiosInstance from '../../services/axiosInstance';

export const registerUser = async (formData) => {
    const response = await axiosInstance.post('/users/register', formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    );
    return response.data;
}

export const loginUser = async (data) => {
    const response = await axiosInstance.post('/users/login', data);
    return response.data;
}

export const logoutUser = async () => {
    const response = await axiosInstance.post('/users/logout');
    return response.data;
}

export const refreshToken = async () => {
    const response = await axiosInstance.post('/users/refresh-token');
    return response.data;
}

export const getCurrentUser = async () => {
    const response = await axiosInstance.get('/users/current-user');
    return response.data;
}