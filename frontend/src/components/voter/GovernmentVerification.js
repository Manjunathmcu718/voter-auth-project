import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, ArrowRight } from 'lucide-react';

// Helper component for displaying each verification result
const VerificationItem = ({ title, result }) => {
    if (!result) {
        return (
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                <span className="font-medium text-gray-500">{title}: Verifying...</span>
            </div>
        );
    }

    const statusConfig = {
        VERIFIED: { icon: CheckCircle, color: "green", text: "Verified" },
        SUSPICIOUS: { icon: AlertTriangle, color: "orange", text: "Suspicious" },
        FORGED: { icon: XCircle, color: "red", text: "Forged/Invalid" },
        INVALID: { icon: XCircle, color: "red", text: "Invalid Format" },
    };

    const config = statusConfig[result.status] || { icon: AlertTriangle, color: "gray", text: "Unknown" };
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`border-l-4 p-4 rounded-r-lg bg-${config.color}-50 border-${config.color}-500`}
        >
            <div className="flex items-start justify-between">
                <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-${config.color}-100 text-${config.color}-800 font-bold text-sm`}>
                    <Icon className={`w-5 h-5 text-${config.color}-600`} />
                    {config.text}
                </div>
            </div>
            <p className="mt-2 text-gray-600">{result.message}</p>
            <p className="mt-1 text-xs text-gray-500">Confidence: {((result.confidence || 0) * 100).toFixed(0)}%</p>
        </motion.div>
    );
};

export default function GovernmentVerification({ formData, onComplete }) {
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/verify-government-ids', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Verification failed');
                setReport(data);
            } catch (err) {
                setError(err.message);
            }
        };
        verify();
    }, [formData]);

    const isVerified = report?.overall_status === 'VERIFIED';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Card className="max-w-2xl mx-auto shadow-2xl border-0">
                <CardHeader className="text-center">
                    <Shield className="w-12 h-12 mx-auto text-blue-600" />
                    <CardTitle className="text-2xl font-bold mt-2">Government ID Verification</CardTitle>
                    <p className="text-gray-500">Verifying credentials with national databases...</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <VerificationItem title="UIDAI Aadhaar Verification" result={report?.verification_report.uidai_aadhaar} />
                        <VerificationItem title="ECI Voter ID Verification" result={report?.verification_report.eci_voter_id} />
                    </div>

                    {report && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center space-y-4">
                            {isVerified ? (
                                <div className="p-4 bg-green-50 text-green-800 rounded-lg">
                                    <h3 className="font-bold text-lg">✅ Verification Successful!</h3>
                                    <p>You may proceed to the next step.</p>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                                    <h3 className="font-bold text-lg">❌ Verification Failed</h3>
                                    <p>Your identity could not be verified. Please check your details or contact support.</p>
                                </div>
                            )}
                            <Button
                                onClick={() => onComplete(report)}
                                disabled={!isVerified}
                                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                            >
                                Proceed to OTP Verification <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {error && <p className="text-red-500 text-center">{error}</p>}
                </CardContent>
            </Card>
        </motion.div>
    );
}