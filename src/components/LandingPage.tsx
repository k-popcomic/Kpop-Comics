import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [productId, setProductId] = useState('');
  const navigate = useNavigate();

  const handleStartBuilding = () => {
    if (productId.trim()) {
      navigate(`/${productId.trim()}`);
    } else {
      alert('Please enter your product ID');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartBuilding();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Content */}
        <div className="text-white space-y-8">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Let's create your<br />
            comic book
          </h1>
          
          <div className="space-y-4">
            <label className="block text-lg font-medium">
              Enter your product ID:
            </label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full max-w-sm px-4 py-3 text-black rounded-none border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Product ID"
            />
            <button
              onClick={handleStartBuilding}
              className="block bg-yellow-400 text-black px-8 py-3 font-semibold rounded-none hover:bg-yellow-300 transition-colors"
            >
              Start building
            </button>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            {/* Character illustration */}
            <div className="w-80 h-80 relative">
              {/* Character body */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-20 bg-gray-300 rounded-full"></div>
                <div className="w-20 h-16 bg-gray-300 rounded-lg mt-2"></div>
                <div className="w-24 h-20 bg-red-500 rounded-lg mt-1"></div>
                <div className="flex space-x-2 mt-1">
                  <div className="w-6 h-16 bg-gray-800 rounded-full"></div>
                  <div className="w-6 h-16 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              
              {/* Arms raised up */}
              <div className="absolute top-24 left-8">
                <div className="w-4 h-12 bg-gray-300 rounded-full transform -rotate-45"></div>
              </div>
              <div className="absolute top-24 right-8">
                <div className="w-4 h-12 bg-gray-300 rounded-full transform rotate-45"></div>
              </div>
              
              {/* Hair */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                <div className="w-20 h-12 bg-purple-600 rounded-full"></div>
              </div>
              
              {/* Gift box */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-16 bg-white border-4 border-gray-300 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-2 bg-black"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-full bg-black"></div>
                  </div>
                  {/* Bow */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-4 bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="absolute top-12 right-6 w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="absolute bottom-20 left-2 w-4 h-4 bg-yellow-400 rounded-full"></div>
              <div className="absolute bottom-32 right-4 w-3 h-3 bg-purple-400 rounded-full"></div>
              <div className="absolute top-8 right-12 w-2 h-2 bg-green-400 rounded-full"></div>
              
              {/* Confetti lines */}
              <div className="absolute top-6 left-12 w-8 h-0.5 bg-red-300 transform rotate-12"></div>
              <div className="absolute top-16 right-8 w-6 h-0.5 bg-blue-300 transform -rotate-12"></div>
              <div className="absolute bottom-24 left-6 w-10 h-0.5 bg-yellow-300 transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}