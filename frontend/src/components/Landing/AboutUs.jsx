import about from '../../about.json'
import Autoslider from './Autoslider'
import img1 from '../../images/img1.png'
import img2 from '../../images/img2.png'
import img3 from '../../images/img3.png'
import useScrollAnimation from '../../hooks/useScrollAnimation'

const AboutUs = () => {
    // Scroll animation hooks for each section
    const heading = useScrollAnimation({ threshold: 0.3 });
    const slider = useScrollAnimation({ threshold: 0.2 });
    const content = useScrollAnimation({ threshold: 0.2 });

    return (
        <section className='py-12 md:py-16 lg:py-20 px-4 md:px-8 lg:px-20'>
            <h2 
                ref={heading.ref}
                className={`text-2xl md:text-3xl lg:text-4xl font-medium text-center mb-8 md:mb-10 -mt-6 md:-mt-10 ${
                    heading.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
                }`}
            >
                About Us
            </h2>
            <div className='flex-col items-start grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10'>
                <div 
                    ref={slider.ref}
                    className={slider.isVisible ? 'scroll-slide-right' : 'scroll-hidden'}
                >
                    <Autoslider
                        images={[img1, img2, img3]}
                    />
                </div>
                <div 
                    ref={content.ref}
                    className={`flex flex-col justify-center items-start ${
                        content.isVisible ? 'scroll-slide-left' : 'scroll-hidden'
                    }`}
                >
                    {(Array.isArray(about) ? about : []).map(({ id, title, subtitle }) => (
                        <div key={id} className='w-full' style={{ animationDelay: `${id * 200}ms` }}>
                            <h1 className='text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 text-[#e6af2e] break-words'>{title}</h1>
                            <p className='text-[#191716] text-base md:text-lg lg:text-xl xl:text-2xl mb-6 md:mb-10 lg:mb-15 leading-relaxed'>
                                {subtitle}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <hr className='border-t border-gray-300 my-8 md:my-10 animate-fadeIn' style={{ animationDelay: '400ms' }}/>
        </section>
    )
}

export default AboutUs