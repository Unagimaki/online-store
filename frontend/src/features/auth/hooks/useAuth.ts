import { useLoginMutation, useRegisterMutation } from '../model/authApi';
import { useAppDispatch } from '../../../shared/hooks';
import { setCredentials } from '../model/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [login, loginResult] = useLoginMutation();
  const [register, registerResult] = useRegisterMutation();

  const signIn = async (email: string, password: string) => {
    const result = await login({ email, password });

    if ('data' in result) {
      dispatch(setCredentials(result.data));
      return { success: true };
    }

    return { success: false, error: 'Unable to login' };
  };

  const signUp = async (email: string, password: string) => {
    const result = await register({ email, password });

    if ('data' in result) {
      return { success: true };
    }

    return { success: false, error: 'Unable to register' };
  };

  return {
    signIn,
    signUp,
    loginResult,
    registerResult
  };
};
