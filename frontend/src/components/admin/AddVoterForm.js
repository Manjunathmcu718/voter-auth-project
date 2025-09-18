import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, X } from 'lucide-react';

const AddVoterForm = ({ booths, onSubmit, onCancel }) => {
    // CHANGE 1: Added 'address' to the form's state
    const [formData, setFormData] = useState({
        voter_id: '',
        aadhar_number: '',
        phone_number: '',
        full_name: '',
        date_of_birth: '',
        address: '', // <-- NEW
        constituency: '',
        polling_station: '',
    });

    // CHANGE 2: Updated handleSubmit to calculate age before sending
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Calculate age from date of birth
        const birthDate = new Date(formData.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Send all form data PLUS the calculated age
        onSubmit({ ...formData, age });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
        >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-saffron" />
                        Add New Voter
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID</label>
                            <input
                                type="text"
                                value={formData.voter_id}
                                onChange={(e) => handleInputChange('voter_id', e.target.value)}
                                placeholder="ABC1234567"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                            <input
                                type="text"
                                value={formData.aadhar_number}
                                onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
                                maxLength={12}
                                placeholder="123456789012"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <input
                                type="text"
                                value={formData.phone_number}
                                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                maxLength={10}
                                placeholder="9876543210"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* CHANGE 3: Added the new input field for Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                placeholder="Enter full address"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        {/* END OF NEW FIELD */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
                            <input
                                type="text"
                                value={formData.constituency}
                                onChange={(e) => handleInputChange('constituency', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Polling Station</label>
                            <select
                                value={formData.polling_station}
                                onChange={(e) => handleInputChange('polling_station', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Select Booth</option>
                                {booths.map(booth => (
                                    <option key={booth._id} value={booth.booth_name}>
                                        {booth.booth_name} - {booth.constituency}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-saffron to-green text-white rounded-lg hover:shadow-lg transition-all duration-200"
                        >
                            Add Voter
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default AddVoterForm;
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { UserPlus, X } from 'lucide-react';

// const AddVoterForm = ({ booths, onSubmit, onCancel }) => {
//     const [formData, setFormData] = useState({
//         voter_id: '',
//         aadhar_number: '',
//         phone_number: '',
//         full_name: '',
//         date_of_birth: '',
//         constituency: '',
//         polling_station: '',
//     });

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onSubmit(formData);
//     };

//     const handleInputChange = (field, value) => {
//         setFormData(prev => ({ ...prev, [field]: value }));
//     };

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className="mb-8"
//         >
//             <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
//                 <div className="flex items-center justify-between mb-6">
//                     <h3 className="text-lg font-semibold flex items-center gap-2">
//                         <UserPlus className="w-5 h-5 text-saffron" />
//                         Add New Voter
//                     </h3>
//                     <button
//                         onClick={onCancel}
//                         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                     >
//                         <X className="w-4 h-4" />
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//                             <input
//                                 type="text"
//                                 value={formData.full_name}
//                                 onChange={(e) => handleInputChange('full_name', e.target.value)}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID</label>
//                             <input
//                                 type="text"
//                                 value={formData.voter_id}
//                                 onChange={(e) => handleInputChange('voter_id', e.target.value)}
//                                 placeholder="ABC1234567"
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
//                             <input
//                                 type="text"
//                                 value={formData.aadhar_number}
//                                 onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
//                                 maxLength={12}
//                                 placeholder="123456789012"
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
//                             <input
//                                 type="text"
//                                 value={formData.phone_number}
//                                 onChange={(e) => handleInputChange('phone_number', e.target.value)}
//                                 maxLength={10}
//                                 placeholder="9876543210"
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
//                             <input
//                                 type="date"
//                                 value={formData.date_of_birth}
//                                 onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
//                             <input
//                                 type="text"
//                                 value={formData.constituency}
//                                 onChange={(e) => handleInputChange('constituency', e.target.value)}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 required
//                             />
//                         </div>

//                         <div className="md:col-span-2 lg:col-span-1">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Polling Station</label>
//                             <select
//                                 value={formData.polling_station}
//                                 onChange={(e) => handleInputChange('polling_station', e.target.value)}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 required
//                             >
//                                 <option value="">Select Booth</option>
//                                 {booths.map(booth => (
//                                     <option key={booth._id} value={booth.booth_name}>
//                                         {booth.booth_name} - {booth.constituency}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>

//                     <div className="flex justify-end gap-3 pt-4">
//                         <button
//                             type="button"
//                             onClick={onCancel}
//                             className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             className="px-4 py-2 bg-gradient-to-r from-saffron to-green text-white rounded-lg hover:shadow-lg transition-all duration-200"
//                         >
//                             Add Voter
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </motion.div>
//     );
// };

// export default AddVoterForm;