import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useState } from 'react';
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
                <span className='text-base md:text-lg lg:text-xl ml-2 break-words'>Gatsishub@gmail.com</span>
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
            className={`lg:block -mt-10 ${
              formAnim.isVisible ? 'scroll-slide-left' : 'scroll-hidden'
            }`}
          >
            <form onSubmit={handleSubmit} className="flex flex-col justify-between border p-4 md:p-6 rounded-2xl shadow-lg h-full bg-white hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Send us a Message</h3>
              
              {submitStatus.message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg p-3 md:p-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" 
                placeholder='Customer Name'
                disabled={isSubmitting}
                required
              />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg p-3 md:p-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4 transition-all" 
                placeholder="Customer Email"
                disabled={isSubmitting}
                required
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg p-3 md:p-4 text-sm md:text-base resize-none min-h-[120px] md:min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4 transition-all"
                placeholder="Write your message here..."
                disabled={isSubmitting}
                required
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="mt-4 self-end bg-[#e6af2e] text-white py-2 px-4 md:px-6 rounded-full hover:bg-[#c5941f] hover:scale-105 hover:shadow-lg transition-all duration-300 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContanctUs;
