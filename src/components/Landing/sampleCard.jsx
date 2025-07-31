import { Link } from 'react-router-dom';
import sampleP1 from '../../images/sample1.png';
import sampleP2 from '../../images/sample2.png';
import sampleP3 from '../../images/sample3.png';

const SampleCard = () => {
    return (
        <div className="p-8 bg-white-100">
            <h1 className="text-2xl font-regular mb-5 text-center mt-2">Sample Products</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="">
                    <img src={sampleP1} alt="Product 1" className="mb-0 w-[524px] h-[579px] border-1" />
                    <div className='bg-[#FFD41C] py-6.5 text-4xl h-[100px] w-[524px] md:text-4xl text-center font-extralight'><h1>Colorful</h1></div>
                </div>
                <div className="">
                    <img src={sampleP3} alt="Product 2" className="mb-0 w-[524px] h-[579px]" />
                    <div className='bg-[#35408E] text-white text-4xl py-6.5 h-[100px] w-[524px] text-center font-extralight'><h1>Formal</h1></div>
                </div>
                <div className="">
                    <img src={sampleP2} alt="Product 3" className="mb-0 w-[524px] h-[579px] border-1" />
                    <div className='bg-[#FFD41C] py-6.5 text-4xl h-[100px] w-[524px] text-center font-extralight'><h1>Stylish</h1></div>
                </div>
            </div>
            <div className='flex justify-center mt-3'>
                <Link to='/products' className="text-2xl font-regular mt-8 text-center cursor-pointer underline">View More</Link>
            </div>
        </div>
    )
}

export default SampleCard