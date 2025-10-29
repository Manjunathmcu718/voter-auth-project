import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, RefreshCw, Building, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BoothAllocationPage = () => {
    const [mappings, setMappings] = useState([]);
    const [booths, setBooths] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [newMapping, setNewMapping] = useState({
        booth_id: '',
        booth_name: '',
        locality_names: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [mappingsRes, boothsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/booth-allocation/mappings'),
                axios.get('http://localhost:5000/api/admin/booths')
            ]);
            setMappings(mappingsRes.data.mappings);
            setBooths(boothsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setIsLoading(false);
    };

    const handleCreateMapping = async (e) => {
        e.preventDefault();
        try {
            // Convert comma-separated string to array
            const localityArray = newMapping.locality_names
                .split(',')
                .map(name => name.trim())
                .filter(name => name.length > 0);
            
            await axios.post('http://localhost:5000/api/booth-allocation/create-mapping', {
                booth_id: newMapping.booth_id,
                booth_name: newMapping.booth_name,
                locality_names: localityArray
            });
            
            setNewMapping({ booth_id: '', booth_name: '', locality_names: '' });
            setShowAddForm(false);
            loadData();
        } catch (error) {
            alert('Error creating mapping: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteMapping = async (boothId) => {
        if (window.confirm('Are you sure you want to delete this mapping?')) {
            try {
                await axios.delete(`http://localhost:5000/api/booth-allocation/delete-mapping/${boothId}`);
                loadData();
            } catch (error) {
                alert('Error deleting mapping: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg border-4 border-white">
                        <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-3"
                    >
                        <span className="text-blue-600">Smart Booth</span>{' '}
                        <span className="text-indigo-600">Allocation</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-700"
                    >
                        Map localities to polling booths for automatic voter assignment
                    </motion.p>
                </header>

                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-blue-800">How it works:</p>
                            <p className="text-sm text-blue-700 mt-1">
                                When registering a voter, the system will analyze their address and automatically 
                                assign them to the correct booth based on locality names (e.g., "Keshav Nagar" → Booth 1).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Locality-Booth Mappings ({mappings.length})
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={loadData}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {showAddForm ? 'Cancel' : 'Add Mapping'}
                        </button>
                    </div>
                </div>

                {/* Add Mapping Form */}
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6"
                    >
                        <h3 className="text-xl font-bold mb-4">Create New Mapping</h3>
                        <form onSubmit={handleCreateMapping} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Booth
                                    </label>
                                    <select
                                        value={newMapping.booth_id}
                                        onChange={(e) => {
                                            const selectedBooth = booths.find(b => b.booth_number === e.target.value);
                                            setNewMapping({
                                                ...newMapping,
                                                booth_id: e.target.value,
                                                booth_name: selectedBooth?.booth_name || ''
                                            });
                                        }}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Select Booth --</option>
                                        {booths.map(booth => (
                                            <option key={booth._id} value={booth.booth_number}>
                                                {booth.booth_name} ({booth.booth_number})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Locality Names (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={newMapping.locality_names}
                                        onChange={(e) => setNewMapping({...newMapping, locality_names: e.target.value})}
                                        placeholder="e.g., Keshav Nagar, Gandhi Nagar"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter multiple locality names separated by commas
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700"
                                >
                                    Create Mapping
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Mappings List */}
                <div className="space-y-4">
                    {mappings.length > 0 ? (
                        mappings.map((mapping) => (
                            <motion.div
                                key={mapping._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Building className="w-5 h-5 text-indigo-600" />
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {mapping.booth_name}
                                            </h3>
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
                                                {mapping.booth_id}
                                            </span>
                                        </div>
                                        <div className="ml-8">
                                            <p className="text-sm font-medium text-gray-600 mb-2">Mapped Localities:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {mapping.locality_names.map((locality, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200"
                                                    >
                                                        <MapPin className="w-3 h-3 inline mr-1" />
                                                        {locality}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMapping(mapping.booth_id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
                            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">No mappings created yet.</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Click "Add Mapping" to create your first locality-booth mapping.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoothAllocationPage;