import heroImg from "../../assets/event.jpg";

const HeroSection = () => {
  return (
    <div className="h-screen">
        <div className="container mx-auto px-20 h-full flex flex-col lg:flex-row gap-8 items-center justify-center">
            <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl text-gray-800 mb-5 font-bold">
                    Eventix Event Management System
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                    Discover, Create, and Manage Events with Ease – 
                    Whether you're planning an event or looking to 
                    attend one, our platform helps you find, organize, and enjoy every moment.
                </p>
                {/* <button className="rounded-[30px] bg-indigo-600 border-2 border-transparent text-white text-[16px] py-3 px-15 mt-5 mr-2 hover:bg-indigo-700">Buy Tickets</button> */}
                <button className="rounded-[30px] border-2 border-indigo-600 text-indigo-600 text-[16px] py-3 px-15 mt-5 hover:bg-indigo-600 hover:text-white">Browse Events</button>
            </div>
            <div className="flex-1 flex justify-end">
                <img 
                    src={heroImg} 
                    alt="Eventix Image" 
                    className="w-full max-w-md lg:max-w-lg h-auto rounded-lg shadow-lg" 
                />
            </div>
        </div>
      </div>
  );
}

export default HeroSection;