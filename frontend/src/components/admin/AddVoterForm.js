import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, X, MapPin, Sparkles, CheckCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';
import axios from 'axios';

const AddVoterForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        voter_id: '',
        aadhar_number: '',
        phone_number: '',
        full_name: '',
        date_of_birth: '',
        address: '',
        constituency: '',
        polling_station: '',
    });
    
    // New state for handling image data
    const [imageData, setImageData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // NEW: State for Smart Booth Allocation
    const [isAllocating, setIsAllocating] = useState(false);
    const [allocationResult, setAllocationResult] = useState(null);
    const [allocationError, setAllocationError] = useState('');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear allocation result when address changes
        if (field === 'address') {
            setAllocationResult(null);
            setAllocationError('');
        }
    };

    // Handle image data from ImageUpload component
    const handleImageChange = (base64Data) => {
        setImageData(base64Data);
    };

    // NEW: Smart Booth Allocation Function
    const handleSmartAllocate = async () => {
        if (!formData.address.trim()) {
            setAllocationError('Please enter an address first');
            return;
        }

        setIsAllocating(true);
        setAllocationError('');
        setAllocationResult(null);

        try {
            const response = await axios.post('http://localhost:5000/api/booth-allocation/auto-allocate', {
                address: formData.address
            });

            if (response.data.success && response.data.booth) {
                setAllocationResult(response.data.booth);
                // Auto-fill the polling station field
                setFormData(prev => ({
                    ...prev,
                    polling_station: response.data.booth.booth_name
                }));
            } else {
                setAllocationError(response.data.message || 'No matching booth found for this address');
            }
        } catch (error) {
            setAllocationError(error.response?.data?.error || 'Failed to allocate booth. Please try again.');
        }

        setIsAllocating(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Calculate age
            const birthDate = new Date(formData.date_of_birth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // Create the submission data
            const submissionData = {
                ...formData,
                age,
                image: imageData // Include image data if available
            };
            
            // Call the parent's onSubmit function
            await onSubmit(submissionData);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="mb-8 overflow-hidden"
        >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        Add New Voter
                    </h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                                Full Name *
                            </label>
                            <input
                                id="full_name"
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="voter_id" className="block text-sm font-medium text-gray-700">
                                Voter ID *
                            </label>
                            <input
                                id="voter_id"
                                type="text"
                                value={formData.voter_id}
                                onChange={(e) => handleInputChange('voter_id', e.target.value.toUpperCase())}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ABC1234567"
                                maxLength={10}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="aadhar_number" className="block text-sm font-medium text-gray-700">
                                Aadhar Number *
                            </label>
                            <input
                                id="aadhar_number"
                                type="text"
                                value={formData.aadhar_number}
                                onChange={(e) => handleInputChange('aadhar_number', e.target.value.replace(/\D/g, ''))}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="123456789012"
                                maxLength={12}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                Mobile Number *
                            </label>
                            <input
                                id="phone_number"
                                type="text"
                                value={formData.phone_number}
                                onChange={(e) => handleInputChange('phone_number', e.target.value.replace(/\D/g, ''))}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="9876543210"
                                maxLength={10}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                                Date of Birth *
                            </label>
                            <input
                                id="date_of_birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="constituency" className="block text-sm font-medium text-gray-700">
                                Constituency *
                            </label>
                            <input
                                id="constituency"
                                type="text"
                                value={formData.constituency}
                                onChange={(e) => handleInputChange('constituency', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter constituency name"
                            />
                        </div>
                    </div>

                    {/* Address Section with Smart Allocation */}
                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Address & Booth Allocation
                        </h4>
                        
                        <div className="space-y-4">
                            {/* Address Input */}
                            <div className="space-y-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Full Address *
                                </label>
                                <textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    required
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="E.g., 610/1119, Keshav Nagar, Delhi - 110051"
                                />
                                <p className="text-xs text-gray-500">
                                    💡 Enter complete address including locality name for smart booth allocation
                                </p>
                            </div>

                            {/* Smart Allocate Button */}
                            <button
                                type="button"
                                onClick={handleSmartAllocate}
                                disabled={isAllocating || !formData.address.trim()}
                                className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                            >
                                {isAllocating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Analyzing Address...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Smart Allocate Booth
                                    </>
                                )}
                            </button>

                            {/* Allocation Result */}
                            {allocationResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-green-800 mb-1">
                                                Booth Allocated Successfully!
                                            </h5>
                                            <p className="text-sm text-green-700">
                                                <strong>Booth:</strong> {allocationResult.booth_name}
                                            </p>
                                            <p className="text-sm text-green-700">
                                                <strong>Matched Locality:</strong> {allocationResult.matched_locality}
                                            </p>
                                            <p className="text-xs text-green-600 mt-2">
                                                ✓ Polling station field has been auto-filled
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Allocation Error */}
                            {allocationError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                                >
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ {allocationError}
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Please enter the polling station manually or create a locality mapping first.
                                    </p>
                                </motion.div>
                            )}

                            {/* Polling Station Input */}
                            <div className="space-y-2">
                                <label htmlFor="polling_station" className="block text-sm font-medium text-gray-700">
                                    Polling Station *
                                </label>
                                <input
                                    id="polling_station"
                                    type="text"
                                    value={formData.polling_station}
                                    onChange={(e) => handleInputChange('polling_station', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Will be auto-filled or enter manually"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="border-t border-gray-200 pt-6">
                        <ImageUpload 
                            onImageChange={handleImageChange}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Adding Voter...' : 'Add Voter'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default AddVoterForm;