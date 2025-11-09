import React, {  useState } from 'react';
import { Activity, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../supabase/auth';
import { login } from '../store/authSlice';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialty: ''
  });
  const [specialtySuggestions, setSpecialtySuggestions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const specialties = [
    'Internal Medicine',
    'Family Medicine',
    'Cardiology',
    'Dermatology',
    'Emergency Medicine',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Other'
  ];

  const handleSpecialtyInput = (value) => {
    handleInputChange('specialty', value);
    if (value.length > 0) {
      const filtered = specialties.filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setSpecialtySuggestions(filtered);
    } else {
      setSpecialtySuggestions([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.specialty) {
      newErrors.specialty = 'Please enter your specialty';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      const result = await authService.createAccountService({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        specialty: formData.specialty,
      });
      
      console.log('Signup result:', result);
      
      if (result.error) {
        console.error('Signup error:', result.error);
        setErrors({ 
          email: result.error.message || 'An account with this email already exists' 
        });
        return;
      }

      if (result.user) {
        // Success: dispatch to Redux store with user and provider data
        dispatch(login({ 
          user: result.user, 
          provider: result.provider 
        }));
        
        // Store user and provider data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(result.user));
        if (result.provider) {
          localStorage.setItem('provider', JSON.stringify(result.provider));
        }
        
        console.log('Signup successful:', result.user);
        
        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        setErrors({ email: 'Account creation failed. Please try again.' });
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ 
        email: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to home</span>
        </button>

        {/* Signup Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <span className="text-2xl font-semibold text-gray-900">MedPortal</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600">Join thousands of healthcare providers</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Dr. John Smith"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>


            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="doctor@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-4 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g. +1234567890"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                Medical Specialty
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="specialty"
                  type="text"
                  autoComplete="off"
                  value={formData.specialty}
                  onChange={(e) => handleSpecialtyInput(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.specialty ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Type your specialty"
                />
                {specialtySuggestions.length > 0 && (
                  <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {specialtySuggestions.map((s) => (
                      <li
                        key={s}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => {
                          handleInputChange('specialty', s);
                          setSpecialtySuggestions([]);
                        }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.specialty && (
                <p className="mt-1 text-sm text-red-600">{errors.specialty}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                required
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;