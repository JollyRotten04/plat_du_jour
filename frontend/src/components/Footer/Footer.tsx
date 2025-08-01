// Imports...
import Logo from '../../assets/platDuJourLogo.svg';
import FacebookIcon from '../../assets/facebookIcon.svg';
import XIcon from '../../assets/xIcon.svg';
import InstagramIcon from '../../assets/instagramIcon.svg';
import TiktokIcon from '../../assets/tiktokIcon.svg';
import YoutubeIcon from '../../assets/youtubeIcon.svg';

export default function Footer() {
    return(
        <>
            <div className="p-2 sm:p-4 md:p-8">

                {/* Divider Line */}
                <hr />

                {/* Main Content Container */}
                <div className='flex portrait:flex-col-reverse sm:flex-col-reverse gap-12 sm:gap-16 p-4 py-8 md:landscape:p-12'>

                    {/* Left Container */}
                    <div className="flex justify-between">

                        {/* Plat DU Jour Logo */}
                        <img src={Logo} className='h-36 sm:h-46 select-none' draggable='false' alt="" />

                        {/* More Info Links Container */}
                        <div className='flex flex-col'>

                            <p className='default-text text-lg sm:text-xl underline font-semibold sm:mb-2 select-none'>More Info:</p>

                            <p className='default-text text-base sm:text-lg italic cursor-pointer select-none'>About Us</p>
                            <p className='default-text text-base sm:text-lg italic cursor-pointer select-none'>Privacy Policy</p>
                            <p className='default-text text-base sm:text-lg italic cursor-pointer select-none'>User Terms and Agreement</p>
                            <p className='default-text text-base sm:text-lg italic cursor-pointer select-none'>FAQs</p>
                        </div>
                    </div>

                    {/* Right Container */}
                    <div className='flex flex-col gap-6 sm:gap-10'>

                        {/* Weekly Newsletter Email Input Field */}
                        <div className='flex flex-col gap-4'>
                            <p className='default-text text-lg sm:text-xl underline font-semibold select-none'>Sign-up for our weekly newsletter:</p>

                            {/* Input Field and Email */}
                            <div className='flex gap-4'>
                                <input 
                                    type="email" 
                                    placeholder='Enter your email address' 
                                    className='default-text text-base sm:text-lg cursor-pointer select-none italic p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
                                />

                                <button className='cursor-pointer select-none main-background text-sm sm:text-base font-semibold text-white px-4 py-2 rounded-md'>Subscribe</button>
                            </div>
                        </div>

                        {/* More Options to Follow */}
                        <div className='flex flex-col gap-2'>

                            <p className='default-text text-lg sm:text-xl underline font-semibold select-none'>Follow us:</p>

                            {/* Icons Container */}
                            <div className="flex gap-4">

                                {/* Facebook Icon */}
                                <img src={FacebookIcon} alt="" className='h-6 sm:h-8' />

                                {/* X Icon */}
                                <img src={XIcon} alt="" className='h-6 sm:h-8' />

                                {/* Instagram Icon */}
                                <img src={InstagramIcon} alt="" className='h-6 sm:h-8' />

                                {/* Tiktok Icon */}
                                <img src={TiktokIcon} alt="" className='h-6 sm:h-8' />

                                {/* Youtube Icon */}
                                <img src={YoutubeIcon} alt="" className='h-6 sm:h-8' />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright Label */}
                <p className='default-text text-lg sm:text-xl text-center font-semibold select-none'>Copyright © Vince Justine C. Bas 2025</p>
            </div>
        </>
    );
}