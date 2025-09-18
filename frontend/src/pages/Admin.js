import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Building, UserPlus, Users } from 'lucide-react';
import AddVoterForm from '../components/admin/AddVoterForm';
import AddBoothForm from '../components/admin/AddBoothForm';
import VoterTable from '../components/admin/VoterTable';

const Admin = () => {
    const [voters, setVoters] = useState([]);
    const [booths, setBooths] = useState([]);
    const [showAddVoterForm, setShowAddVoterForm] = useState(false);
    const [showAddBoothForm, setShowAddBoothForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const [votersResponse, boothsResponse] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/voters'),
                axios.get('http://localhost:5000/api/admin/booths')
            ]);
            
            setVoters(votersResponse.data);
            setBooths(boothsResponse.data);
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
        setIsLoading(false);
    };

    const handleAddVoter = async (voterData) => {
        try {
            await axios.post('http://localhost:5000/api/admin/voters', voterData);
            setShowAddVoterForm(false);
            loadAllData();
        } catch (error) {
            alert(error.response?.data?.error || 'Error adding voter');
        }
    };

    const handleDeleteVoter = async (voterId) => {
        if (window.confirm('Are you sure you want to delete this voter?')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/voters/${voterId}`);
                loadAllData();
            } catch (error) {
                alert(error.response?.data?.error || 'Error deleting voter');
            }
        }
    };

    const handleAddBooth = async (boothData) => {
        try {
            await axios.post('http://localhost:5000/api/admin/booths', boothData);
            setShowAddBoothForm(false);
            loadAllData();
        } catch (error) {
            alert(error.response?.data?.error || 'Error adding booth');
        }
    };

    const filteredVoters = voters.filter(voter =>
        Object.values(voter).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-saffron via-white to-green flex items-center justify-center shadow-lg border-4 border-white">
                        <Users className="w-8 h-8 text-navy" />
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-3"
                    >
                        <span className="text-purple-700">Admin</span>{" "}
                        <span className="text-blue-600">Panel</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600"
                    >
                        Manage voter registrations and polling booths
                    </motion.p>
                </header>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8"
                >
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search voters..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddBoothForm(!showAddBoothForm)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Building className="w-4 h-4" />
                            {showAddBoothForm ? 'Close' : 'Add Booth'}
                        </button>
                        
                        <button
                            onClick={() => setShowAddVoterForm(!showAddVoterForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-saffron to-green text-white rounded-lg hover:shadow-lg transition-all duration-200"
                        >
                            <UserPlus className="w-4 h-4" />
                            {showAddVoterForm ? 'Close' : 'Add Voter'}
                        </button>
                    </div>
                </motion.div>

                {/* Forms */}
                <AnimatePresence>
                    {showAddVoterForm && (
                        <AddVoterForm
                            booths={booths}
                            onSubmit={handleAddVoter}
                            onCancel={() => setShowAddVoterForm(false)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showAddBoothForm && (
                        <AddBoothForm
                            onSubmit={handleAddBooth}
                            onCancel={() => setShowAddBoothForm(false)}
                        />
                    )}
                </AnimatePresence>
                             
                {/* Voter Table */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <VoterTable
                            voters={filteredVoters}
                            isLoading={isLoading}
                            onRefresh={loadAllData}
                            onDeleteVoter={handleDeleteVoter}
                        />
                    </div>

                    {/* Booth List */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
                        >
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5 text-blue-600" />
                                Polling Booths ({booths.length})
                            </h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {booths.map(booth => (
                                    <div key={booth._id} className="p-3 bg-gray-50 rounded-lg border">
                                        <h4 className="font-semibold text-gray-800">{booth.booth_name}</h4>
                                        <p className="text-sm text-gray-500">#{booth.booth_number}</p>
                                        <p className="text-sm text-gray-600">{booth.constituency}</p>
                                        <p className="text-xs text-gray-500 mt-1">{booth.address}</p>
                                    </div>
                                ))}
                                {booths.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>No booths created yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;