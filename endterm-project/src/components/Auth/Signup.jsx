import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; 
import { auth } from '../../firebase/firebase';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Валидация email
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Валидация пароля: 8+ символов, одна цифра, один спецсимвол
  const validatePassword = (password) =>
    /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/.test(password);

  // Обработка изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Валидация всей формы
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';

    if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required';
    else if (formData.displayName.length < 2) newErrors.displayName = 'Display name must be at least 2 characters';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password))
      newErrors.password = 'Password must be at least 8 characters, contain one number and one special character (!@#$%^&*)';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  // Отправка формы
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

      // Создаём пользователя в Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // Добавляем displayName в профиль
      await updateProfile(userCredential.user, { displayName: formData.displayName });

      // Перенаправление на профиль
      navigate('/profile', { state: { message: 'Account created successfully!' } });

    } catch (error) {
      // Обработка ошибок Firebase
      let errorMessage = 'Failed to create account';
      switch (error.code) {
        case 'auth/email-already-in-use': errorMessage = 'This email is already registered'; break;
        case 'auth/invalid-email': errorMessage = 'Invalid email address'; break;
        case 'auth/weak-password': errorMessage = 'Password is too weak'; break;
        case 'auth/network-request-failed': errorMessage = 'Network error. Please check your connection'; break;
        default: errorMessage = error.message;
      }
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Индикатор силы пароля
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (!password) return { strength, color: '#e5e7eb', text: 'Enter password' };

    if (password.length >= 8) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d'];
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    return { strength, color: colors[strength - 1] || colors[0], text: texts[strength - 1] || texts[0] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join TVMaze Explorer today</p>
        </div>

        {errors.submit && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
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
          
          {/* Display name */}
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Enter your name"
              className={errors.displayName ? 'error' : ''}
            />
            {errors.displayName && <span className="field-error">{errors.displayName}</span>}
          </div>
          
          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}

            {/* Индикатор силы пароля */}
            <div className="password-strength">
              <div className="strength-bar">
                <div className="strength-fill" style={{
                  width: `${(passwordStrength.strength / 4) * 100}%`,
                  backgroundColor: passwordStrength.color
                }} />
              </div>
              <span className="strength-text" style={{ color: passwordStrength.color }}>
                {passwordStrength.text}
              </span>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}

            {formData.password && formData.confirmPassword && (
              <div className="password-match">
                <span className={`match-indicator ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                  {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? 
          <Link to="/login" className="login-link">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
