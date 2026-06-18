import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    loginUser,
    logoutUser,
    registerUser,
} from '../features/auth/authApi.js';
import {
    setCredentials,
    logout,
    selectCurrentUser,
    selectIsAuthenticated,
} from '../features/auth/authSlice.js';

const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const login = async (data) => {
        const response = await loginUser(data);
        dispatch(
            setCredentials({
                user: response.data.user,
            })
        );
        navigate('/');
    };

    const register = async (formData) => {
        await registerUser(formData);
        navigate('/login');
    };

    const logOut = async () => {
        await logoutUser();
        dispatch(logout());
        navigate('/login');
    };

    return { user, isAuthenticated, login, register, logOut };
};

export default useAuth;