import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/ui/Button';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { Input } from '../../../shared/ui/Input';
import { Loader } from '../../../shared/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../../../shared/routes/routes';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { signIn, loginResult } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const result = await signIn(email, password);

    if (!result.success) {
      setSubmitError(result.error ?? 'Login failed');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Input
        label="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        placeholder="your@email.com"
        autoComplete="username"
        required
      />
      <Input
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        type={showPassword ? 'text' : 'password'}
        placeholder="Password"
        autoComplete="current-password"
        required
        endAdornment={
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        }
      />
      <Button type="submit" disabled={loginResult.isLoading}>
        Sign in
      </Button>

      {loginResult.isLoading && <Loader />}
      {submitError && <ErrorMessage message={submitError} />}
      {loginResult.isError && <ErrorMessage message="Server error during login." />}

      <p style={{ marginTop: '1rem' }}>
        Нет аккаунта? <Link to={ROUTES.register}>Зарегистрироваться</Link>
      </p>
    </form>
  );
};
