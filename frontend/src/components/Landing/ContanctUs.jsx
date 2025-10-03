import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import banner from '../../images/contanctusbanner.png'

const ContanctUs = () => {
  return (
    <div>
      <img src={banner} alt="Contact Us" />
      <section className="px-4 md:px-20 py-20">
        {/* right section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <div className='flex flex-col justify-center items-start lg:items-start text-left'>
            <div className='mb-8 -mt-12'>
              <p className='text-3xl font-extralight w-[535px] leading-10 text-justify'>Got ideas for us? Questions about anything at all? Need a little help, or just want to send a friendly wave? We're all ears! Feel free to reach out.</p>
            </div>

            <div className='flex flex-col justify-start items-start text-left'>
              <div className='mb-4'>
                <FaPhoneAlt className='inline text-2xl text-black' />
                <span className='text-xl ml-2'>+91 1234567890</span>
              </div>
              <div className='mb-4'>
                <FaEnvelope className='inline text-2xl text-black' />
                <span className='text-xl  ml-2'>GtGatsisCorporation@gmail.com</span>
              </div>
              <div className='mb-4'>
                <FaMapMarkerAlt className='inline text-2xl text-black' />
                <span className='text-xl ml-2'>SIERRA MADRE BLDG. VICTORIA WAVE-SEZ, BRGY. 186 TALA, NORTH CALOOCAN</span>
              </div>
            </div>
          </div>

          {/* left section */}
          <div className='lg:block -mt-10'>
            <div className="flex flex-col justify-between border p-6 rounded-2xl shadow-lg h-full bg-white">
              <h3 className="text-xl font-semibold mb-4">Send us a Message</h3>
              <input type="text" className="border border-gray-300 rounded-lg p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder='Company Name' />
              <input type="email" className="border border-gray-300 rounded-lg p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4" placeholder="Company Email" />
              <textarea
                className="border border-gray-300 rounded-lg p-4 text-base resize-none min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
                placeholder="Write your message here..."
              />
              <button className="mt-4 self-end bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition">
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
