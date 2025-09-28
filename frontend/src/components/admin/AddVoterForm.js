import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, X } from 'lucide-react';
import ImageUpload from './ImageUpload';

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

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle image data from ImageUpload component
    const handleImageChange = (base64Data) => {
        setImageData(base64Data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Create the submission data
            const submissionData = {
                ...formData,
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

                    {/* Address and Polling Station */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                placeholder="Enter complete residential address"
                            />
                        </div>

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
                                placeholder="Enter polling station name"
                            />
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
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { UserPlus, X } from 'lucide-react';
// import ImageUpload from '../voter/ImageUpload';

// export default function AddVoterForm({ onSubmit, onCancel }) {
//   const [formData, setFormData] = useState({
//     voter_id: '',
//     aadhar_number: '',
//     phone_number: '',
//     full_name: '',
//     date_of_birth: '',
//     address: '',
//     constituency: '',
//     polling_station: '',
//     image: null // Add image field
//   });

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       // Calculate age
//       const birthDate = new Date(formData.date_of_birth);
//       const today = new Date();
//       let age = today.getFullYear() - birthDate.getFullYear();
//       const m = today.getMonth() - birthDate.getMonth();
//       if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//         age--;
//       }

//       const voterData = { ...formData, age };
//       await onSubmit(voterData);
//     } catch (error) {
//       console.error('Error submitting voter:', error);
//     }
    
//     setIsSubmitting(false);
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleImageUpload = (imageData) => {
//     setFormData(prev => ({ ...prev, image: imageData }));
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20, height: 0 }}
//       className="mb-8 overflow-hidden"
//     >
//       <div className="shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-xl">
//         <div className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
//           <div className="flex items-center gap-2">
//             <UserPlus className="w-5 h-5 text-orange-600" />
//             <h3 className="text-xl font-semibold">Add New Voter</h3>
//           </div>
//           <button 
//             onClick={onCancel}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>
        
//         <div className="p-6">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Basic Information */}
//             <div>
//               <h4 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h4>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 <div className="space-y-1">
//                   <label className="block text-sm font-medium text-gray-700">Full Name *</label>
//                   <input
//                     type="text"
//                     value={formData.full_name}
//                     onChange={(e) => handleInputChange('full_name', e.target.value)}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                   />
//                 </div>
                
//                 <div className="space-y-1">
//                   <label className="block text-sm font-medium text-gray-700">Voter ID *</label>
//                   <input
//                     type="text"
//                     value={formData.voter_id}
//                     onChange={(e) => handleInputChange('voter_id', e.target.value)}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                   />
//                 </div>
                
//                 <div className="space-y-1">
//                   <label className="block text-sm font-medium text-gray-700">Aadhaar Number *</label>
//                   <input
//                     type="text"
//                     value={formData.aadhar_number}
//                     onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
//                     maxLength={12}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                   />
//                 </div>
                
//                 <div className="space-y-1">
//                   <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
//                   <input
//                     type="tel"
//                     value={formData.phone_number}
//                     onChange={(e) => handleInputChange('phone_number', e.target.value)}
//                     maxLength={10}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                   />
//                 </div>
                
//                 <div className="space-y-1">
//                   <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
//                   <input
//                     type="date"
//                     value={formData.date_of_birth}
//                     onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                   />
//                 </div>
                
//                 <div className="space-y-1 md:col-span-2 lg:col-span-1">
//                   <label className="block text-sm font-medium text-gray-700">Full Address *</label>
//                   <input
//                     type="text"
//                     value={formData.address}
//                     onChange={(e) => handleInputChange('address', e.target.value)}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Electoral Information */}
//             <div>
//               <h4 className="text-lg font-medium text-gray-800 mb-4">Electoral Information</h4>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="block text-sm font-medium text-gray-700">Constituency *</label>
//                   <input
//                     type="text"
//                     value={formData.constituency}
//                     onChange={(e) => handleInputChange('constituency', e.target.value)}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                   />
//                 </div>
                
//                 <div className="space-y-1">
//                   <label className="block text-sm font-medium text-gray-700">Polling Station *</label>
//                   <input
//                     type="text"
//                     value={formData.polling_station}
//                     onChange={(e) => handleInputChange('polling_station', e.target.value)}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Photo Upload Section */}
//             <div>
//               <h4 className="text-lg font-medium text-gray-800 mb-4">Voter Photo</h4>
//               <ImageUpload 
//                 onImageUpload={handleImageUpload}
//                 existingImage={formData.image}
//               />
//             </div>

//             {/* Submit Buttons */}
//             <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={onCancel}
//                 className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="px-6 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-md hover:from-orange-600 hover:to-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isSubmitting ? 'Adding Voter...' : 'Add Voter'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
// // import React, { useState } from 'react';
// // import { motion } from 'framer-motion';
// // import { UserPlus, X } from 'lucide-react';

// // const AddVoterForm = ({ booths, onSubmit, onCancel }) => {
// //     // CHANGE 1: Added 'address' to the form's state
// //     const [formData, setFormData] = useState({
// //         voter_id: '',
// //         aadhar_number: '',
// //         phone_number: '',
// //         full_name: '',
// //         date_of_birth: '',
// //         address: '', // <-- NEW
// //         constituency: '',
// //         polling_station: '',
// //     });

// //     // CHANGE 2: Updated handleSubmit to calculate age before sending
// //     const handleSubmit = (e) => {
// //         e.preventDefault();
        
// //         // Calculate age from date of birth
// //         const birthDate = new Date(formData.date_of_birth);
// //         const today = new Date();
// //         let age = today.getFullYear() - birthDate.getFullYear();
// //         const m = today.getMonth() - birthDate.getMonth();
// //         if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
// //             age--;
// //         }

// //         // Send all form data PLUS the calculated age
// //         onSubmit({ ...formData, age });
// //     };

// //     const handleInputChange = (field, value) => {
// //         setFormData(prev => ({ ...prev, [field]: value }));
// //     };

// //     return (
// //         <motion.div
// //             initial={{ opacity: 0, y: -20 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             exit={{ opacity: 0, y: -20 }}
// //             className="mb-8"
// //         >
// //             <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
// //                 <div className="flex items-center justify-between mb-6">
// //                     <h3 className="text-lg font-semibold flex items-center gap-2">
// //                         <UserPlus className="w-5 h-5 text-saffron" />
// //                         Add New Voter
// //                     </h3>
// //                     <button
// //                         onClick={onCancel}
// //                         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
// //                     >
// //                         <X className="w-4 h-4" />
// //                     </button>
// //                 </div>

// //                 <form onSubmit={handleSubmit} className="space-y-4">
// //                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
// //                             <input
// //                                 type="text"
// //                                 value={formData.full_name}
// //                                 onChange={(e) => handleInputChange('full_name', e.target.value)}
// //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                                 required
// //                             />
// //                         </div>

// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID</label>
// //                             <input
// //                                 type="text"
// //                                 value={formData.voter_id}
// //                                 onChange={(e) => handleInputChange('voter_id', e.target.value)}
// //                                 placeholder="ABC1234567"
// //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                                 required
// //                             />
// //                         </div>

// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
// //                             <input
// //                                 type="text"
// //                                 value={formData.aadhar_number}
// //                                 onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
// //                                 maxLength={12}
// //                                 placeholder="123456789012"
// //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                                 required
// //                             />
// //                         </div>

// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
// //                             <input
// //                                 type="text"
// //                                 value={formData.phone_number}
// //                                 onChange={(e) => handleInputChange('phone_number', e.target.value)}
// //                                 maxLength={10}
// //                                 placeholder="9876543210"
// //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                                 required
// //                             />
// //                         </div>

// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
// //                             <input
// //                                 type="date"
// //                                 value={formData.date_of_birth}
// //                                 onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
// //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                                 required
// //                             />
// //                         </div>

// //                         {/* CHANGE 3: Added the new input field for Address */}
// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
// //                             <input
// //                                 type="text"
// //                                 value={formData.address}
// //                                 onChange={(e) => handleInputChange('address', e.target.value)}
// //                                 placeholder="Enter full address"
// //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                                 required
// //                             />
// //                         </div>
// //                         {/* END OF NEW FIELD */}

// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
// //                             <input
// //                                 type="text"
// //                                 value={formData.constituency}
// //                                 onChange={(e) => handleInputChange('constituency', e.target.value)}
// //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                                 required
// //                             />
// //                         </div>

// //                         <div className="md:col-span-2 lg:col-span-1">
// //                             <label className="block text-sm font-medium text-gray-700 mb-1">Polling Station</label>
// //                             <select
// //                                 value={formData.polling_station}
// //                                 onChange={(e) => handleInputChange('polling_station', e.target.value)}
// //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                                 required
// //                             >
// //                                 <option value="">Select Booth</option>
// //                                 {booths.map(booth => (
// //                                     <option key={booth._id} value={booth.booth_name}>
// //                                         {booth.booth_name} - {booth.constituency}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                     </div>

// //                     <div className="flex justify-end gap-3 pt-4">
// //                         <button
// //                             type="button"
// //                             onClick={onCancel}
// //                             className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
// //                         >
// //                             Cancel
// //                         </button>
// //                         <button
// //                             type="submit"
// //                             className="px-4 py-2 bg-gradient-to-r from-saffron to-green text-white rounded-lg hover:shadow-lg transition-all duration-200"
// //                         >
// //                             Add Voter
// //                         </button>
// //                     </div>
// //                 </form>
// //             </div>
// //         </motion.div>
// //     );
// // };

// // export default AddVoterForm;
// // // import React, { useState } from 'react';
// // // import { motion } from 'framer-motion';
// // // import { UserPlus, X } from 'lucide-react';

// // // const AddVoterForm = ({ booths, onSubmit, onCancel }) => {
// // //     const [formData, setFormData] = useState({
// // //         voter_id: '',
// // //         aadhar_number: '',
// // //         phone_number: '',
// // //         full_name: '',
// // //         date_of_birth: '',
// // //         constituency: '',
// // //         polling_station: '',
// // //     });

// // //     const handleSubmit = (e) => {
// // //         e.preventDefault();
// // //         onSubmit(formData);
// // //     };

// // //     const handleInputChange = (field, value) => {
// // //         setFormData(prev => ({ ...prev, [field]: value }));
// // //     };

// // //     return (
// // //         <motion.div
// // //             initial={{ opacity: 0, y: -20 }}
// // //             animate={{ opacity: 1, y: 0 }}
// // //             exit={{ opacity: 0, y: -20 }}
// // //             className="mb-8"
// // //         >
// // //             <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
// // //                 <div className="flex items-center justify-between mb-6">
// // //                     <h3 className="text-lg font-semibold flex items-center gap-2">
// // //                         <UserPlus className="w-5 h-5 text-saffron" />
// // //                         Add New Voter
// // //                     </h3>
// // //                     <button
// // //                         onClick={onCancel}
// // //                         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
// // //                     >
// // //                         <X className="w-4 h-4" />
// // //                     </button>
// // //                 </div>

// // //                 <form onSubmit={handleSubmit} className="space-y-4">
// // //                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// // //                         <div>
// // //                             <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
// // //                             <input
// // //                                 type="text"
// // //                                 value={formData.full_name}
// // //                                 onChange={(e) => handleInputChange('full_name', e.target.value)}
// // //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// // //                                 required
// // //                             />
// // //                         </div>

// // //                         <div>
// // //                             <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID</label>
// // //                             <input
// // //                                 type="text"
// // //                                 value={formData.voter_id}
// // //                                 onChange={(e) => handleInputChange('voter_id', e.target.value)}
// // //                                 placeholder="ABC1234567"
// // //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// // //                                 required
// // //                             />
// // //                         </div>

// // //                         <div>
// // //                             <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
// // //                             <input
// // //                                 type="text"
// // //                                 value={formData.aadhar_number}
// // //                                 onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
// // //                                 maxLength={12}
// // //                                 placeholder="123456789012"
// // //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// // //                                 required
// // //                             />
// // //                         </div>

// // //                         <div>
// // //                             <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
// // //                             <input
// // //                                 type="text"
// // //                                 value={formData.phone_number}
// // //                                 onChange={(e) => handleInputChange('phone_number', e.target.value)}
// // //                                 maxLength={10}
// // //                                 placeholder="9876543210"
// // //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// // //                                 required
// // //                             />
// // //                         </div>

// // //                         <div>
// // //                             <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
// // //                             <input
// // //                                 type="date"
// // //                                 value={formData.date_of_birth}
// // //                                 onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
// // //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// // //                                 required
// // //                             />
// // //                         </div>

// // //                         <div>
// // //                             <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
// // //                             <input
// // //                                 type="text"
// // //                                 value={formData.constituency}
// // //                                 onChange={(e) => handleInputChange('constituency', e.target.value)}
// // //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// // //                                 required
// // //                             />
// // //                         </div>

// // //                         <div className="md:col-span-2 lg:col-span-1">
// // //                             <label className="block text-sm font-medium text-gray-700 mb-1">Polling Station</label>
// // //                             <select
// // //                                 value={formData.polling_station}
// // //                                 onChange={(e) => handleInputChange('polling_station', e.target.value)}
// // //                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// // //                                 required
// // //                             >
// // //                                 <option value="">Select Booth</option>
// // //                                 {booths.map(booth => (
// // //                                     <option key={booth._id} value={booth.booth_name}>
// // //                                         {booth.booth_name} - {booth.constituency}
// // //                                     </option>
// // //                                 ))}
// // //                             </select>
// // //                         </div>
// // //                     </div>

// // //                     <div className="flex justify-end gap-3 pt-4">
// // //                         <button
// // //                             type="button"
// // //                             onClick={onCancel}
// // //                             className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
// // //                         >
// // //                             Cancel
// // //                         </button>
// // //                         <button
// // //                             type="submit"
// // //                             className="px-4 py-2 bg-gradient-to-r from-saffron to-green text-white rounded-lg hover:shadow-lg transition-all duration-200"
// // //                         >
// // //                             Add Voter
// // //                         </button>
// // //                     </div>
// // //                 </form>
// // //             </div>
// // //         </motion.div>
// // //     );
// // // };

// // // export default AddVoterForm;