// Imports...
import heroImage from '../../assets/heroImage.svg';
import FacebookLoginIcon from '../../assets/facebookLoginIcon.svg';
import GoogleLoginIcon from '../../assets/googleLoginIcon.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ setLoggedIn, setUser }) { // 👈 add setUser prop
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [hide, setHide] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;

    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!isLogin) {
      if (!username.trim()) {
        setError('Username is required for signup');
        return false;
      }
      if (username.length < 3) {
        setError('Username must be at least 3 characters long');
        return false;
      }
      if (!confirmPassword.trim()) {
        setError('Please confirm your password');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const loginSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const endpoint = isLogin ? 'login' : 'signup';
      const url = `http://localhost/api/${endpoint}`;

      const requestBody = isLogin
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage(isLogin ? 'Login successful!' : 'Account created successfully!');

      // ✅ Save token and user in SAME keys App.tsx expects
      if (data.token) {
        localStorage.setItem('token', data.token);
        setLoggedIn(true);
      }
      if (data.user) {
        localStorage.setItem('storedUser', JSON.stringify(data.user));
        setUser(data.user); // ✅ update global state
      }

      // Reset form
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });

      // Redirect
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      console.error('Error during authentication:', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
    setFormData(
      !isLogin
        ? { username: '', email: '', password: '', confirmPassword: '' }
        : { email: '', password: '' }
    );
  };

    // ✅ Retrieve current user for debugging (optional)
    // const loggedUser = JSON.parse(localStorage.getItem('user'));
    // console.log("Currently logged in user:", loggedUser);
    
    return(
        <>
            {/* min-h-fit */}
            <div className="min-h-screen flex justify-center items-center h-full w-full">

                {!hide ? 
                <>
                    <div className="relative min-h-fit flex items-center justify-center portrait:h-screen landscape:h-fit lg:landscape:h-screen landscape:pt-8 2xl:landscape:pt-0 w-screen">

                    {/* Hero Image */}
                    <img src={heroImage} draggable='false' alt="Hero" className="select-none relative z-4 h-full w-full object-cover landscape:hidden" />

                    {/* Main container */}
                    <div className='portrait:absolute z-5 flex portrait:flex-col portrait:p-4 overflow-hidden bg-white landscape:bg-[#253829] shadow-xl rounded-xl portrait:rounded-2xl h-3/5 landscape:h-fit w-3/5 portrait:h-fit portrait:w-7/8 landscape:w-5/6 lg:landscape:w-5/6'>

                        {/* Left Container for Image */}
                        <div className='portrait:hidden flex w-1/2'>
                            {/* Hero Image */}
                            <img src={heroImage} draggable='false' alt="Hero" className="w-full object-cover" />
                        </div>
                        
                        {/* Right Container for content */}
                        <div className='flex flex-col gap-4 lg:landscape:gap-8 portrait:h-full portrait:w-full landscape:w-1/2 landscape:p-4 portrait:py-8 lg:landscape:p-8 lg:landscape:py-12'>

                            {/* Dynamically Changing Welcome Label */}
                            <p draggable='false' className='portrait:default-text landscape:text-white select-none text-lg lg:landscape:text-3xl font-semibold text-center'>
                                {isLogin ? 'Log into your account!' : 'Create your account!'}
                            </p>

                            {/* Error/Success Messages */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
                                    {error}
                                </div>
                            )}
                            {successMessage && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm">
                                    {successMessage}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={loginSignup} className='flex flex-col w-full h-full justify-center gap-4 lg:landscape:gap-6'>

                                {!isLogin && (
                                    // Desired Username Field
                                    <div draggable='false' className='flex flex-col gap-2'>
                                        <p draggable='false' className='portrait:default-text select-none landscape:text-white text-sm lg:landscape:text-xl font-semibold'>
                                            Desired Username:
                                        </p>
                                        <input 
                                            type="text" 
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            placeholder='Desired username here' 
                                            className='border border-gray-400 rounded-lg lg:text-xl px-3 py-2 text-gray-800' 
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}

                                {/* Email Field */}
                                <div draggable='false' className='flex flex-col gap-2'>
                                    <p draggable='false' className='portrait:default-text select-none landscape:text-white text-sm lg:landscape:text-xl font-semibold'>
                                        Email:
                                    </p>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder='Email here' 
                                        className='border border-gray-400 rounded-lg lg:text-xl px-3 py-2 text-gray-800' 
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Password Field */}
                                <div draggable='false' className='flex flex-col gap-2'>
                                    <p draggable='false' className='portrait:default-text select-none landscape:text-white text-sm lg:landscape:text-xl font-semibold'>
                                        Password:
                                    </p>
                                    <input 
                                        type="password" 
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder='Password here' 
                                        className='border border-gray-400 rounded-lg lg:text-xl px-3 py-2 text-gray-800' 
                                        disabled={isLoading}
                                    />
                                </div>

                                {!isLogin && (
                                    // Confirm Password Field
                                    <div draggable='false' className='flex flex-col gap-2'>
                                        <p draggable='false' className='portrait:default-text select-none landscape:text-white text-sm lg:landscape:text-xl font-semibold'>
                                            Confirm Password:
                                        </p>
                                        <input 
                                            type="password" 
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder='Confirm password' 
                                            className='border border-gray-400 rounded-lg lg:text-xl px-3 py-2 text-gray-800' 
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}

                                {/* Alternative Login Options */}
                                <div draggable='false' className='flex flex-col gap-2 lg:landscape:gap-4'>
                                    <p className='portrait:default-text select-none landscape:text-white underline lg:landscape:text-xl font-semibold text-center'>
                                        or login with
                                    </p>

                                    {/* Icons */}
                                    <div draggable='false' className='flex justify-center gap-4'>
                                        {/* Facebook */}
                                        <img 
                                            src={FacebookLoginIcon} 
                                            draggable='false' 
                                            className='h-6 md:h-10 select-none cursor-pointer hover:opacity-80 transition-opacity' 
                                            alt="Facebook Login" 
                                        />

                                        {/* Google */}
                                        <img 
                                            src={GoogleLoginIcon} 
                                            draggable='false' 
                                            className='h-6 md:h-10 select-none cursor-pointer hover:opacity-80 transition-opacity' 
                                            alt="Google Login" 
                                        />
                                    </div>
                                </div>

                                {/* Switch to Register */}
                                <div draggable='false' className='w-full flex justify-center'>
                                    <button 
                                        type="button"
                                        draggable='false' 
                                        className='select-none cursor-pointer hover:opacity-80 transition-opacity' 
                                        onClick={handleModeSwitch}
                                        disabled={isLoading}
                                    >
                                        <p draggable='false' className='portrait:default-text landscape:text-white lg:landscape:text-xl font-semibold text-center underline select-none cursor-pointer'>
                                            {isLogin ? 'No account yet? Create one!' : 'Already have an account? Log in!'}
                                        </p>
                                    </button>
                                </div>

                                {/* Captcha */}
                                <div></div>

                                {/* Login/Signup Button */}
                                <button 
                                    type="submit"
                                    draggable='false' 
                                    className={`select-none cursor-pointer py-3 px-6 lg:py-5 lg:px-10 w-fit rounded-lg mx-auto text-white text-lg lg:text-2xl font-semibold main-background landscape:!bg-white landscape:text-[#253829] transition-opacity ${
                                        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                                    }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign-up')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                </>
                
                :
                
                <>
                    <div className='flex flex-col'>
                        <p className='text-[3rem] portrait:text-2xl default-text font-bold'>More Coming Soon!</p>
                        <p className='text-[1.6rem] portrait:text-xl default-text font-semibold text-center'>Stay tuned!</p>
                    </div>
                </>}               
            </div>
        </>
    );
}