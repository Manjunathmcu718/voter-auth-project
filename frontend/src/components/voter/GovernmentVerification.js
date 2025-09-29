import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const GovernmentVerification = ({ voterData, onVerificationComplete }) => {
    const [verificationStatus, setVerificationStatus] = useState('PENDING');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        startVerification();
    }, [voterData]);

    const startVerification = async () => {
        if (!voterData || isVerifying) return;

        setIsVerifying(true);
        setError(null);
        setVerificationStatus('VERIFYING');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify-government-ids', voterData);
            const results = response.data;
            setVerificationStatus(results.overall_status.status);
            
            if (onVerificationComplete) {
                onVerificationComplete(results);
            }
        } catch (err) {
            console.error('Verification failed:', err);
            setVerificationStatus('ERROR');
            
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('An unexpected error occurred during verification.');
            }
        }
        
        setIsVerifying(false);
    };

    const renderVerificationDetails = () => {
        if (isVerifying) {
            return (
                <div className="text-center p-4">
                    <RefreshCw className="w-8 h-8 mx-auto text-blue-500 animate-spin mb-3" />
                    <p className="font-semibold text-blue-700">Verifying with Government Databases...</p>
                    <p className="text-sm text-gray-500">This may take a moment.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                    <div className="flex">
                        <div className="py-1">
                            <XCircle className="h-6 w-6 text-red-500 mr-3" />
                        </div>
                        <div>
                            <p className="font-bold">Verification Failed</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (verificationStatus === 'VERIFIED') {
             return (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <div>
                            <p className="font-bold">Verification Successful</p>
                            <p className="text-sm">Identity confirmed. Proceeding to OTP step...</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (verificationStatus !== 'PENDING' && verificationStatus !== 'VERIFYING') {
             return (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        <div>
                            <p className="font-bold">Verification Status: {verificationStatus.replace('_', ' ')}</p>
                            <p className="text-sm">Identity could not be confirmed. Please check your details and try again.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
        >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        Government ID Verification
                    </h2>
                </div>
                <div className="min-h-[100px]">
                    {renderVerificationDetails()}
                </div>
            </div>
        </motion.div>
    );
};

export default GovernmentVerification;
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, Database } from 'lucide-react';

// // A simple progress bar component made with basic divs
// const ProgressBar = ({ progress }) => (
//     <div className="w-full bg-gray-200 rounded-full h-2.5">
//         <div 
//             className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
//             style={{ width: `${progress}%` }}
//         ></div>
//     </div>
// );

// // A simple badge component made with a span
// const StatusBadge = ({ text, colorClass }) => (
//     <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
//         {text}
//     </span>
// );

// export default function GovernmentVerification({ formData, onComplete }) {
//     const [verificationReport, setVerificationReport] = useState(null);
//     const [isVerifying, setIsVerifying] = useState(true);
//     const [progress, setProgress] = useState(0);

//     useEffect(() => {
//         const startVerification = async () => {
//             if (!formData) return;

//             setIsVerifying(true);
//             setProgress(10); // Initial progress

//             try {
//                 // Simulate progress for a better user experience
//                 setTimeout(() => setProgress(40), 500); // "Connecting..."
//                 setTimeout(() => setProgress(75), 1500); // "Verifying..."

//                 const response = await fetch('http://localhost:5000/api/auth/verify-government-ids', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({
//                         aadhar_number: formData.aadhar_number,
//                         voter_id: formData.voter_id,
//                         full_name: formData.full_name,
//                     }),
//                 });

//                 const report = await response.json();
//                 if (!response.ok) {
//                     throw new Error(report.error || "Verification API failed");
//                 }
                
//                 setVerificationReport(report);
//                 setProgress(100);
//                 setIsVerifying(false);
                
//                 // Notify the parent component that verification is complete
//                 if (onComplete) {
//                     setTimeout(() => onComplete(report), 1000); // Add a small delay to show final status
//                 }

//             } catch (error) {
//                 console.error("Verification failed:", error);
//                 const errorReport = { overall_status: "API_ERROR", verification_report: {} };
//                 setVerificationReport(errorReport);
//                 setIsVerifying(false);
//                 if (onComplete) {
//                     onComplete(errorReport);
//                 }
//             }
//         };

//         startVerification();
//     }, [formData, onComplete]);

//     const getStatusUI = (status) => {
//         switch (status) {
//             case 'VERIFIED':
//                 return { icon: <CheckCircle className="w-5 h-5 text-green-600" />, color: 'bg-green-100 text-green-800' };
//             case 'SUSPICIOUS':
//                 return { icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />, color: 'bg-yellow-100 text-yellow-800' };
//             case 'FORGED':
//             case 'INVALID':
//             case 'REJECTED':
//                 return { icon: <XCircle className="w-5 h-5 text-red-600" />, color: 'bg-red-100 text-red-800' };
//             default:
//                 return { icon: <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />, color: 'bg-gray-100 text-gray-800' };
//         }
//     };

//     const renderVerificationStep = (title, currentProgress, targetProgress) => (
//         <div className="flex items-center gap-4">
//             {currentProgress >= targetProgress ? (
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//             ) : (
//                 <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
//             )}
//             <span className="text-gray-700">{title}</span>
//         </div>
//     );
    
//     return (
//         <motion.div
//             key="gov-verify-motion"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//         >
//             <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//                 <div className="p-6 text-center border-b border-gray-200">
//                     <Database className="w-12 h-12 mx-auto text-blue-600 mb-4" />
//                     <h2 className="text-2xl font-bold text-gray-800">Government ID Verification</h2>
//                     <p className="text-gray-600 mt-2">Connecting to official databases for identity verification...</p>
//                 </div>

//                 <div className="p-8">
//                     {isVerifying && (
//                         <div className="space-y-6">
//                             {renderVerificationStep("Connecting to UIDAI Database...", progress, 40)}
//                             {renderVerificationStep("Verifying with Election Commission...", progress, 75)}
//                             {renderVerificationStep("Finalizing Report...", progress, 100)}
//                             <ProgressBar progress={progress} />
//                         </div>
//                     )}
                    
//                     {!isVerifying && verificationReport && (
//                         <div className="space-y-4 animate-fade-in">
//                             {/* Aadhaar Result */}
//                             <div className="border border-gray-200 rounded-lg p-4">
//                                 <div className="flex justify-between items-center mb-2">
//                                     <h3 className="font-semibold text-gray-700">Aadhaar (UIDAI) Status</h3>
//                                     <div className="flex items-center gap-2">
//                                         {getStatusUI(verificationReport.verification_report?.uidai_aadhaar?.status).icon}
//                                         <StatusBadge 
//                                             text={verificationReport.verification_report?.uidai_aadhaar?.status || 'ERROR'}
//                                             colorClass={getStatusUI(verificationReport.verification_report?.uidai_aadhaar?.status).color}
//                                         />
//                                     </div>
//                                 </div>
//                                 <p className="text-sm text-gray-600">
//                                     {verificationReport.verification_report?.uidai_aadhaar?.message || 'Could not get verification result.'}
//                                 </p>
//                             </div>
                            
//                             {/* ECI Result */}
//                             <div className="border border-gray-200 rounded-lg p-4">
//                                 <div className="flex justify-between items-center mb-2">
//                                     <h3 className="font-semibold text-gray-700">Voter ID (ECI) Status</h3>
//                                     <div className="flex items-center gap-2">
//                                         {getStatusUI(verificationReport.verification_report?.eci_voter_id?.status).icon}
//                                         <StatusBadge 
//                                             text={verificationReport.verification_report?.eci_voter_id?.status || 'ERROR'}
//                                             colorClass={getStatusUI(verificationReport.verification_report?.eci_voter_id?.status).color}
//                                         />
//                                     </div>
//                                 </div>
//                                 <p className="text-sm text-gray-600">
//                                     {verificationReport.verification_report?.eci_voter_id?.message || 'Could not get verification result.'}
//                                 </p>
//                             </div>
                            
//                              {/* Overall Result */}
//                              <div className={`p-4 rounded-lg mt-4 ${getStatusUI(verificationReport.overall_status).color}`}>
//                                 <div className="flex items-center gap-3">
//                                     {getStatusUI(verificationReport.overall_status).icon}
//                                     <div>
//                                         <h3 className="font-bold">Overall Status: {verificationReport.overall_status}</h3>
//                                         <p className="text-sm">
//                                             {verificationReport.overall_status === 'VERIFIED' 
//                                                 ? "Identity confirmed. Proceeding to next step..." 
//                                                 : "Verification failed. Please review your details and try again."}
//                                         </p>
//                                     </div>
//                                 </div>
//                              </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </motion.div>
//     );
// }
// // import React, { useState, useEffect } from 'react';
// // import { motion } from 'framer-motion';
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// // import { Button } from '@/components/ui/button';
// // import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, ArrowRight } from 'lucide-react';

// // // Helper component for displaying each verification result
// // const VerificationItem = ({ title, result }) => {
// //     if (!result) {
// //         return (
// //             <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
// //                 <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
// //                 <span className="font-medium text-gray-500">{title}: Verifying...</span>
// //             </div>
// //         );
// //     }

// //     const statusConfig = {
// //         VERIFIED: { icon: CheckCircle, color: "green", text: "Verified" },
// //         SUSPICIOUS: { icon: AlertTriangle, color: "orange", text: "Suspicious" },
// //         FORGED: { icon: XCircle, color: "red", text: "Forged/Invalid" },
// //         INVALID: { icon: XCircle, color: "red", text: "Invalid Format" },
// //     };

// //     const config = statusConfig[result.status] || { icon: AlertTriangle, color: "gray", text: "Unknown" };
// //     const Icon = config.icon;

// //     return (
// //         <motion.div
// //             initial={{ opacity: 0, y: 10 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: 0.5 }}
// //             className={`border-l-4 p-4 rounded-r-lg bg-${config.color}-50 border-${config.color}-500`}
// //         >
// //             <div className="flex items-start justify-between">
// //                 <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
// //                 <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-${config.color}-100 text-${config.color}-800 font-bold text-sm`}>
// //                     <Icon className={`w-5 h-5 text-${config.color}-600`} />
// //                     {config.text}
// //                 </div>
// //             </div>
// //             <p className="mt-2 text-gray-600">{result.message}</p>
// //             <p className="mt-1 text-xs text-gray-500">Confidence: {((result.confidence || 0) * 100).toFixed(0)}%</p>
// //         </motion.div>
// //     );
// // };

// // export default function GovernmentVerification({ formData, onComplete }) {
// //     const [report, setReport] = useState(null);
// //     const [error, setError] = useState('');

// //     useEffect(() => {
// //         const verify = async () => {
// //             try {
// //                 const response = await fetch('http://localhost:5000/api/auth/verify-government-ids', {
// //                     method: 'POST',
// //                     headers: { 'Content-Type': 'application/json' },
// //                     body: JSON.stringify(formData),
// //                 });
// //                 const data = await response.json();
// //                 if (!response.ok) throw new Error(data.error || 'Verification failed');
// //                 setReport(data);
// //             } catch (err) {
// //                 setError(err.message);
// //             }
// //         };
// //         verify();
// //     }, [formData]);

// //     const isVerified = report?.overall_status === 'VERIFIED';

// //     return (
// //         <motion.div
// //             initial={{ opacity: 0, scale: 0.95 }}
// //             animate={{ opacity: 1, scale: 1 }}
// //         >
// //             <Card className="max-w-2xl mx-auto shadow-2xl border-0">
// //                 <CardHeader className="text-center">
// //                     <Shield className="w-12 h-12 mx-auto text-blue-600" />
// //                     <CardTitle className="text-2xl font-bold mt-2">Government ID Verification</CardTitle>
// //                     <p className="text-gray-500">Verifying credentials with national databases...</p>
// //                 </CardHeader>
// //                 <CardContent className="space-y-6">
// //                     <div className="space-y-4">
// //                         <VerificationItem title="UIDAI Aadhaar Verification" result={report?.verification_report.uidai_aadhaar} />
// //                         <VerificationItem title="ECI Voter ID Verification" result={report?.verification_report.eci_voter_id} />
// //                     </div>

// //                     {report && (
// //                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center space-y-4">
// //                             {isVerified ? (
// //                                 <div className="p-4 bg-green-50 text-green-800 rounded-lg">
// //                                     <h3 className="font-bold text-lg">✅ Verification Successful!</h3>
// //                                     <p>You may proceed to the next step.</p>
// //                                 </div>
// //                             ) : (
// //                                 <div className="p-4 bg-red-50 text-red-800 rounded-lg">
// //                                     <h3 className="font-bold text-lg">❌ Verification Failed</h3>
// //                                     <p>Your identity could not be verified. Please check your details or contact support.</p>
// //                                 </div>
// //                             )}
// //                             <Button
// //                                 onClick={() => onComplete(report)}
// //                                 disabled={!isVerified}
// //                                 className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
// //                             >
// //                                 Proceed to OTP Verification <ArrowRight className="w-4 h-4 ml-2" />
// //                             </Button>
// //                         </motion.div>
// //                     )}

// //                     {error && <p className="text-red-500 text-center">{error}</p>}
// //                 </CardContent>
// //             </Card>
// //         </motion.div>
// //     );
// // }