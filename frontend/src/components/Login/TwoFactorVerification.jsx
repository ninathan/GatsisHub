import React, { useState, useEffect, useRef } from 'react';
import logo from '../../images/logo.png';
import PageTransition from '../Transition/PageTransition';

const TwoFactorVerification = ({ email, onVerified, onBack, onResend }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('Verification code has expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('');
    while (newCode.length < 6) newCode.push('');
    
    setCode(newCode);
    
    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-submit if 6 digits pasted
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeToVerify = code.join('')) => {
    if (codeToVerify.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://gatsis-hub.vercel.app/auth/verify-login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emailAddress: email, 
          code: codeToVerify 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Verification successful
      onVerified(data.user);
    } catch (err) {
      setError(err.message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    setTimeLeft(900); // Reset timer
    
    try {
      await onResend();
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition direction='right'>
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#35408E] to-[#4a5899] p-4'>
        <div className='bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md'>
          {/* Logo */}
          <div className='flex justify-center mb-6'>
            <img src={logo} alt='GatsisHub Logo' className='w-20 h-20 md:w-24 md:h-24' />
          </div>

          {/* Header */}
          <div className='text-center mb-8'>
            <h2 className='text-2xl md:text-3xl font-bold text-[#35408E] mb-2'>
              Verify Your Login
            </h2>
            <p className='text-gray-600 text-sm md:text-base'>
              We've sent a 6-digit code to
            </p>
            <p className='text-[#35408E] font-semibold mt-1'>{email}</p>
          </div>

          {/* Timer */}
          <div className='text-center mb-6'>
            <div className={`inline-block px-4 py-2 rounded-lg ${
              timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <p className='text-sm font-medium'>
                Code expires in: <span className='font-bold text-lg'>{formatTime(timeLeft)}</span>
              </p>
            </div>
          </div>

          {/* Code Input */}
          <div className='mb-6'>
            <div className='flex justify-center gap-2 md:gap-3' onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type='text'
                  inputMode='numeric'
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading || timeLeft === 0}
                  className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-[#35408E] focus:border-[#35408E]
                    ${digit ? 'border-[#35408E] bg-blue-50' : 'border-gray-300'}
                    ${error ? 'border-red-500' : ''}
                    ${loading || timeLeft === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}
                    transition-all duration-200`}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='mb-6 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-600 text-sm text-center'>{error}</p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || code.some(d => !d) || timeLeft === 0}
            className='w-full bg-[#35408E] hover:bg-[#2d3575] text-white font-semibold py-3 md:py-4 rounded-xl
              transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed
              transform active:scale-95 shadow-lg hover:shadow-xl'
          >
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend Code */}
          <div className='mt-6 text-center'>
            <p className='text-gray-600 text-sm mb-2'>Didn't receive the code?</p>
            <button
              onClick={handleResendCode}
              disabled={loading || timeLeft > 840} // Can resend after 1 minute
              className='text-[#35408E] hover:text-[#2d3575] font-semibold text-sm underline
                disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed
                transition-colors duration-200'
            >
              {timeLeft > 840 ? `Resend in ${Math.ceil((900 - timeLeft))}s` : 'Resend Code'}
            </button>
          </div>

          {/* Back to Login */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <button
              onClick={onBack}
              disabled={loading}
              className='w-full text-gray-600 hover:text-gray-800 font-medium py-2 rounded-lg
                hover:bg-gray-100 transition-all duration-200 disabled:cursor-not-allowed'
            >
              ← Back to Login
            </button>
          </div>

          {/* Security Notice */}
          <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <p className='text-xs text-yellow-800 text-center'>
              🔒 <strong>Security Notice:</strong> Never share this code with anyone. 
              GatsisHub will never ask for your verification code.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TwoFactorVerification;
