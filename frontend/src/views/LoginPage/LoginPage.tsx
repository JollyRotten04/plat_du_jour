// Imports...
import heroImage from '../../assets/heroImage.svg';
import FacebookLoginIcon from '../../assets/facebookLoginIcon.svg';
import GoogleLoginIcon from '../../assets/googleLoginIcon.svg';
import { useState } from 'react';

export default function LoginPage(){

    // Flagger variable to check if login page...
    const [isLogin, setIsLogin] = useState(false);

    // Temporarily hide the content since it's coming soon...
    const [hide, setHide] = useState(true);


    return(
        <>
            {/* min-h-fit */}
            <div className="min-h-screen flex justify-center items-center h-full w-full">

                {!hide ? 
                <>
                    <div className="relative min-h-fit flex items-center justify-center portrait:h-screen landscape:h-fit lg:landscape:h-screen landscape:pt-8 2xl:landscape:pt-0 w-screen">

                    {/* Hero Image */}
                    <img src={heroImage} draggable='false' alt="Hero" className="select-none relative z-4 h-full w-full object-cover landscape:hidden" />

                    {/* Main container */}
                    <div className='portrait:absolute z-5 flex portrait:flex-col portrait:p-4 overflow-hidden bg-white landscape:bg-[#253829] shadow-xl rounded-xl portrait:rounded-2xl h-3/5 landscape:h-fit w-3/5 portrait:h-fit portrait:w-7/8 landscape:w-5/6 lg:landscape:w-5/6'>

                        {/* Left Container for Image */}
                        <div className='portrait:hidden flex w-1/2'>
                            {/* Hero Image */}
                            <img src={heroImage} draggable='false' alt="Hero" className="w-full object-cover" />
                        </div>
                        
                        {/* Right Container for content */}
                        <div className='flex flex-col gap-4 lg:landscape:gap-12 portrait:h-full portrait:w-full landscape:w-1/2 landscape:p-4 portrait:py-8 lg:landscape:p-8 lg:landscape:py-12'>

                            {/* Dynamically Changing Welcome Label */}
                            <p draggable='false' className='portrait:default-text landscape:text-white select-none text-lg lg:landscape:text-3xl font-semibold text-center'>Log into your account!</p>

                            {/* Credential Values */}
                            <div draggable='false' className='flex flex-col w-full h-full justify-center gap-6 lg:landscape:gap-12'>

                                {!isLogin ? 
                                
                                <>
                                    {/* Desired Username Field */}
                                    <div draggable='false' className='flex flex-col gap-2'>

                                        <p draggable='false' className='portrait:default-text select-none landscape:text-white text-sm lg:landscape:text-xl font-semibold'>Desired Username:</p>
                                        
                                        <input type="text" placeholder='Desired username here' className='border border-gray-400 rounded-lg lg:text-xl' />
                                    </div>
                                </> 
                                
                                :
                                
                                <>
                                
                                </>}

                                {/* Email Field */}
                                <div draggable='false' className='flex flex-col gap-2'>

                                    <p draggable='false' className='portrait:default-text select-none landscape:text-white text-sm lg:landscape:text-xl font-semibold'>Email:</p>
                                    
                                    <input type="text" placeholder='Email here' className='border border-gray-400 rounded-lg lg:text-xl' />
                                </div>

                                {/* Password Field */}
                                <div draggable='false' className='flex flex-col gap-2'>

                                    <p draggable='false' className='portrait:default-text select-none landscape:text-white text-sm lg:landscape:text-xl font-semibold'>Password:</p>
                                    
                                    <input type="password" placeholder='Password here' className='border border-gray-400 rounded-lg lg:text-xl' />
                                </div>

                                {!isLogin ? 
                                
                                <>
                                    {/* Confirm Password Field */}
                                    <div draggable='false' className='flex flex-col gap-2'>

                                        <p draggable='false' className='portrait:default-text select-none landscape:text-white text-sm lg:landscape:text-xl font-semibold'>Confirm Password:</p>
                                        
                                        <input type="text" placeholder='Confirm password' className='border border-gray-400 rounded-lg lg:text-xl' />
                                    </div>
                                </> 
                                
                                :
                                
                                <>
                                
                                </>}

                                {/* Alternative Login Options */}
                                <div draggable='false' className='flex flex-col gap-2 lg:landscape:gap-4'>

                                    <p className='portrait:default-text select-none landscape:text-white underline lg:landscape:text-xl font-semibold text-center'>or login with</p>

                                    {/* Icons */}
                                    <div draggable='false' className='flex justify-center gap-4'>

                                        {/* Facebook */}
                                        <img src={FacebookLoginIcon} draggable='false' className='h-6 md:h-10 select-none cursor-pointer' alt="" />

                                        {/* Google */}
                                        <img src={GoogleLoginIcon} draggable='false' className='h-6 md:h-10 select-none cursor-pointer' alt="" />
                                    </div>
                                </div>

                                {/* Switch to Register */}
                                <div draggable='false' className='w-full flex justify-center'>
                                    <button draggable='false' className='select-none cursor-pointer' onClick={() => setIsLogin(!isLogin)}>
                                        <p draggable='false' className='portrait:default-text landscape:text-white lg:landscape:text-xl font-semibold text-center underline select-none cursor-pointer'>{isLogin ? 'No account yet? Create one!' : 'Already have an account? Log in!'}</p>
                                    </button>
                                </div>

                                {/* Captcha */}
                                <div></div>

                                {/* Login/Signup Button */}
                                <button draggable='false' className='select-none cursor-pointer py-3 px-6 lg:py-5 lg:px-10 w-fit rounded-lg mx-auto text-white text-lg lg:text-2xl font-semibold main-background landscape:!bg-white landscape:text-[#253829]'>
                                    {isLogin ? 'Login' : 'Sign-up'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </>
                
                :
                
                <>
                    <div className='flex flex-col'>
                        <p className='text-[3rem] portrait:text-2xl default-text font-bold'>More Coming Soon!</p>
                        <p className='text-[1.6rem] portrait:text-xl default-text font-semibold text-center'>Stay tuned!</p>
                    </div>
                </>}               
            </div>
        </>
    );
}