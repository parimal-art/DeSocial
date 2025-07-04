import React from 'react';
import { Users, Shield, Globe, Zap } from 'lucide-react';

const Login = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Hero content */}
        <div className="lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-lg">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h1 className="ml-3 text-3xl font-bold text-gray-900">
                  Parimal Social
                </h1>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Connect on the 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {" "}Decentralized{" "}
                </span>
                Web
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience true ownership of your data and connections. Built on the Internet Computer for maximum privacy and security.
              </p>

              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="flex items-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">Secure Internet Identity Authentication</span>
                </div>
                <div className="flex items-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                  <Globe className="h-6 w-6 text-purple-600 mr-3" />
                  <span className="text-gray-700">Decentralized Data Ownership</span>
                </div>
                <div className="flex items-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                  <Zap className="h-6 w-6 text-indigo-600 mr-3" />
                  <span className="text-gray-700">Lightning Fast Performance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white/30 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-lg border border-white/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Parimal Social
                </h3>
                <p className="text-gray-600">
                  Choose your preferred login method
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={onLogin}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center group"
                >
                  <Shield className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Login with Internet Identity
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <button
                  onClick={onLogin}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center group"
                >
                  <Users className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Login with Another Internet Identity
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;