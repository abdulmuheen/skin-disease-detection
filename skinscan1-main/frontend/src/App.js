import { useState, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { jsPDF } from "jspdf";
import { Toaster, toast } from "sonner";
import {
  FirstAidKit,
  Camera,
  UploadSimple,
  Warning,
  CheckCircle,
  Info,
  FileArrowDown,
  ArrowRight,
  Stethoscope,
  ShieldCheck,
  Pill,
  ListChecks,
  X,
  SpinnerGap
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Hero Image
const HERO_IMAGE = "https://images.pexels.com/photos/7446661/pexels-photo-7446661.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

// Navigation Component
const Navigation = () => (
  <nav className="nav-sticky" data-testid="navigation">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-medical-blue flex items-center justify-center">
            <FirstAidKit size={24} weight="fill" className="text-white" />
          </div>
          <span className="text-xl font-semibold text-slate-900">DermaScan AI</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Warning size={18} weight="fill" className="text-amber-500" />
          <span className="hidden sm:inline">Not a substitute for medical advice</span>
        </div>
      </div>
    </div>
  </nav>
);

// Hero Section
const HeroSection = ({ onGetStarted }) => (
  <section className="hero-gradient py-12 lg:py-20" data-testid="hero-section">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-medical-blue-light text-medical-blue border-0 mb-4">
              AI-Powered Dermatology Assistant
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              Instant Skin <br className="hidden sm:block" />
              <span className="text-medical-blue">Condition Analysis</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
              Upload a photo of your skin concern and receive AI-powered insights about potential conditions, 
              along with general guidance and downloadable reports.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button 
              onClick={onGetStarted}
              className="bg-medical-blue hover:bg-blue-900 text-white px-8 py-6 text-lg rounded-xl btn-medical"
              data-testid="get-started-btn"
            >
              Start Analysis
              <ArrowRight size={20} weight="bold" className="ml-2" />
            </Button>
            <Button 
              variant="outline"
              className="border-slate-300 text-slate-700 px-8 py-6 text-lg rounded-xl"
              data-testid="learn-more-btn"
            >
              Learn More
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-6 pt-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={20} weight="fill" className="text-medical-green" />
              <span className="text-sm text-slate-600">10+ Conditions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} weight="fill" className="text-medical-green" />
              <span className="text-sm text-slate-600">Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} weight="fill" className="text-medical-green" />
              <span className="text-sm text-slate-600">PDF Reports</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-5"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-medical-blue rounded-3xl transform rotate-3 opacity-10"></div>
            <img 
              src={HERO_IMAGE}
              alt="Dermatologist examining skin"
              className="relative rounded-3xl shadow-xl w-full h-auto object-cover"
            />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Upload Section
const UploadSection = ({ onImageUpload, isLoading }) => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  const handleAnalyze = () => {
    if (previewImage && disclaimerAccepted) {
      onImageUpload(previewImage);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
  };

  return (
    <section className="py-12 bg-slate-50" data-testid="upload-section">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Upload Your Image
          </h2>
          <p className="mt-2 text-slate-600">
            Take or upload a clear photo of the affected skin area
          </p>
        </motion.div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {!previewImage ? (
              <div
                {...getRootProps()}
                className={`upload-zone rounded-2xl p-12 text-center transition-all ${
                  isDragActive ? 'drag-active' : ''
                }`}
                data-testid="dropzone"
              >
                <input {...getInputProps()} data-testid="file-input" />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    {isDragActive ? (
                      <Camera size={32} weight="duotone" className="text-medical-green" />
                    ) : (
                      <UploadSimple size={32} weight="duotone" className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-700">
                      {isDragActive ? 'Drop your image here' : 'Drag & drop your image'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      or click to browse (JPEG, PNG, WebP)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-xl"
                  data-testid="preview-image"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-100 transition-colors"
                  data-testid="clear-image-btn"
                >
                  <X size={18} weight="bold" className="text-slate-600" />
                </button>
              </motion.div>
            )}

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200" data-testid="disclaimer-box">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="disclaimer"
                  checked={disclaimerAccepted}
                  onCheckedChange={setDisclaimerAccepted}
                  className="mt-1"
                  data-testid="disclaimer-checkbox"
                />
                <label htmlFor="disclaimer" className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-medium text-amber-700">Important Disclaimer:</span>{' '}
                  I understand that this AI analysis is for informational purposes only and is NOT a substitute 
                  for professional medical advice, diagnosis, or treatment. I will consult a qualified healthcare 
                  provider for any medical concerns.
                </label>
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!previewImage || !disclaimerAccepted || isLoading}
              className="w-full mt-6 bg-medical-blue hover:bg-blue-900 text-white py-6 text-lg rounded-xl btn-medical disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="analyze-btn"
            >
              {isLoading ? (
                <>
                  <SpinnerGap size={24} className="animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Stethoscope size={24} weight="duotone" className="mr-2" />
                  Analyze Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

// Results Section
const ResultsSection = ({ result, imageData, onNewAnalysis, onDownloadPDF }) => {
  const getConfidenceColor = (score) => {
    if (score >= 0.7) return 'confidence-high';
    if (score >= 0.4) return 'confidence-medium';
    return 'confidence-low';
  };

  const getSeverityBadge = (severity) => {
    const classes = {
      'Mild': 'badge-mild',
      'Moderate': 'badge-moderate',
      'Severe': 'badge-severe'
    };
    return classes[severity] || 'badge-mild';
  };

  const isUrgent = result.detected_condition === 'melanoma' || result.severity === 'Severe';

  return (
    <section className="py-12 bg-white" data-testid="results-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Analysis Results
          </h2>
          <p className="mt-2 text-slate-600">
            Based on AI analysis of your uploaded image
          </p>
        </motion.div>

        {isUrgent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            data-testid="urgent-alert"
          >
            <div className="flex items-center gap-3">
              <Warning size={24} weight="fill" className="text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Urgent Medical Attention Recommended</p>
                <p className="text-sm text-red-700">Please consult a dermatologist as soon as possible.</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bento-grid">
          {/* Image Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bento-item-third"
          >
            <Card className="h-full border-slate-200" data-testid="image-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera size={20} weight="duotone" className="text-medical-blue" />
                  Uploaded Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="image-preview-container">
                  <img
                    src={imageData}
                    alt="Analyzed skin"
                    className="w-full h-48 object-cover rounded-lg"
                    data-testid="result-image"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Diagnosis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bento-item-two-thirds"
          >
            <Card className="h-full border-slate-200" data-testid="diagnosis-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope size={20} weight="duotone" className="text-medical-blue" />
                  Detected Condition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900" data-testid="condition-name">
                      {result.condition_name}
                    </h3>
                    <Badge className={`mt-2 ${getSeverityBadge(result.severity)}`} data-testid="severity-badge">
                      {result.severity}
                    </Badge>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm text-slate-500">Confidence Score</p>
                    <p className="text-3xl font-bold mono text-medical-blue" data-testid="confidence-score">
                      {(result.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="confidence-meter">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence_score * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`confidence-fill ${getConfidenceColor(result.confidence_score)}`}
                      data-testid="confidence-bar"
                    />
                  </div>
                </div>
                <p className="mt-4 text-slate-600 leading-relaxed" data-testid="condition-description">
                  {result.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bento-item-full"
          >
            <Card className="border-slate-200" data-testid="analysis-notes-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info size={20} weight="duotone" className="text-medical-blue" />
                  AI Analysis Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-700" data-testid="analysis-notes">
                    {result.analysis_notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Treatments & Precautions Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bento-item-full"
          >
            <Card className="border-slate-200" data-testid="treatments-card">
              <CardContent className="p-0">
                <Tabs defaultValue="treatments" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 rounded-none rounded-t-xl bg-slate-100 p-0 h-14">
                    <TabsTrigger 
                      value="treatments" 
                      className="rounded-none rounded-tl-xl data-[state=active]:bg-white h-full"
                      data-testid="treatments-tab"
                    >
                      <Pill size={18} weight="duotone" className="mr-2" />
                      Suggested Treatments
                    </TabsTrigger>
                    <TabsTrigger 
                      value="precautions" 
                      className="rounded-none rounded-tr-xl data-[state=active]:bg-white h-full"
                      data-testid="precautions-tab"
                    >
                      <ListChecks size={18} weight="duotone" className="mr-2" />
                      Precautions
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="treatments" className="p-6 mt-0" data-testid="treatments-content">
                    <div className="space-y-1">
                      {result.treatments.map((treatment, index) => (
                        <div key={index} className="treatment-item">
                          <div className="w-6 h-6 rounded-full bg-medical-green-light flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={14} weight="fill" className="text-medical-green" />
                          </div>
                          <p className="text-slate-700">{treatment}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="precautions" className="p-6 mt-0" data-testid="precautions-content">
                    <div className="space-y-1">
                      {result.precautions.map((precaution, index) => (
                        <div key={index} className="treatment-item">
                          <div className="w-6 h-6 rounded-full bg-medical-blue-light flex items-center justify-center flex-shrink-0">
                            <ShieldCheck size={14} weight="fill" className="text-medical-blue" />
                          </div>
                          <p className="text-slate-700">{precaution}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bento-item-full"
          >
            <div className="disclaimer-box" data-testid="result-disclaimer">
              <div className="flex items-start gap-3">
                <Warning size={24} weight="fill" className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  <span className="font-semibold">Medical Disclaimer:</span> {result.disclaimer}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bento-item-full"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onDownloadPDF}
                className="btn-pdf text-white px-8 py-6 text-lg rounded-xl"
                data-testid="download-pdf-btn"
              >
                <FileArrowDown size={24} weight="duotone" className="mr-2" />
                Download PDF Report
              </Button>
              <Button
                onClick={onNewAnalysis}
                variant="outline"
                className="border-slate-300 text-slate-700 px-8 py-6 text-lg rounded-xl"
                data-testid="new-analysis-btn"
              >
                New Analysis
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Loading/Analyzing State
const AnalyzingState = () => (
  <section className="py-20 bg-white" data-testid="analyzing-section">
    <div className="max-w-md mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-medical-blue"
          />
          <div className="absolute inset-4 rounded-full bg-medical-blue-light flex items-center justify-center">
            <Stethoscope size={40} weight="duotone" className="text-medical-blue" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analyzing Your Image</h2>
          <p className="mt-2 text-slate-600">Our AI is examining the skin condition...</p>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/3 bg-medical-blue rounded-full"
          />
        </div>
      </motion.div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-slate-900 text-white py-12" data-testid="footer">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <FirstAidKit size={24} weight="fill" className="text-white" />
          </div>
          <span className="text-xl font-semibold">DermaScan AI</span>
        </div>
        <div className="text-center md:text-right">
          <p className="text-slate-400 text-sm">
            For educational and informational purposes only.
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Always consult a qualified healthcare professional for medical advice.
          </p>
        </div>
      </div>
    </div>
  </footer>
);

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('hero'); // hero, upload, analyzing, results
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleGetStarted = () => {
    setCurrentView('upload');
  };

  const handleImageUpload = async (imageData) => {
    setUploadedImage(imageData);
    setIsLoading(true);
    setCurrentView('analyzing');

    try {
      const response = await axios.post(`${API}/analyze`, {
        image_base64: imageData,
        mime_type: 'image/jpeg'
      });

      setAnalysisResult(response.data);
      setCurrentView('results');
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze image. Please try again.');
      setCurrentView('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setUploadedImage(null);
    setCurrentView('upload');
  };

  const handleDownloadPDF = () => {
    if (!analysisResult) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DermaScan AI', 20, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Skin Condition Analysis Report', 20, 33);

    // Date
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 60, 25);

    // Reset text color
    doc.setTextColor(0, 0, 0);
    let yPos = 55;

    // Condition Name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Detected Condition:', 20, yPos);
    doc.setTextColor(30, 58, 138);
    doc.text(analysisResult.condition_name, 20, yPos + 10);
    doc.setTextColor(0, 0, 0);
    yPos += 25;

    // Confidence & Severity
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Confidence Score: ${(analysisResult.confidence_score * 100).toFixed(0)}%`, 20, yPos);
    doc.text(`Severity: ${analysisResult.severity}`, 100, yPos);
    yPos += 15;

    // Description
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    const descLines = doc.splitTextToSize(analysisResult.description, pageWidth - 40);
    doc.text(descLines, 20, yPos);
    yPos += descLines.length * 6 + 10;

    // Analysis Notes
    doc.setFont('helvetica', 'bold');
    doc.text('AI Analysis Notes:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    const notesLines = doc.splitTextToSize(analysisResult.analysis_notes, pageWidth - 40);
    doc.text(notesLines, 20, yPos);
    yPos += notesLines.length * 6 + 10;

    // Treatments
    doc.setFont('helvetica', 'bold');
    doc.text('Suggested Treatments:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    analysisResult.treatments.forEach((treatment, index) => {
      const treatmentLines = doc.splitTextToSize(`${index + 1}. ${treatment}`, pageWidth - 45);
      doc.text(treatmentLines, 25, yPos);
      yPos += treatmentLines.length * 6 + 2;
    });
    yPos += 8;

    // Precautions
    doc.setFont('helvetica', 'bold');
    doc.text('Precautions:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    analysisResult.precautions.forEach((precaution, index) => {
      const precautionLines = doc.splitTextToSize(`${index + 1}. ${precaution}`, pageWidth - 45);
      doc.text(precautionLines, 25, yPos);
      yPos += precautionLines.length * 6 + 2;
    });

    // Disclaimer
    yPos = Math.max(yPos + 15, 240);
    doc.setFillColor(254, 243, 199);
    doc.rect(15, yPos - 5, pageWidth - 30, 35, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text('MEDICAL DISCLAIMER', 20, yPos + 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const disclaimerLines = doc.splitTextToSize(analysisResult.disclaimer, pageWidth - 45);
    doc.text(disclaimerLines, 20, yPos + 12);

    // Footer
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.text('This report is generated by DermaScan AI and is for informational purposes only.', pageWidth / 2, 285, { align: 'center' });

    doc.save(`DermaScan_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF report downloaded!');
  };

  return (
    <div className="app-container" data-testid="app-container">
      <Toaster position="top-center" richColors />
      <Navigation />
      
      <AnimatePresence mode="wait">
        {currentView === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroSection onGetStarted={handleGetStarted} />
          </motion.div>
        )}

        {currentView === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UploadSection onImageUpload={handleImageUpload} isLoading={isLoading} />
          </motion.div>
        )}

        {currentView === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnalyzingState />
          </motion.div>
        )}

        {currentView === 'results' && analysisResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultsSection
              result={analysisResult}
              imageData={uploadedImage}
              onNewAnalysis={handleNewAnalysis}
              onDownloadPDF={handleDownloadPDF}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default App;
