import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css';
import 'swiper/css/pagination';

const Autoslider = ({images = []}) => {
    return (
        <div className=''>
            <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={true}
                className="w-150 h-150 flex-col flex rounded-xl overflow-hidden"
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