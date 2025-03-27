import { useState } from 'react';
import { login, register } from "../api/authApi";

export function AuthForm({ type }) {
    const isRegister = type === "register";
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isRegister) {
                // Validate password match for registration
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords don't match");
                }

                // Call register API
                await register({
                    name: formData.fullname,
                    email: formData.email,
                    password: formData.password
                });
                
                // Handle successful registration (redirect, show message, etc.)
                console.log("Registration successful");
            } else {
                // Call login API
                const userData = await login({
                    email: formData.email,
                    password: formData.password
                });
                
                localStorage.setItem("user",userData.token)
                window.location = "/dashboard"
                // Handle successful login (store token, redirect, etc.)
                console.log("Login successful", userData);
            }
        } catch (err) {
            setError(err.message || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
                {/* Image Section - Hidden on small screens */}
                <div className="hidden md:block md:w-1/2 bg-primary">
                    <div className="h-full flex items-center justify-center p-8">
                        <div className="text-white text-center">
                            <img className="rounded" src={`./images/register.png`} alt={type} />
                            <p className="mb-6 mt-6">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                        </div>
                    </div>
                </div>
                {/* Form Section */}
                <div className="w-full md:w-1/2 p-6 md:p-8">
                    <h3 className="text-gray-600 mb-6">
                        {isRegister ? "Welcome to the dashboard" : "Login to your account"}
                    </h3>
                    
                    {/* Error message display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Full Name (Only for Register) */}
                        {isRegister && (
                            <div>
                                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full name*
                                </label>
                                <input
                                    type="text"
                                    id="fullname"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address*
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password*
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        {/* Confirm Password (Only for Register) */}
                        {isRegister && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password*
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-1/3 bg-primary text-white py-2 px-4 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-2 ${
                                isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : isRegister ? "Register" : "Login"}
                        </button>
                        {/* Toggle Link */}
                        <div className="text-center text-sm text-gray-600 pt-2">
                            {isRegister ? "Already have an account?" : "Don't have an account?"}
                            <a href={isRegister ? "/login" : "/register"} className="text-blue-600 hover:underline font-medium">
                                {isRegister ? " Login" : " Register"}
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}