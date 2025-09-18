import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Vote, RefreshCw, User } from 'lucide-react';

const VotingStatus = ({ voterData, onVote, onReset, isLoading }) => {
    const hasVoted = voterData?.voter?.has_voted;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
        >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5 }}
                        className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg ${
                            hasVoted ? "bg-green text-white" : "bg-blue-500 text-white"
                        }`}
                    >
                        {hasVoted ? <CheckCircle className="w-10 h-10" /> : <Vote className="w-10 h-10" />}
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {hasVoted ? "Vote Recorded!" : "Ready to Vote"}
                    </h2>
                </div>

                {/* Voter Information */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Voter Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Name:</strong> {voterData?.voter?.full_name}</div>
                        <div><strong>Voter ID:</strong> {voterData?.voter?.voter_id}</div>
                        <div><strong>Constituency:</strong> {voterData?.voter?.constituency}</div>
                        <div><strong>Polling Station:</strong> {voterData?.voter?.polling_station}</div>
                    </div>
                </div>

                {/* Status */}
                {hasVoted ? (
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                        <p className="text-green-800 font-semibold">Thank you for participating in democracy!</p>
                        <p className="text-sm text-green-700 mt-1">
                            Voted on: {new Date(voterData.voter.voting_timestamp).toLocaleString()}
                        </p>
                    </div>
                ) : (
                    <div className="text-center space-y-4 mb-6">
                        <p className="text-gray-700">You are eligible to vote. Click below to record your vote.</p>
                        <button
                            onClick={onVote}
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Vote className="w-5 h-5" />
                                    Record Vote (Simulated)
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Reset Button */}
                <div className="text-center">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mx-auto"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Check Another Voter
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default VotingStatus;