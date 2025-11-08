import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import banner from '../../images/contanctusbanner.png'
import useScrollAnimation from '../../hooks/useScrollAnimation';

const ContanctUs = () => {
  const bannerAnim = useScrollAnimation({ threshold: 0.2 });
  const leftAnim = useScrollAnimation({ threshold: 0.2 });
  const phoneAnim = useScrollAnimation({ threshold: 0.2 });
  const emailAnim = useScrollAnimation({ threshold: 0.2 });
  const addressAnim = useScrollAnimation({ threshold: 0.2 });
  const formAnim = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <div>
      <img 
        ref={bannerAnim.ref}
        src={banner} 
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
                <span className='text-base md:text-lg lg:text-xl ml-2 break-words'>+91 1234567890</span>
              </div>
              <div 
                ref={emailAnim.ref}
                className={`mb-4 flex items-center ${
                  emailAnim.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                }`}
              >
                <FaEnvelope className='inline text-xl md:text-2xl text-black flex-shrink-0' />
                <span className='text-base md:text-lg lg:text-xl ml-2 break-words'>GtGatsisCorporation@gmail.com</span>
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
            <div className="flex flex-col justify-between border p-4 md:p-6 rounded-2xl shadow-lg h-full bg-white hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Send us a Message</h3>
              <input type="text" className="border border-gray-300 rounded-lg p-3 md:p-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder='Company Name' />
              <input type="email" className="border border-gray-300 rounded-lg p-3 md:p-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4 transition-all" placeholder="Company Email" />
              <textarea
                className="border border-gray-300 rounded-lg p-3 md:p-4 text-sm md:text-base resize-none min-h-[120px] md:min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4 transition-all"
                placeholder="Write your message here..."
              />
              <button className="mt-4 self-end bg-blue-600 text-white py-2 px-4 md:px-6 rounded-full hover:bg-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-300 text-sm md:text-base">
                Send
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContanctUs;
