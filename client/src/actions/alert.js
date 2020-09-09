import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

//were able to do this by Thunk middleware  destructing action to
// msg and aleT???
//adding timeout as time parameter with 5000 default value
export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
    const id = uuid.v4();
    dispatch({
        type: SET_ALERT,
        payload: { msg, alertType, id },
    });
    setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
