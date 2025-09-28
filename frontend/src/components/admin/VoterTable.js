import React, { useState } from 'react';
import { Users, RefreshCw, Trash2, Image, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const VoterTable = ({ voters, isLoading, onRefresh, onDeleteVoter }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [voterToDelete, setVoterToDelete] = useState(null);

    const handleDeleteClick = (voter) => {
        setVoterToDelete(voter);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (voterToDelete && onDeleteVoter) {
            await onDeleteVoter(voterToDelete._id);
            setDeleteDialogOpen(false);
            setVoterToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setVoterToDelete(null);
    };

    if (isLoading && voters.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading voters...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Voter List ({voters.length})
                    </h2>
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Voter Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact & Address
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Photo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <AnimatePresence>
                                {voters.map((voter) => (
                                    <motion.tr
                                        key={voter._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Voter Details */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{voter.full_name}</p>
                                                <p className="text-sm text-gray-600">ID: {voter.voter_id}</p>
                                                <p className="text-xs text-gray-500">
                                                    Aadhaar: {voter.aadhar_number || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Age: {voter.age || 'N/A'}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Contact & Address */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{voter.phone_number || 'N/A'}</p>
                                                <p className="text-sm text-gray-600 max-w-xs truncate" title={voter.address}>
                                                    {voter.address || 'N/A'}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{voter.constituency || 'N/A'}</p>
                                                <p className="text-sm text-gray-600">{voter.polling_station || 'N/A'}</p>
                                            </div>
                                        </td>

                                        {/* Photo Status */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {voter.image_id ? (
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <Image className="w-4 h-4" />
                                                        <span className="text-xs font-medium">Uploaded</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <ImageOff className="w-4 h-4" />
                                                        <span className="text-xs">No Photo</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Voting Status */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                voter.has_voted 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {voter.has_voted ? '✓ Voted' : 'Not Voted'}
                                            </span>
                                            {voter.has_voted && voter.voting_timestamp && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(voter.voting_timestamp).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(voter)}
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                title="Delete voter"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {voters.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No voters found.</p>
                            <p className="text-gray-400 text-sm">Add your first voter using the "Add Voter" button.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={deleteDialogOpen}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                voterName={voterToDelete?.full_name}
                hasPhoto={!!voterToDelete?.image_id}
            />
        </>
    );
};

export default VoterTable;
// import React from 'react';
// import { motion } from 'framer-motion';
// import { Users, CheckCircle, XCircle, RefreshCw, Trash2 } from 'lucide-react';

// const VoterTable = ({ voters, isLoading, onRefresh, onDeleteVoter }) => {
//     if (isLoading) {
//         return (
//             <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
//                 <div className="text-center py-8">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading voters...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//         >
//             <div className="bg-white rounded-xl shadow-lg border border-gray-200">
//                 <div className="p-6 border-b border-gray-200">
//                     <div className="flex items-center justify-between">
//                         <h3 className="text-lg font-semibold flex items-center gap-2">
//                             <Users className="w-5 h-5 text-blue-600" />
//                             Registered Voters ({voters.length})
//                         </h3>
//                         <button
//                             onClick={onRefresh}
//                             className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                         >
//                             <RefreshCw className="w-4 h-4" />
//                             Refresh
//                         </button>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-gray-50">
//                             <tr>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Voter Info
//                                 </th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Location
//                                 </th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Status
//                                 </th>
//                                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Actions
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                             {voters.map((voter) => (
//                                 <tr key={voter._id} className="hover:bg-gray-50">
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                         <div>
//                                             <div className="text-sm font-medium text-gray-900">
//                                                 {voter.full_name}
//                                             </div>
//                                             <div className="text-sm text-gray-500">
//                                                 ID: {voter.voter_id}
//                                             </div>
//                                             <div className="text-xs text-gray-400">
//                                                 Phone: {voter.phone_number}
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                         <div className="text-sm text-gray-900">
//                                             {voter.constituency}
//                                         </div>
//                                         <div className="text-sm text-gray-500">
//                                             {voter.polling_station}
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                             voter.has_voted 
//                                                 ? 'bg-green-100 text-green-800' 
//                                                 : 'bg-gray-100 text-gray-800'
//                                         }`}>
//                                             {voter.has_voted ? (
//                                                 <>
//                                                     <CheckCircle className="w-3 h-3 mr-1" />
//                                                     Voted
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <XCircle className="w-3 h-3 mr-1" />
//                                                     Not Voted
//                                                 </>
//                                             )}
//                                         </span>
//                                         {voter.has_voted && voter.voting_timestamp && (
//                                             <div className="text-xs text-gray-500 mt-1">
//                                                 {new Date(voter.voting_timestamp).toLocaleDateString()}
//                                             </div>
//                                         )}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                         <button
//                                             onClick={() => onDeleteVoter(voter._id)}
//                                             className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
//                                         >
//                                             <Trash2 className="w-4 h-4" />
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>

//                     {voters.length === 0 && (
//                         <div className="text-center py-8 text-gray-500">
//                             <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                             <p>No voters registered yet.</p>
//                             <p className="text-sm">Add voters using the form above.</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </motion.div>
//     );
// };

// export default VoterTable;