import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CreditCard, Phone, ArrowRight } from 'lucide-react';

const AuthForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        voter_id: '',
        aadhar_number: '',
        phone_number: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-md mx-auto"
        >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Authenticate Identity</h2>
                    <p className="text-gray-600 mt-2">Enter your voter credentials</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium text-gray-700">
                            <CreditCard className="w-4 h-4 text-saffron" />
                            Voter ID
                        </label>
                        <input
                            type="text"
                            value={formData.voter_id}
                            onChange={(e) => handleInputChange('voter_id', e.target.value)}
                            placeholder="ABC1234567"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium text-gray-700">
                            <Shield className="w-4 h-4 text-navy" />
                            Aadhaar Number
                        </label>
                        <input
                            type="text"
                            value={formData.aadhar_number}
                            onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
                            placeholder="123456789012"
                            maxLength={12}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium text-gray-700">
                            <Phone className="w-4 h-4 text-green" />
                            Mobile Number
                        </label>
                        <input
                            type="text"
                            value={formData.phone_number}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            placeholder="9876543210"
                            maxLength={10}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-saffron to-green text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <ArrowRight className="w-4 h-4" />
                                Proceed
                            </>
                        )}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default AuthForm;