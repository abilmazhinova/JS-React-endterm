import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../../firebase/firebase';
import './Login.css';

const Login = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // хук для навигации
  const location = useLocation(); // хук для текущего маршрута

  // путь перенаправления после логина
  const from = location.state?.from?.pathname || '/profile';

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Обработка изменений в полях формы
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.submit) setErrors(prev => ({ ...prev, submit: '' }));
  };

  // Валидация всех полей перед отправкой
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';

    if (!formData.password) newErrors.password = 'Password is required';

    return newErrors;
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors); 
      return;
    }

    try {
      setLoading(true); 
      setErrors({});
      
      // попытка входа через Firebase
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // если checked "remember me", сохраняем email
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      navigate(from, { replace: true, state: { message: 'Welcome back!' } });
      
    } catch (error) {
      // обработка ошибок Firebase
      let errorMessage = 'Failed to login';
      switch (error.code) {
        case 'auth/user-not-found': errorMessage = 'No account found with this email'; break;
        case 'auth/wrong-password': errorMessage = 'Incorrect password'; break;
        case 'auth/invalid-email': errorMessage = 'Invalid email address'; break;
        case 'auth/user-disabled': errorMessage = 'This account has been disabled'; break;
        case 'auth/too-many-requests': errorMessage = 'Too many login attempts. Please try again later'; break;
        case 'auth/network-request-failed': errorMessage = 'Network error. Please check your connection'; break;
        default: errorMessage = error.message;
      }
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false); 
    }
  };

  // при монтировании компонента заполняем email из localStorage (remember me)
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your TVMaze Explorer account</p>
        </div>
        
        {errors.submit && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {errors.submit}
          </div>
        )}
        
        {/* форма логина */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          
          {/* Password input */}
          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          
          {/* Remember me checkbox */}
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Remember me</span>
            </label>
          </div>
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <div className="auth-link">
            Don't have an account? 
            <Link to="/signup" className="signup-link">Sign up now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
