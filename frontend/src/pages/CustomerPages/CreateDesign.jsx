import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HangerScene from '../../components/Checkout/HangerScene';
import { Download, Save, ArrowLeft, Maximize2, Minimize2, Info } from 'lucide-react';

const CreateDesign = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const threeCanvasRef = useRef(null);

    // 3D Design state
    const [selectedHanger, setSelectedHanger] = useState(null);
    const [color, setColor] = useState('#A39F9F');
    const [customText, setCustomText] = useState('');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [customLogo, setCustomLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [textPosition, setTextPosition] = useState({ x: 0, y: 0, z: 0 });
    const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0, z: 0 });
    const [textSize, setTextSize] = useState(0.5);
    const [logoSize, setLogoSize] = useState(1);
    const [selectedMaterials, setSelectedMaterials] = useState({
        'Polypropylene (PP)': 100
    });

    // UI state
    const [showHangerSelection, setShowHangerSelection] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    const [saveDesignModal, setSaveDesignModal] = useState(false);
    const [designName, setDesignName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [notificationModal, setNotificationModal] = useState({ 
        show: false, 
        type: '', 
        message: '' 
    });

    const hangers = [
        { id: 'MB3', name: 'MB3' },
        { id: 'MB7', name: 'MB7' },
        { id: 'CQ-03', name: 'CQ-03' },
        { id: '97-11', name: '97-11' }
    ];

    const colors = [
        '#FF6B6B', '#FF8E8E', '#FFA07A', '#FFB347',
        '#9B59B6', '#E91E63', '#3B82F6', '#10B981',
        '#06B6D4', '#14B8A6', '#84CC16', '#EAB308'
    ];

    const materials = [
        { name: 'Polypropylene (PP)', description: 'Lightweight and durable' },
        { name: 'Polystyrene (PS)', description: 'Rigid and glossy' },
        { name: 'ABS', description: 'Impact-resistant' },
        { name: 'Nylon', description: 'Strong and flexible' },
        { name: 'Polycarbonate (PC)', description: 'Very strong and tough' }
    ];

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleMaterial = (materialName) => {
        setSelectedMaterials(prev => {
            const newMaterials = { ...prev };
            
            if (newMaterials[materialName]) {
                delete newMaterials[materialName];
                const remainingCount = Object.keys(newMaterials).length;
                if (remainingCount > 0) {
                    const evenPercentage = 100 / remainingCount;
                    Object.keys(newMaterials).forEach(key => {
                        newMaterials[key] = evenPercentage;
                    });
                }
            } else {
                newMaterials[materialName] = 0;
                const totalCount = Object.keys(newMaterials).length;
                const evenPercentage = 100 / totalCount;
                Object.keys(newMaterials).forEach(key => {
                    newMaterials[key] = evenPercentage;
                });
            }
            
            return newMaterials;
        });
    };

    const updateMaterialPercentage = (materialName, value) => {
        const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
        
        setSelectedMaterials(prev => {
            const newMaterials = { ...prev };
            const otherMaterials = Object.keys(newMaterials).filter(key => key !== materialName);
            
            if (otherMaterials.length === 0) {
                newMaterials[materialName] = newValue;
                return newMaterials;
            }
            
            newMaterials[materialName] = newValue;
            const remainingPercentage = 100 - newValue;
            const otherTotal = otherMaterials.reduce((sum, key) => sum + prev[key], 0);
            
            if (otherTotal > 0) {
                otherMaterials.forEach(key => {
                    const proportion = prev[key] / otherTotal;
                    newMaterials[key] = remainingPercentage * proportion;
                });
            } else {
                const evenShare = remainingPercentage / otherMaterials.length;
                otherMaterials.forEach(key => {
                    newMaterials[key] = evenShare;
                });
            }
            
            return newMaterials;
        });
    };

    const handleSaveDesign = async () => {
        if (!user || !user.userid) {
            setNotificationModal({ 
                show: true, 
                type: 'error', 
                message: 'Please log in to save designs' 
            });
            return;
        }

        setSaveDesignModal(true);
    };

    const confirmSaveDesign = async () => {
        if (!designName.trim()) {
            setNotificationModal({ 
                show: true, 
                type: 'error', 
                message: 'Please enter a name for your design' 
            });
            return;
        }

        setIsSaving(true);

        try {
            // Capture thumbnail from canvas
            let thumbnailBase64 = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 300));
                const canvas = threeCanvasRef.current?.querySelector('canvas');
                if (canvas) {
                    thumbnailBase64 = canvas.toDataURL('image/png');
                }
            } catch (thumbError) {
                console.warn('⚠️ Could not capture thumbnail:', thumbError);
            }

            const designData = {
                hangerType: selectedHanger,
                color: color,
                customText: customText || '',
                textColor: textColor,
                textPosition: textPosition,
                textSize: textSize,
                logoPreview: logoPreview || null,
                logoPosition: logoPosition,
                logoSize: logoSize,
                materials: selectedMaterials,
                designName: designName,
                thumbnail: thumbnailBase64,
                dateSaved: new Date().toISOString()
            };

            const payload = {
                userid: user.userid,
                customerid: user.customerid || null,
                designName: designName,
                hangerType: selectedHanger,
                selectedColor: color,
                customText: customText,
                textColor: textColor,
                textPosition: textPosition,
                textSize: textSize,
                logoPreview: logoPreview,
                logoPosition: logoPosition,
                logoSize: logoSize,
                materials: selectedMaterials,
                thumbnail: thumbnailBase64,
                designData: JSON.stringify(designData)
            };

            console.log('💾 Saving design...');

            const response = await fetch('https://gatsis-hub.vercel.app/designs/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save design');
            }

            const result = await response.json();
            console.log('✅ Design saved:', result.design);
            
            setSaveDesignModal(false);
            setDesignName('');
            setNotificationModal({ 
                show: true, 
                type: 'success', 
                message: `Design "${designName}" saved successfully! You can view it in Account Settings > Designs tab.` 
            });
        } catch (error) {
            console.error('❌ Error saving design:', error);
            setNotificationModal({ 
                show: true, 
                type: 'error', 
                message: error.message || 'Failed to save design. Please try again.' 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadDesign = async () => {
        if (!threeCanvasRef.current) {
            setNotificationModal({ 
                show: true, 
                type: 'error', 
                message: 'Please wait for the 3D model to load' 
            });
            return;
        }

        setIsDownloading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = threeCanvasRef.current.querySelector('canvas');
            if (!canvas) {
                throw new Error('Canvas not found. Make sure the 3D model is loaded.');
            }

            // Create design data JSON
            const designData = {
                hangerType: selectedHanger,
                color: color,
                customText: customText || '',
                textColor: textColor,
                textPosition: textPosition,
                textSize: textSize,
                logoPreview: logoPreview || null,
                logoPosition: logoPosition,
                logoSize: logoSize,
                materials: selectedMaterials,
                exportDate: new Date().toISOString()
            };

            // Download JSON
            const jsonBlob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const jsonLink = document.createElement('a');
            jsonLink.download = `hanger-design-${selectedHanger}-${Date.now()}.json`;
            jsonLink.href = jsonUrl;
            document.body.appendChild(jsonLink);
            jsonLink.click();
            document.body.removeChild(jsonLink);
            URL.revokeObjectURL(jsonUrl);

            // Download PNG
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `hanger-design-${selectedHanger}-${Date.now()}.png`;
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    setNotificationModal({ 
                        show: true, 
                        type: 'success', 
                        message: 'Design downloaded successfully! (PNG + JSON files)' 
                    });
                }
            }, 'image/png');

        } catch (error) {
            console.error('❌ Error downloading design:', error);
            setNotificationModal({ 
                show: true, 
                type: 'error', 
                message: `Failed to download design: ${error.message}` 
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleSelectHanger = (hangerId) => {
        setSelectedHanger(hangerId);
        setShowHangerSelection(false);
        setShowInstructionsModal(true);
    };

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isFullscreen]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Fullscreen Modal with Sidebar */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-[#353f94] z-50 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 bg-[#2c3575] backdrop-blur-sm border-b-2 border-yellow-400">
                        <div className="flex items-center gap-3">
                            <h3 className="text-white text-xl font-semibold">3D Design Studio</h3>
                            <span className="text-yellow-400 text-sm">({selectedHanger})</span>
                        </div>
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:bg-yellow-400 hover:text-[#353f94] p-2 rounded-lg transition-colors"
                            title="Exit Fullscreen"
                        >
                            <Minimize2 size={24} />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* 3D Canvas */}
                        <div className="flex-1 relative bg-gradient-to-br from-[#4a5899] to-[#353f94]">
                            {selectedHanger && (
                                <HangerScene
                                    hangerType={selectedHanger}
                                    color={color}
                                    customText={customText}
                                    textColor={textColor}
                                    logoPreview={logoPreview}
                                    textPosition={textPosition}
                                    logoPosition={logoPosition}
                                    textSize={textSize}
                                    logoSize={logoSize}
                                    onTextPositionChange={setTextPosition}
                                    onLogoPositionChange={setLogoPosition}
                                />
                            )}
                        </div>

                        {/* Customization Sidebar */}
                        <div className="w-80 bg-[#2c3575]/95 backdrop-blur-sm overflow-y-auto p-4 space-y-4 border-l-2 border-yellow-400">
                            {/* Hanger Type */}
                            <div className="bg-[#353f94]/70 rounded-lg p-4 border border-[#4a5899]">
                                <h4 className="text-yellow-400 font-semibold mb-3 text-sm">Hanger Type</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {hangers.map((hanger) => (
                                        <button
                                            key={hanger.id}
                                            onClick={() => setSelectedHanger(hanger.id)}
                                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                                selectedHanger === hanger.id
                                                    ? 'bg-yellow-400 text-[#353f94]'
                                                    : 'bg-[#4a5899] text-white hover:bg-yellow-400 hover:text-[#353f94]'
                                            }`}
                                        >
                                            {hanger.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color */}
                            <div className="bg-[#353f94]/70 rounded-lg p-4 border border-[#4a5899]">
                                <h4 className="text-yellow-400 font-semibold mb-3 text-sm">Color</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="w-12 h-12 rounded cursor-pointer border-2 border-yellow-400"
                                        />
                                        <input
                                            type="text"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="flex-1 bg-[#4a5899] text-white border border-yellow-400 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        />
                                    </div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {colors.map((col) => (
                                            <button
                                                key={col}
                                                onClick={() => setColor(col)}
                                                className="w-full aspect-square rounded border-2 border-[#4a5899] hover:border-yellow-400 transition-colors"
                                                style={{ backgroundColor: col }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Custom Text */}
                            <div className="bg-[#353f94]/70 rounded-lg p-4 border border-[#4a5899]">
                                <h4 className="text-yellow-400 font-semibold mb-3 text-sm">Custom Text</h4>
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="Enter text"
                                    className="w-full bg-[#4a5899] text-white border border-yellow-400 rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="text-white text-xs">Color:</label>
                                    <input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border-2 border-yellow-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-white text-xs">Position:</label>
                                        <button
                                            onClick={() => {
                                                setTextPosition({ x: 0, y: 0, z: 0 });
                                                setTextSize(0.5);
                                            }}
                                            className="text-xs text-yellow-400 hover:text-yellow-300 underline font-semibold"
                                        >
                                            Reset to Default
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-xs w-4">X:</span>
                                            <input
                                                type="range"
                                                min="-1"
                                                max="1"
                                                step="0.01"
                                                value={textPosition.x}
                                                onChange={(e) => setTextPosition({...textPosition, x: parseFloat(e.target.value)})}
                                                className="flex-1"
                                            />
                                            <span className="text-white text-xs w-12">{textPosition.x.toFixed(1)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-xs w-4">Y:</span>
                                            <input
                                                type="range"
                                                min="-1"
                                                max="1"
                                                step="0.01"
                                                value={textPosition.y}
                                                onChange={(e) => setTextPosition({...textPosition, y: parseFloat(e.target.value)})}
                                                className="flex-1"
                                            />
                                            <span className="text-white text-xs w-12">{textPosition.y.toFixed(1)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-xs w-4">Z:</span>
                                            <input
                                                type="range"
                                                min="-1"
                                                max="1"
                                                step="0.01"
                                                value={textPosition.z}
                                                onChange={(e) => setTextPosition({...textPosition, z: parseFloat(e.target.value)})}
                                                className="flex-1"
                                            />
                                            <span className="text-white text-xs w-12">{textPosition.z.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-white text-xs w-16">Size:</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.01"
                                            value={textSize}
                                            onChange={(e) => setTextSize(parseFloat(e.target.value))}
                                            className="flex-1"
                                        />
                                        <span className="text-white text-xs w-10">{textSize.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="bg-[#353f94]/70 rounded-lg p-4 border border-[#4a5899]">
                                <h4 className="text-yellow-400 font-semibold mb-3 text-sm">Logo</h4>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="w-full text-xs text-white file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-400 file:text-[#353f94] hover:file:bg-yellow-300 cursor-pointer"
                                />
                                {logoPreview && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain border-2 border-yellow-400 rounded bg-white" />
                                            <button
                                                onClick={() => {
                                                    setCustomLogo(null);
                                                    setLogoPreview(null);
                                                }}
                                                className="text-red-400 hover:text-red-300 text-xs font-semibold"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-white text-xs">Position:</label>
                                                <button
                                                    onClick={() => {
                                                        setLogoPosition({ x: 0, y: 0, z: 0 });
                                                        setLogoSize(1);
                                                    }}
                                                    className="text-xs text-yellow-400 hover:text-yellow-300 underline font-semibold"
                                                >
                                                    Reset to Default
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-xs w-4">X:</span>
                                                    <input
                                                        type="range"
                                                        min="-1"
                                                        max="1"
                                                        step="0.01"
                                                        value={logoPosition.x}
                                                        onChange={(e) => setLogoPosition({...logoPosition, x: parseFloat(e.target.value)})}
                                                        className="flex-1"
                                                    />
                                                    <span className="text-white text-xs w-12">{logoPosition.x.toFixed(1)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-xs w-4">Y:</span>
                                                    <input
                                                        type="range"
                                                        min="-1"
                                                        max="1"
                                                        step="0.01"
                                                        value={logoPosition.y}
                                                        onChange={(e) => setLogoPosition({...logoPosition, y: parseFloat(e.target.value)})}
                                                        className="flex-1"
                                                    />
                                                    <span className="text-white text-xs w-12">{logoPosition.y.toFixed(1)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-xs w-4">Z:</span>
                                                    <input
                                                        type="range"
                                                        min="-1"
                                                        max="1"
                                                        step="0.01"
                                                        value={logoPosition.z}
                                                        onChange={(e) => setLogoPosition({...logoPosition, z: parseFloat(e.target.value)})}
                                                        className="flex-1"
                                                    />
                                                    <span className="text-white text-xs w-12">{logoPosition.z.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-white text-xs w-16">Size:</label>
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="2"
                                                    step="0.01"
                                                    value={logoSize}
                                                    onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                                                    className="flex-1"
                                                />
                                                <span className="text-white text-xs w-10">{logoSize.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-[#2c3575] backdrop-blur-sm text-center border-t-2 border-yellow-400">
                        <p className="text-white text-sm">
                            Click and drag to rotate • Scroll to zoom • Press ESC to exit
                        </p>
                    </div>
                </div>
            )}

            {/* Hanger Selection Modal - Shows First */}
            {showHangerSelection && (
                <div className="fixed inset-0 bg-[rgba(143,143,143,0.65)] flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full p-8">
                        <h2 className="text-3xl font-bold text-[#35408E] mb-2 text-center">Choose Your Hanger Type</h2>
                        <p className="text-gray-600 text-center mb-8">Select a hanger model to start designing</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {hangers.map((hanger) => (
                                <button
                                    key={hanger.id}
                                    onClick={() => handleSelectHanger(hanger.id)}
                                    className="group relative bg-white border-2 border-gray-300 hover:border-[#35408E] rounded-xl p-6 transition-all hover:shadow-xl hover:scale-105"
                                >
                                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-[#35408E] group-hover:scale-110 transition-transform">
                                            {hanger.name}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-lg text-center">{hanger.name}</h3>
                                    <p className="text-sm text-gray-500 text-center mt-1">Model {hanger.id}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className="mt-8 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Only show main content after hanger is selected */}
            {selectedHanger && (
                <>
                    {/* Header */}
                    <div className="bg-white shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="flex items-center gap-2 text-gray-600 hover:text-[#35408E] transition-colors"
                                    >
                                        <ArrowLeft size={20} />
                                        <span>Back</span>
                                    </button>
                                    <h1 className="text-2xl font-bold text-[#35408E]">
                                        Create Design - {selectedHanger}
                                    </h1>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowInstructionsModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        <Info size={18} />
                                        <span className="hidden sm:inline">Instructions</span>
                                    </button>
                                    <button
                                        onClick={handleDownloadDesign}
                                        disabled={isDownloading}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Download size={18} />
                                        <span className="hidden sm:inline">
                                            {isDownloading ? 'Downloading...' : 'Download'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={handleSaveDesign}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#35408E] hover:bg-[#2a3270] text-white rounded-lg transition-colors"
                                    >
                                        <Save size={18} />
                                        <span className="hidden sm:inline">Save Design</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - 3D Viewer */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-[#4a5899] to-[#353f94] rounded-lg shadow-lg overflow-hidden border-2 border-yellow-400" style={{ height: '600px' }}>
                            <div className="relative h-full">
                                {/* 3D Canvas */}
                                <div ref={threeCanvasRef} className="w-full h-full">
                                    {selectedHanger && (
                                        <HangerScene
                                            hangerType={selectedHanger}
                                            color={color}
                                            customText={customText}
                                            textColor={textColor}
                                            logoPreview={logoPreview}
                                            textPosition={textPosition}
                                            logoPosition={logoPosition}
                                            textSize={textSize}
                                            logoSize={logoSize}
                                            onTextPositionChange={setTextPosition}
                                            onLogoPositionChange={setLogoPosition}
                                        />
                                    )}
                                </div>

                                {/* Fullscreen Toggle */}
                                <button
                                    onClick={toggleFullscreen}
                                    className="absolute top-4 right-4 p-2 bg-yellow-400 hover:bg-yellow-300 text-[#353f94] rounded-lg shadow-lg transition-colors"
                                >
                                    <Maximize2 size={20} />
                                </button>

                                {/* Info Overlay */}
                                <div className="absolute bottom-4 left-4 bg-[#2c3575]/90 text-white px-4 py-2 rounded-lg text-sm border border-yellow-400">
                                    <p className="font-semibold">Click and drag to rotate • Scroll to zoom</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Customization Options */}
                    <div className="space-y-6">
                        {/* Hanger Type Selection */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Hanger Type</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {hangers.map((hanger) => (
                                    <button
                                        key={hanger.id}
                                        onClick={() => setSelectedHanger(hanger.id)}
                                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                            selectedHanger === hanger.id
                                                ? 'border-[#35408E] bg-[#35408E] text-white'
                                                : 'border-gray-300 hover:border-[#35408E]'
                                        }`}
                                    >
                                        {hanger.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Color</h2>
                            <div className="grid grid-cols-6 gap-3 mb-4">
                                {colors.map((col) => (
                                    <button
                                        key={col}
                                        onClick={() => setColor(col)}
                                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                            color === col ? 'border-gray-800 scale-110' : 'border-gray-300'
                                        }`}
                                        style={{ backgroundColor: col }}
                                    />
                                ))}
                            </div>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full h-10 rounded-lg cursor-pointer"
                            />
                        </div>

                        {/* Custom Text */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Custom Text</h2>
                            <input
                                type="text"
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                placeholder="Enter text to display"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E] mb-3"
                            />
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium">Text Color:</label>
                                <input
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="w-16 h-8 rounded cursor-pointer"
                                />
                            </div>
                            <div className="mt-3">
                                <label className="text-sm font-medium block mb-2">Text Size: {textSize.toFixed(1)}</label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.1"
                                    value={textSize}
                                    onChange={(e) => setTextSize(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            {customText && (
                                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <label className="text-gray-600 block mb-1">X Position</label>
                                        <input
                                            type="number"
                                            value={textPosition.x}
                                            onChange={(e) => setTextPosition(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                                            className="w-full border rounded px-2 py-1"
                                            step="0.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 block mb-1">Y Position</label>
                                        <input
                                            type="number"
                                            value={textPosition.y}
                                            onChange={(e) => setTextPosition(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                                            className="w-full border rounded px-2 py-1"
                                            step="0.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 block mb-1">Z Position</label>
                                        <input
                                            type="number"
                                            value={textPosition.z}
                                            onChange={(e) => setTextPosition(prev => ({ ...prev, z: parseFloat(e.target.value) || 0 }))}
                                            className="w-full border rounded px-2 py-1"
                                            step="0.1"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Logo Upload */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Logo</h2>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#35408E] file:text-white hover:file:bg-[#2a3270] cursor-pointer"
                            />
                            {logoPreview && (
                                <div className="mt-3">
                                    <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain border rounded" />
                                    <div className="mt-3">
                                        <label className="text-sm font-medium block mb-2">Logo Size: {logoSize.toFixed(1)}</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="2"
                                            step="0.1"
                                            value={logoSize}
                                            onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <label className="text-gray-600 block mb-1">X Position</label>
                                            <input
                                                type="number"
                                                value={logoPosition.x}
                                                onChange={(e) => setLogoPosition(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                                                className="w-full border rounded px-2 py-1"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-gray-600 block mb-1">Y Position</label>
                                            <input
                                                type="number"
                                                value={logoPosition.y}
                                                onChange={(e) => setLogoPosition(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                                                className="w-full border rounded px-2 py-1"
                                                step="0.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-gray-600 block mb-1">Z Position</label>
                                            <input
                                                type="number"
                                                value={logoPosition.z}
                                                onChange={(e) => setLogoPosition(prev => ({ ...prev, z: parseFloat(e.target.value) || 0 }))}
                                                className="w-full border rounded px-2 py-1"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Materials */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Materials</h2>
                            <div className="space-y-3">
                                {materials.map((material) => (
                                    <div key={material.name}>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedMaterials[material.name]}
                                                    onChange={() => toggleMaterial(material.name)}
                                                    className="w-4 h-4 text-[#35408E] rounded"
                                                />
                                                <span className="text-sm font-medium">{material.name}</span>
                                            </label>
                                            {selectedMaterials[material.name] !== undefined && (
                                                <input
                                                    type="number"
                                                    value={Math.round(selectedMaterials[material.name])}
                                                    onChange={(e) => updateMaterialPercentage(material.name, e.target.value)}
                                                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                                                    min="0"
                                                    max="100"
                                                />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 ml-6">{material.description}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm font-semibold">
                                    Total: {Math.round(Object.values(selectedMaterials).reduce((a, b) => a + b, 0))}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions Modal */}
            {showInstructionsModal && (
                <div className="fixed inset-0 bg-[rgba(143,143,143,0.65)] flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Design Instructions</h2>
                            <div className="space-y-4 text-gray-700">
                                <div>
                                    <h3 className="font-semibold mb-2">🎨 Customization Options</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>Select hanger type (MB3, MB7, CQ-03, 97-11, or custom)</li>
                                        <li>Choose from preset colors or use custom color picker</li>
                                        <li>Add custom text with adjustable size and color</li>
                                        <li>Upload and position your logo</li>
                                        <li>Select materials and their percentages</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">🖱️ 3D Viewer Controls</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>Click and drag to rotate the hanger</li>
                                        <li>Scroll to zoom in/out</li>
                                        <li>Click fullscreen button for better view</li>
                                        <li>Press ESC to exit fullscreen</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">💾 Saving & Downloading</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>Save: Stores design in your account (requires login)</li>
                                        <li>Download: Exports PNG image + JSON data file</li>
                                        <li>View saved designs in Account Settings</li>
                                    </ul>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInstructionsModal(false)}
                                className="mt-6 w-full bg-[#35408E] hover:bg-[#2a3270] text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Design Modal */}
            {saveDesignModal && (
                <div className="fixed inset-0 bg-[rgba(143,143,143,0.65)] flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Save Design</h2>
                        <input
                            type="text"
                            value={designName}
                            onChange={(e) => setDesignName(e.target.value)}
                            placeholder="Enter design name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E] mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSaveDesignModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSaveDesign}
                                disabled={isSaving}
                                className="flex-1 bg-[#35408E] hover:bg-[#2a3270] text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
                </>
            )}

            {/* Notification Modal */}
            {notificationModal.show && (
                <div className="fixed inset-0 bg-[rgba(143,143,143,0.65)] flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-center mb-4">
                            {notificationModal.type === 'success' && (
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">✓</span>
                                </div>
                            )}
                            {notificationModal.type === 'error' && (
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">✕</span>
                                </div>
                            )}
                        </div>
                        <p className="text-center text-gray-700 mb-6">{notificationModal.message}</p>
                        {notificationModal.message.includes('log in') ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setNotificationModal({ show: false, type: '', message: '' })}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex-1 bg-[#35408E] hover:bg-[#2a3270] text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    Login
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setNotificationModal({ show: false, type: '', message: '' })}
                                className="w-full bg-[#35408E] hover:bg-[#2a3270] text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateDesign;
