import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useState } from 'react';
import styled from 'styled-components';
import banner from '../../images/contanctusbanner.png'
import banner2 from '../../images/contanctusbanner2.png'
import useScrollAnimation from '../../hooks/useScrollAnimation';

const ContanctUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const bannerAnim = useScrollAnimation({ threshold: 0.2 });
  const leftAnim = useScrollAnimation({ threshold: 0.2 });
  const phoneAnim = useScrollAnimation({ threshold: 0.2 });
  const emailAnim = useScrollAnimation({ threshold: 0.2 });
  const addressAnim = useScrollAnimation({ threshold: 0.2 });
  const formAnim = useScrollAnimation({ threshold: 0.2 });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear status message when user starts typing
    if (submitStatus.message) {
      setSubmitStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all fields'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you for your message! We\'ll get back to you soon.'
        });
        // Clear form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <img
        ref={bannerAnim.ref}
        src={banner2}
        alt="Contact Us"
        className={bannerAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'}
      />
      <section className="px-4 md:px-20 py-20">
        {/* right section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <div
            ref={leftAnim.ref}
            className={`flex flex-col justify-center items-start lg:items-start text-left ${leftAnim.isVisible ? 'scroll-slide-right' : 'scroll-hidden'
              }`}
          >
            <div className='mb-8 -mt-12'>
              <p className='text-lg md:text-xl lg:text-2xl xl:text-3xl font-extralight max-w-full lg:max-w-[535px] leading-relaxed text-justify'>Got ideas for us? Questions about anything at all? Need a little help, or just want to send a friendly wave? We're all ears! Feel free to reach out.</p>
            </div>

            <div className='flex flex-col justify-start items-start text-left w-full'>
              <div
                ref={phoneAnim.ref}
                className={`mb-4 flex items-center ${phoneAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                  }`}
              >
                <FaPhoneAlt className='inline text-xl md:text-2xl text-black flex-shrink-0' />
                <span className='text-base md:text-lg lg:text-xl ml-2 break-words'>+63 976 026 4719</span>
              </div>
              <div
                ref={emailAnim.ref}
                className={`mb-4 flex items-center ${emailAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                  }`}
              >
                <FaEnvelope className='inline text-xl md:text-2xl text-black flex-shrink-0' />
                <span className='text-base md:text-lg lg:text-xl ml-2 break-words'>gatsishub@gmail.com</span>
              </div>
              <div
                ref={addressAnim.ref}
                className={`mb-4 flex items-start ${addressAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                  }`}
              >
                <FaMapMarkerAlt className='inline text-xl md:text-2xl text-black flex-shrink-0 mt-1' />
                <span className='text-base md:text-lg lg:text-xl ml-2 break-words'>SIERRA MADRE BLDG. VICTORIA WAVE-SEZ, BRGY. 186 TALA, NORTH CALOOCAN</span>
              </div>
            </div>
          </div>

          {/* left section */}
          <div
            ref={formAnim.ref}
            className={` -mt-10 flex justify-center ${formAnim.isVisible ? 'scroll-slide-left' : 'scroll-hidden'
              }`}
          >
            <div className="w-full">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#E6AF2E]">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] px-6 md:px-8 py-4 md:py-6">
                  <h3 className="text-white text-2xl md:text-3xl font-bold">Get in Touch</h3>
                  <p className="text-white/90 text-sm md:text-base mt-1">We'd love to hear from you</p>
                </div>

                {/* Form Body */}
                <form className="p-6 md:p-8 space-y-5 md:space-y-6" onSubmit={handleSubmit}>
                  {submitStatus.message && (
                    <div className={`p-4 rounded-lg text-sm font-medium flex items-start gap-3 ${submitStatus.type === 'success'
                        ? 'bg-green-50 text-green-800 border-2 border-green-200'
                        : 'bg-red-50 text-red-800 border-2 border-red-200'
                      }`}>
                      <span className="text-xl">
                        {submitStatus.type === 'success' ? '✓' : '✕'}
                      </span>
                      <span>{submitStatus.message}</span>
                    </div>
                  )}

                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <label
                      className="block text-gray-700 font-semibold text-sm md:text-base"
                      htmlFor="name"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label
                      className="block text-gray-700 font-semibold text-sm md:text-base"
                      htmlFor="email"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <label
                      className="block text-gray-700 font-semibold text-sm md:text-base"
                      htmlFor="message"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed resize-none text-sm md:text-base min-h-[120px]"
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="Tell us what you're thinking..."
                      rows="5"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    className="w-full bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] hover:from-[#d4a02a] hover:to-[#c49723] text-white font-bold py-3 md:py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-base md:text-lg flex items-center justify-center gap-2 cursor-pointer"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>
                </form>

                {/* Form Footer */}
                <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-200">
                  <p className="text-gray-600 text-xs md:text-sm text-center">
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const StyledWrapper = styled.div`
  .gold-form-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .gold-form {
    width: 550px;
    height: 480px;
    padding: 30px;
    background: linear-gradient(135deg, #ffd700, #daa520, #b8860b);
    border-radius: 20px;
    box-shadow:
      10px 10px 20px rgba(139, 90, 43, 0.6),
      -10px -10px 20px rgba(204, 173, 2, 0.126),
      inset 2px 2px 5px rgba(237, 201, 0, 0.5),
      inset -2px -2px 5px rgba(139, 90, 43, 0.5);
    background-image: radial-gradient(
        circle,
        rgba(255, 215, 0, 0.25) 1px,
        transparent 1px
      ),
      radial-gradient(circle, rgba(255, 193, 7, 0.15) 1px, transparent 1px);
    background-size: 20px 20px;
    background-position:
      0 0,
      10px 10px;
  }

  .gold-form-group {
    position: relative;
    margin-bottom: 18px;
  }

  .gold-form-label {
    display: block;
    color: hsl(44, 100%, 67%); /* Light gold color */
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 0.3s cubic-bezier(0.5, 0, 0.1, 1);
  }

  .gold-form-input,
  .gold-form-textarea {
    width: 100%;
    padding: 16px 18px;
    border: none;
    background: linear-gradient(135deg, #daa520, #b8860b);
    border-radius: 12px;
    font-weight: bold;
    box-shadow:
      6px 6px 12px rgba(139, 90, 43, 0.6),
      -6px -6px 12px rgba(255, 215, 0, 0.4),
      inset 2px 2px 4px rgba(139, 90, 43, 0.5),
      inset -2px -2px 4px rgba(255, 215, 0, 0.5);
    font-size: 16px;
    color: hsl(44, 100%, 84%);
    transition:
      box-shadow 0.4s cubic-bezier(0.5, 0, 0.1, 1),
      background 0.4s cubic-bezier(0.5, 0, 0.1, 1),
      border-color 0.4s cubic-bezier(0.5, 0, 0.1, 1);
  }

  .gold-form-textarea {
    height: 110px;
    resize: none;
  }

  .gold-form-input:focus,
  .gold-form-textarea:focus {
    outline: none;
    background: linear-gradient(135deg, #daa520, #b8860b);
    border-color: #ffcc00;
    box-shadow:
      4px 4px 8px rgba(139, 90, 43, 0.7),
      -4px -4px 8px rgba(255, 215, 0, 0.5),
      inset 4px 4px 8px rgba(139, 90, 43, 0.6),
      inset -4px -4px 8px rgba(255, 215, 0, 0.6);
  }

  .gold-form-input:focus + .gold-form-label,
  .gold-form-textarea:focus + .gold-form-label {
    color: #ffcc00;
  }

  .gold-form-button {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #f0cd07, #ffc32d, #f5ba26);
    border: 0px solid rgba(255, 217, 0, 0);
    border-radius: 12px;
    color: #3d2f1a;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.8px;
    margin-top: 14px;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow:
      10px 10px 20px rgba(139, 90, 43, 0.6),
      -10px -10px 20px rgba(255, 215, 0, 0.4),
      inset 2px 2px 5px rgba(255, 215, 0, 0.5),
      inset -2px -2px 5px rgba(139, 90, 43, 0.5);
    transition:
      transform 0.3s cubic-bezier(0.5, 0, 0.1, 1),
      box-shadow 0.3s cubic-bezier(0.5, 0, 0.1, 1),
      background 0.4s cubic-bezier(0.5, 0, 0.1, 1);
  }

  .gold-form-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #f0cd07, #ffc32d, #f5ba26);
    box-shadow:
      10px 10px 20px rgba(139, 90, 43, 0.6),
      -10px -10px 20px rgba(255, 215, 0, 0.4),
      inset 2px 2px 5px rgba(255, 215, 0, 0.5),
      inset -2px -2px 5px rgba(139, 90, 43, 0.5);
    transform: translateY(-2px);
  }

  .gold-form-button:active:not(:disabled) {
    background: linear-gradient(135deg, #f0cd07, #ffc32d, #f5ba26);
    box-shadow:
      10px 10px 20px rgba(139, 90, 43, 0.6),
      -10px -10px 20px rgba(255, 215, 0, 0.4),
      inset 2px 2px 5px rgba(255, 215, 0, 0.5),
      inset -2px -2px 5px rgba(139, 90, 43, 0.5);
    transform: translateY(1px);
  }

  .gold-form-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default ContanctUs;
