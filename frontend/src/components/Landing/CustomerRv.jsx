import ReviewCard from "./Reviewcard"
import ava from "../../images/avatar.jpg"

const CustomerRv = () => {
    const reviewMessage = `KaiB was amazing with our cats!! 🙌🙌🙌 This was our first time using a pet-sitting service, 
    so we were naturally quite anxious. We took a chance on Kai and completely lucked out! 
    We booked Kai to come twice a day for three days...`;

    return (
        // Customer Reviews Section
        <>
            <section className="px-4 md:px-20 py-20">
                <h2 className="text-4xl font-bold mb-12 -mt-37">Customer Reviews</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* LEFT COLUMN: 2 Tall Review Cards */}
                    <div className="flex flex-col gap-8">
                        <ReviewCard
                            avatar={ava}
                            name="KaiB"
                            date="22 Jul"
                            message={reviewMessage}
                            
                        />
                        <ReviewCard
                            avatar={ava}
                            name="KaiB"
                            date="22 Jul"
                            message={reviewMessage}
                            
                        />
                        <div className="hidden md:block">
                            <div className="flex justify-center items-center space-x-4 mt-6">
                                <a href="" className="text-blue-600 hover:underline">Previous</a>
                                <a href="">1</a>
                                <a href="">2</a>
                                <a href="">3</a>
                                <a href="">4</a>
                                <a href="">5</a>
                                <a href="" className="text-blue-600 hover:underline">Next</a>
                            </div>
                        </div>
                    </div>
                    
                    {/* RIGHT COLUMN: 1 Short Card + Textarea */}
                    <div className="flex flex-col gap-8">
                        <ReviewCard
                            avatar={ava}
                            name="KaiB"
                            date="22 Jul"
                            message={reviewMessage}
                        />
                    <div className="block md:hidden">
                            <div className="flex justify-center items-center space-x-4 mt-6">
                                <a href="" className="text-blue-600 hover:underline">Previous</a>
                                <a href="">1</a>
                                <a href="">2</a>
                                <a href="">3</a>
                                <a href="">4</a>
                                <a href="">5</a>
                                <a href="" className="text-blue-600 hover:underline">Next</a>
                            </div>
                    </div>
                        <div className="flex flex-col justify-between border p-6 rounded-2xl shadow-lg h-full bg-white">
                            <h3 className="text-xl font-semibold mb-4">Send a Review</h3>
                            <textarea
                                className="border border-gray-300 rounded-lg p-4 text-base resize-none min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Write your review here..."
                            />
                            <button className="mt-4 self-end bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default CustomerRv