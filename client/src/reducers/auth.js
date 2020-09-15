import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_ERROR,
    LOGOUT,
} from '../actions/types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
};

export default function (state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case USER_LOADED:
            return { ...state, isAuthenticated: true, user: payload };
        case LOGIN_SUCCESS:
        case REGISTER_SUCCESS:
            //localStorage setItem can be commented out. it break the ruls of redux?
            localStorage.setItem('token', payload.token);
            return {
                ...state,
                ...payload,
                isAuthenticated: true,
                loading: false,
            };

        case REGISTER_FAIL:
        case AUTH_ERROR:
        case LOGIN_ERROR:
        case LOGOUT:
            console.log('Got here');
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
            };

        default:
            return state;
    }
}
