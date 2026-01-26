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
            className={`flex flex-col justify-center items-start lg:items-start text-left ${
              leftAnim.isVisible ? 'scroll-slide-right' : 'scroll-hidden'
            }`}
          >
            <div className='mb-8 -mt-12'>
              <p className='text-lg md:text-xl lg:text-2xl xl:text-3xl font-extralight max-w-full lg:max-w-[535px] leading-relaxed text-justify'>Got ideas for us? Questions about anything at all? Need a little help, or just want to send a friendly wave? We're all ears! Feel free to reach out.</p>
            </div>

            <div className='flex flex-col justify-start items-start text-left w-full'>
              <div 
                ref={phoneAnim.ref}
                className={`mb-4 flex items-center ${
                  phoneAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                }`}
              >
                <FaPhoneAlt className='inline text-xl md:text-2xl text-black flex-shrink-0' />
                <span className='text-base md:text-lg lg:text-xl ml-2 break-words'>+63 976 026 4719</span>
              </div>
              <div 
                ref={emailAnim.ref}
                className={`mb-4 flex items-center ${
                  emailAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                }`}
              >
                <FaEnvelope className='inline text-xl md:text-2xl text-black flex-shrink-0' />
                <span className='text-base md:text-lg lg:text-xl ml-2 break-words'>gatsishub@gmail.com</span>
              </div>
              <div 
                ref={addressAnim.ref}
                className={`mb-4 flex items-start ${
                  addressAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
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
            className={`lg:block -mt-10 flex justify-center ${
              formAnim.isVisible ? 'scroll-slide-left' : 'scroll-hidden'
            }`}
          >
            <StyledWrapper>
              <div className="gold-form-container">
                <form className="gold-form" onSubmit={handleSubmit}>
                  {submitStatus.message && (
                    <div className={`mb-3 p-2 rounded-lg text-xs ${
                      submitStatus.type === 'success' 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                      {submitStatus.message}
                    </div>
                  )}

                  <div className="gold-form-group">
                    <label className="gold-form-label" htmlFor="name">Full Name</label>
                    <input 
                      className="gold-form-input" 
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required 
                    />
                  </div>
                  <div className="gold-form-group">
                    <label className="gold-form-label" htmlFor="email">Email</label>
                    <input 
                      className="gold-form-input" 
                      type="email" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required 
                    />
                  </div>
                  <div className="gold-form-group">
                    <label className="gold-form-label" htmlFor="message">Message</label>
                    <textarea 
                      className="gold-form-textarea" 
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required 
                    />
                  </div>
                  <button 
                    className="gold-form-button" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </form>
              </div>
            </StyledWrapper>
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
