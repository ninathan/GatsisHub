import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css';
import 'swiper/css/pagination';

const Autoslider = ({images = []}) => {
    return (
        <div className='w-full max-w-full overflow-hidden'>
            <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={true}
                className="w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
                {images.map((img, index) =>
                    <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                    </SwiperSlide>
                )}
            </Swiper>
        </div>
    )
}

export default Autoslider