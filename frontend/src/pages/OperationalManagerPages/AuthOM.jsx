import React, { useState } from 'react'
import styled from 'styled-components'
import logo from '../../images/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '../../components/Transition/PageTransition'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Lock, User } from 'lucide-react'

const AuthOM = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate inputs
            if (!email || !password) {
                throw new Error('Please enter both email and password');
            }

            const response = await fetch('https://gatsis-hub.vercel.app/employees/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Verify role is Operational Manager and department matches
            if (data.employee.role !== 'Operational Manager' || data.employee.assigneddepartment !== 'Operational Manager') {
                throw new Error('Access denied. This login is for Operational Managers only.');
            }

            // Store employee data in localStorage
            localStorage.setItem('employee', JSON.stringify(data.employee));

            if (rememberMe) {
                localStorage.setItem('rememberEmployee', 'true');
            }

            // Redirect to OM dashboard
            navigate('/orderpageOM');

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition direction='right'>
            <div className='grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full'>
                {/* Left side */}
                <div className='bg-[#191716] w-full min-h-[400px] lg:min-h-screen order-2 lg:order-1'>
                    <div className='flex flex-col items-center justify-center h-full py-8 md:py-12 lg:py-20 px-4'>
                        <Link to='/'>
                            <img src={logo} alt='Logo' className='w-[100px] h-[100px] md:w-[140px] md:h-[140px] lg:w-[170px] lg:h-[170px] mx-auto' />
                        </Link>
                        <h1 className='text-white text-2xl md:text-3xl lg:text-4xl font-semibold mt-4 md:mt-6 text-center'>Welcome to GatsisHub</h1>
                        <p className='text-white text-sm md:text-base lg:text-xl text-center mt-3 md:mt-5 font-medium px-4 max-w-md'>
                            Operational Manager Portal - Oversee Production & Operations
                        </p>
                    </div>
                </div>

                {/* Right side */}
                <div className='flex flex-col items-center justify-center py-8 md:py-12 lg:py-20 px-4 md:px-8 lg:px-12 order-1 lg:order-2'>
                    <h1 className='text-[#191716] text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-center'>
                        Operational Manager Sign In
                    </h1>

                    <form onSubmit={handleLogin} className='flex flex-col mt-6 md:mt-8 lg:mt-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200'>

                        <StyledInputWrapper className="mb-4 md:mb-5">
                            <div className="input__container email-input">
                                <div className="shadow__input" />
                                <button type="button" className="input__button__shadow">
                                    <User size={18} />
                                </button>
                                <input
                                    type='email'
                                    placeholder='manager@example.com'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input__search"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </StyledInputWrapper>

                        <StyledInputWrapper className="mb-5 md:mb-6">
                            <div className="input__container password-input">
                                <div className="shadow__input" />
                                <button type="button" className="input__button__shadow">
                                    <Lock size={18} />
                                </button>
                                <input
                                    type='password'
                                    placeholder='Enter your password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input__search"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </StyledInputWrapper>

                        {/* Remember Me Checkbox */}
                        <div className='flex items-center mb-4 md:mb-5'>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                className='w-4 h-4 text-[#E6AF2E] bg-gray-100 border-gray-300 rounded focus:ring-[#E6AF2E] focus:ring-2 cursor-pointer'
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={loading}
                            />
                            <label htmlFor="rememberMe" className='ml-2 text-sm md:text-base font-medium text-gray-700 cursor-pointer'>
                                Remember me
                            </label>
                        </div>

                        {error && <p className='text-red-600 text-sm md:text-base text-center mb-4 bg-red-50 p-3 rounded-lg border border-red-200'>{error}</p>}

                        <StyledButton
                            type='submit'
                            disabled={loading}
                            className="sign-in-btn"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </StyledButton>

                        <p className='text-[#35408E] text-xs md:text-sm underline text-center mt-3 cursor-pointer hover:text-[#2d3575]'>
                            <button type="button" onClick={() => setShowForgotPasswordModal(true)}>
                                Forgot password?
                            </button>
                        </p>
                    </form>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
                        {/* Modal Header */}
                        <div className="bg-[#191716] px-4 md:px-6 py-3 md:py-4">
                            <h2 className="text-white text-lg md:text-2xl font-semibold">Password Reset</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 md:p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#E6AF2E] rounded-full flex items-center justify-center mb-3 md:mb-4">
                                    <Lock className="w-6 h-6 md:w-8 md:h-8 text-[#191716]" />
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                                    Contact System Administrator
                                </h3>
                                <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                                    For password reset requests, please contact your System Administrator directly.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 w-full">
                                    <p className="text-xs md:text-sm text-gray-700">
                                        <strong>Note:</strong> Only the System Administrator can reset employee passwords for security purposes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowForgotPasswordModal(false)}
                                className="bg-[#E6AF2E] hover:bg-[#d99c24] text-white font-semibold px-4 md:px-6 py-2 rounded-lg transition-colors text-sm md:text-base cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scaleIn {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </PageTransition>
    )
}

const StyledButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  font-weight: 700;
  font-size: 1.25rem;
  background: #e9b50b;
  color: #f0f0f0;
  cursor: pointer;
  border-radius: 0.5rem;
  border-bottom: 2px solid #e9b50b;
  border-right: 2px solid #e9b50b;
  border-top: 2px solid white;
  border-left: 2px solid white;
  transition-duration: 1s;
  transition-property: border-top, border-left, border-bottom, border-right, box-shadow;

  &:hover {
    border-top: 2px solid #e9b50b;
    border-left: 2px solid #e9b50b;
    border-bottom: 5px solid #000;
    border-right: 5px solid #000;
    box-shadow: rgba(233, 181, 11, 0.4) 8px 8px, 
                rgba(233, 181, 11, 0.3) 12px 12px,
                rgba(233, 181, 11, 0.2) 17px 17px;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    font-size: 1.5rem;
    padding: 1rem 2rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.75rem;
  }
`;

const StyledInputWrapper = styled.div`
  .input__container {
    position: relative;
    background: #f0f0f0;
    padding: 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    border: 3px solid #000;
    width: 100%;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    transform-style: preserve-3d;
    transform: rotateX(10deg) rotateY(-10deg);
    perspective: 1000px;
    box-shadow: 8px 8px 0 #000;
  }

  .input__container:hover {
    transform: rotateX(5deg) rotateY(-5deg) scale(1.05);
    box-shadow: 18px 18px 0 -3px #e9b50b, 18px 18px 0 0 #000;
  }

  .shadow__input {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    bottom: 0;
    z-index: -1;
    transform: translateZ(-50px);
    background: linear-gradient(
      45deg,
      rgba(255, 107, 107, 0.4) 0%,
      rgba(255, 107, 107, 0.1) 100%
    );
    filter: blur(20px);
  }

  .input__button__shadow {
    cursor: pointer;
    border: 2px solid #000;
    background: #e9b50b;
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    transform: translateZ(20px);
    position: relative;
    z-index: 3;
    font-weight: bold;
    text-transform: uppercase;
  }

  .input__button__shadow:hover {
    background: #e9b50b;
    transform: translateZ(10px) translateX(-5px) translateY(-5px);
    box-shadow: 5px 5px 0 0 #000;
  }

  .input__button__shadow svg {
    fill: #000;
    width: 20px;
    height: 20px;
  }

  .input__search {
    width: 100%;
    outline: none;
    border: 2px solid #000;
    padding: 10px 12px;
    font-size: 15px;
    background: #fff;
    color: #000;
    transform: translateZ(10px);
    transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
    position: relative;
    z-index: 3;
    font-family: "Roboto", Arial, sans-serif;
    letter-spacing: -0.5px;
  }

  .input__search::placeholder {
    color: #666;
    font-weight: bold;
    text-transform: uppercase;
  }

  .input__search:hover,
  .input__search:focus {
    background: #f0f0f0;
    transform: translateZ(20px) translateX(-5px) translateY(-5px);
    box-shadow: 5px 5px 0 0 #000;
  }

  .input__search:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .email-input::before {
    content: "EMAIL ADDRESS";
    position: absolute;
    top: -12px;
    left: 15px;
    background: #e9b50b;
    color: #000;
    font-weight: bold;
    padding: 4px 8px;
    font-size: 12px;
    transform: translateZ(50px);
    z-index: 4;
    border: 2px solid #000;
  }

  .password-input::before {
    content: "PASSWORD";
    position: absolute;
    top: -12px;
    left: 15px;
    background: #e9b50b;
    color: #000;
    font-weight: bold;
    padding: 4px 8px;
    font-size: 12px;
    transform: translateZ(50px);
    z-index: 4;
    border: 2px solid #000;
  }
`;

export default AuthOM