import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

const Signup = () => {
    const { handleSubmit, register, formState: { errors } } = useForm();
    
        const onSubmit = async (data) => {
        try {
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
    
            const res = await response.json();
    
            if (res.success) {
                // Redirect to the home page
                window.location.href = res.redirectUrl;
            } else {
                alert("Signup failed");
            }
        } catch (error) {
            console.error("Error during signup", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url(/base1.jpg)] bg-cover bg-center">
            <div className="bg-white/50 backdrop-blur-lg outline outline-2 outline-white rounded-2xl p-10 w-full max-w-md shadow-xl">
                <div className="flex mb-6">
                    <img src="/logo.png" alt="logo" className='w-15 h-10' />
                    <h1 className="text-2xl font-bold text-black">Systelle</h1>
                </div>

                <h1 className="text-center text-2xl font-bold text-black mb-6">
                    Sign Up
                </h1>

                <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="text"
                        placeholder="Username"
                        {...register("name", { required: true })}
                        className="px-4 py-3 rounded-full border border-gray-400 focus:outline-none"
                    />
                    {errors.name && <p className="text-red-500 text-sm">Username is required</p>}

                    <input
                        type="email"
                        placeholder="Email"
                        {...register("email", { required: true })}
                        className="px-4 py-3 rounded-full border border-gray-400 focus:outline-none"
                    />
                    {errors.email && <p className="text-red-500 text-sm">Email is required</p>}

                    <input
                        type="password"
                        placeholder="Password"
                        {...register("password", { required: true })}
                        className="px-4 py-3 rounded-full border border-gray-400 focus:outline-none"
                    />
                    {errors.password && <p className="text-red-500 text-sm">Password is required</p>}

                    <input 
                        type="submit"
                        value="Sign up"
                        className="bg-violet-600 flex justify-center transition delay-100 duration-150 ease-in-out hover:-translate-y-1 hover:scale-105 hover:bg-violet-700 text-white font-bold py-3 rounded-3xl"
                    />
                </form>

                <div className="text-center mt-4 text-sm">
                    <p className="mt-2 text-black">
                        Have an account?{" "}
                        <Link to='/login' className="text-purple-600 font-medium hover:underline">
                            login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;