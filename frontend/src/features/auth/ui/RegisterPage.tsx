import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/ui/Button';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { Input } from '../../../shared/ui/Input';
import { Loader } from '../../../shared/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../../../shared/routes/routes';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { signUp, registerResult } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const result = await signUp(email, password);

    if (!result.success) {
      setSubmitError(result.error ?? 'Registration failed');
      return;
    }

    setSubmitSuccess(true);
  };

  return (
    <section className="card">
      <h1>Register</h1>
      <p>Create a new account to continue.</p>
      <form className="form" onSubmit={handleSubmit}>
        <Input
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          autoComplete="new-password"
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
        <Button type="submit" disabled={registerResult.isLoading}>
          Register
        </Button>

        {registerResult.isLoading && <Loader />}
        {submitError && <ErrorMessage message={submitError} />}
        {registerResult.isError && <ErrorMessage message="Server error during registration." />}
        {submitSuccess && <div style={{ color: '#047857' }}>Registration completed, please login.</div>}
      </form>

      <p style={{ marginTop: '1rem' }}>
        Уже есть аккаунт? <Link to={ROUTES.login}>Войти</Link>
      </p>
    </section>
  );
};
