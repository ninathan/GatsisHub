import about from '../../about.json'
import Autoslider from './Autoslider'
import img1 from '../../images/img1.png'
import img2 from '../../images/img2.png'
import img3 from '../../images/img3.png'

const AboutUs = () => {

    return (
        <section className='py-20 px-4 md:px-20'>
            <h2 className="text-3xl font-medium text-center mb-10 -mt-10">About Us</h2>
            <div className='flex-col items-start grid grid-cols-1 md:grid-cols-2 gap-10'>
                <Autoslider
                    images={[img1, img2, img3]}
                />
                <div className='flex flex-col justify-center items-start'>
                    {(Array.isArray(about) ? about : []).map(({ id, title, subtitle }) => (
                        <div key={id}>
                            <h1 className='text-6xl font-bold mb-4 text-[#353f94]'>{title}</h1>
                            <p className='text-gray-700 text-2xl mb-15'>
                                {subtitle}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <hr className='border-t border-gray-300 my-10'/>
        </section>
    )
}

export default AboutUs