import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CreditCard, Phone, User, Calendar, Eye } from 'lucide-react';
import GovernmentVerification from './GovernmentVerification';

const EnhancedAuthForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        voter_id: '',
        aadhar_number: '',
        phone_number: '',
        full_name: '',
        date_of_birth: '',
    });

    const [showVerification, setShowVerification] = useState(false);
    const [currentVoterData, setCurrentVoterData] = useState(null);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setCurrentVoterData(formData);
        setShowVerification(true);
    };

    const handleVerificationResult = (verificationData) => {
        if (verificationData && verificationData.overall_status?.status === 'VERIFIED') {
            // If verification is successful, proceed with OTP step
            onSubmit(formData);
        }
        // The GovernmentVerification component will handle showing errors
    };

    if (showVerification) {
        return (
            <GovernmentVerification
                voterData={currentVoterData}
                onVerificationComplete={handleVerificationResult}
            />
        );
    }

    return (
        <motion.div
            key="auth-form-enhanced"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
        >
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Enhanced Identity Verification
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Your identity will be cross-referenced with government databases.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label htmlFor="full_name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <User className="w-4 h-4 text-gray-500" />
                            Full Name (as per documents)
                        </label>
                        <input
                            id="full_name"
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                            placeholder="Enter your full name"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                        <label htmlFor="date_of_birth" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            Date of Birth
                        </label>
                        <input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Voter ID */}
                    <div className="space-y-2">
                        <label htmlFor="voter_id" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <CreditCard className="w-4 h-4 text-orange-600" />
                            Voter ID
                        </label>
                        <input
                            id="voter_id"
                            value={formData.voter_id}
                            onChange={(e) => handleInputChange('voter_id', e.target.value.toUpperCase())}
                            placeholder="ABC1234567"
                            maxLength={10}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Aadhaar Number */}
                    <div className="space-y-2">
                        <label htmlFor="aadhar_number" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Shield className="w-4 h-4 text-blue-600" />
                            Aadhaar Number
                        </label>
                        <input
                            id="aadhar_number"
                            value={formData.aadhar_number}
                            onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
                            placeholder="123456789012"
                            maxLength={12}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label htmlFor="phone_number" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Phone className="w-4 h-4 text-green-600" />
                            Mobile Number
                        </label>
                        <input
                            id="phone_number"
                            type="tel"
                            value={formData.phone_number}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            placeholder="9876543210"
                            maxLength={10}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="!mt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                            {isLoading ? 'Processing...' : (
                                <>
                                    <Eye className="w-5 h-5 mr-2" />
                                    Verify with Government APIs
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default EnhancedAuthForm;