import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HangerScene from '../../components/Checkout/HangerScene';
import { Download, Save, ArrowLeft, Maximize2, Minimize2, Info, Upload, Type, Image as ImageIcon, X, Plus, Minus } from 'lucide-react';
import ProductCard from '../../components/Checkout/productcard';
import LoadingSpinner from '../../components/LoadingSpinner';
import logo from '../../images/logo.png';
import styled from 'styled-components';

const ColorPickerWrapper = styled.div`
  .comic-panel {
    background: #ffffff;
    border: 4px solid #000;
    padding: 1.2rem;
    border-radius: 8px;
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 1);
  }

  .container-items {
    display: flex;
    transform-style: preserve-3d;
    transform: perspective(1000px);
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .item-color {
    position: relative;
    flex-shrink: 0;
    width: 40px;
    height: 48px;
    border: none;
    outline: none;
    background-color: transparent;
    transition: 300ms ease-out;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .item-color::after {
    position: absolute;
    content: "";
    inset: 0;
    width: 40px;
    height: 40px;
    background-color: var(--color);
    border-radius: 6px;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 0 #000;
    pointer-events: none;
    transition: 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .item-color::before {
    position: absolute;
    content: attr(aria-color);
    left: 50%;
    bottom: 60px;
    font-size: 16px;
    letter-spacing: 1px;
    line-height: 1;
    padding: 6px 10px;
    background-color: #fef3c7;
    color: #000;
    border: 3px solid #000;
    border-radius: 6px;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transform-origin: bottom center;
    transition:
      all 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
      opacity 300ms ease-out,
      visibility 300ms ease-out;
    transform: translateX(-50%) scale(0.5) translateY(10px);
    white-space: nowrap;
  }

  .item-color:hover {
    transform: scale(1.5) translateY(-5px);
    z-index: 99999;
  }

  .item-color:hover::before {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) scale(1) translateY(0);
  }

  .item-color:active::after {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 0 #000;
  }

  .item-color.selected::after {
    box-shadow: 0 0 0 3px #fbbf24, 4px 4px 0 0 #000;
  }

  .item-color:hover + * {
    transform: scale(1.3) translateY(-3px);
    z-index: 9999;
  }

  .item-color:hover + * + * {
    transform: scale(1.15);
    z-index: 999;
  }

  .item-color:has(+ *:hover) {
    transform: scale(1.3) translateY(-3px);
    z-index: 9999;
  }

  .item-color:has(+ * + *:hover) {
    transform: scale(1.15);
    z-index: 999;
  }
`;

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
    const [hangers, setHangers] = useState([]);
    const [materials, setMaterials] = useState([]);

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
    const [showColorLimitationModal, setShowColorLimitationModal] = useState(false);

    useEffect(() => {
        fetchProductsAndMaterials();
    }, []);

    const fetchProductsAndMaterials = async () => {
        try {
            const [productsRes, materialsRes] = await Promise.all([
                fetch('https://gatsis-hub.vercel.app/products?is_active=true'),
                fetch('https://gatsis-hub.vercel.app/materials?is_active=true')
            ]);

            const productsData = await productsRes.json();
            const materialsData = await materialsRes.json();

            setHangers((productsData.products || []).map(p => ({ id: p.productname, name: p.productname })));
            setMaterials((materialsData.materials || []).map(m => ({
                name: m.materialname,
                description: m.features && m.features[0] ? m.features[0] : 'High quality material'
            })));
        } catch (err) {
            console.error('Error fetching products/materials:', err);
        }
    };

    const colors = [
        '#e11d48', '#f472b6', '#fb923c', '#facc15',
        '#84cc16', '#10b981', '#0ea5e9', '#3b82f6',
        '#8b5cf6', '#a78bfa'
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
            let thumbnailBase64 = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 300));
                const canvas = threeCanvasRef.current?.querySelector('canvas');
                if (canvas) {
                    thumbnailBase64 = canvas.toDataURL('image/png');
                }
            } catch (thumbError) {
                console.error('Thumbnail error:', thumbError);
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
            console.log('Design saved:', result);

            setSaveDesignModal(false);
            setDesignName('');
            setNotificationModal({
                show: true,
                type: 'success',
                message: `Design "${designName}" saved successfully! You can view it in Account Settings > Designs tab.`
            });
        } catch (error) {
            console.error('Save error:', error);
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

            const jsonBlob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const jsonLink = document.createElement('a');
            jsonLink.download = `hanger-design-${selectedHanger}-${Date.now()}.json`;
            jsonLink.href = jsonUrl;
            document.body.appendChild(jsonLink);
            jsonLink.click();
            document.body.removeChild(jsonLink);
            URL.revokeObjectURL(jsonUrl);

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
            console.error('Download error:', error);
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
        
        if (hangerId === '97-12' || hangerId === '97-11') {
            setShowColorLimitationModal(true);
        }
    };

    const updateThreeJsColor = (newColor) => {
        setColor(newColor);
    };

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
            {/* Fullscreen 3D Viewer Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-[#191716] z-[200] flex flex-col">
                    {/* Header with Close Button */}
                    <div className="flex justify-between items-center p-3 md:p-4 bg-[#191716] backdrop-blur-sm border-b-2 border-[#E6AF2E]">
                        <div className="flex items-center gap-2 md:gap-3">
                            <h3 className="text-white text-base md:text-lg lg:text-xl font-semibold">3D Preview</h3>
                            <span className="text-[#E6AF2E] text-xs md:text-sm">({selectedHanger})</span>
                        </div>
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:bg-[#DC3545] hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
                            title="Exit Fullscreen"
                        >
                            <X size={20} className="md:w-6 md:h-6 cursor-pointer" />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        {/* 3D Canvas */}
                        <div className="flex-1 relative bg-gradient-to-br from-[#191716] to-[#191716]">
                            <Suspense
                                fallback={
                                    <div className="w-full h-full flex items-center justify-center">
                                        <LoadingSpinner size="xl" text="Loading 3D Model..." color="white" />
                                    </div>
                                }
                            >
                                <HangerScene
                                    color={color}
                                    hangerType={selectedHanger}
                                    customText={customText}
                                    textColor={textColor}
                                    textPosition={textPosition}
                                    textSize={textSize}
                                    logoPreview={logoPreview}
                                    logoPosition={logoPosition}
                                    logoSize={logoSize}
                                />
                            </Suspense>
                        </div>

                        {/* Customization Sidebar */}
                        <div className="w-full md:w-80 lg:w-96 bg-[#191716] backdrop-blur-sm overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 border-t-2 md:border-t-0 md:border-l-2 border-[#E6AF2E] max-h-[40vh] md:max-h-none">
                            {/* Color Picker */}
                            <div className="bg-[#191716]/70 rounded-lg p-3 md:p-4 border border-[#E6AF2E]">
                                <h4 className="text-[#E6AF2E] font-semibold mb-2 md:mb-3 text-xs md:text-sm">Color</h4>
                                <div className="space-y-2 md:space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) => updateThreeJsColor(e.target.value)}
                                            className="w-10 h-10 md:w-12 md:h-12 rounded cursor-pointer border-2 border-[#DC3545]"
                                        />
                                        <input
                                            type="text"
                                            value={color}
                                            onChange={(e) => updateThreeJsColor(e.target.value)}
                                            className="flex-1 bg-[#191716] text-white border border-[#E6AF2E] rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#E6AF2E]"
                                            placeholder="#4F46E5"
                                        />
                                    </div>
                                    {/* Comic Style Color Picker */}
                                    <ColorPickerWrapper>
                                        <div className="comic-panel" style={{background: '#191716', borderColor: '#E6AF2E'}}>
                                            <div className="container-items">
                                                {colors.map((col) => (
                                                    <button 
                                                        key={col}
                                                        className={`item-color ${color === col ? 'selected' : ''}`}
                                                        style={{'--color': col}} 
                                                        aria-color={col}
                                                        onClick={() => updateThreeJsColor(col)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </ColorPickerWrapper>
                                </div>
                            </div>

                            {/* Custom Text */}
                            <div className="bg-[#191716]/70 rounded-lg p-3 md:p-4 border border-[#E6AF2E]">
                                <h4 className="text-white font-semibold mb-2 md:mb-3 text-xs md:text-sm">Custom Text</h4>
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="Enter text"
                                    className="w-full bg-[#191716] text-white border border-[#E6AF2E] rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#E6AF2E]"
                                />
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="text-white text-xs">Color:</label>
                                    <input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border-2 border-[#DC3545]"
                                    />
                                    <input
                                        type="text"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="flex-1 bg-[#191716] text-white border border-[#E6AF2E] rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#E6AF2E]"
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
                                            className="text-xs text-yellow-400 hover:text-yellow-300 underline font-semibold cursor-pointer"
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
                                            max="2"
                                            step="0.01"
                                            value={textSize}
                                            onChange={(e) => setTextSize(parseFloat(e.target.value))}
                                            className="flex-1"
                                        />
                                        <span className="text-white text-xs w-10">{textSize.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="bg-[#191716]/70 rounded-lg p-3 md:p-4 border border-[#E6AF2E]">
                                <h4 className="text-[#E6AF2E] font-semibold mb-2 md:mb-3 text-xs md:text-sm">Logo</h4>
                                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#E6AF2E] rounded-lg p-2 md:p-3 cursor-pointer hover:bg-[#E6AF2E]/10 transition-colors">
                                    <ImageIcon size={16} className="text-white" />
                                    <span className="text-xs text-white ">
                                        {customLogo ? customLogo.name : 'Upload Logo'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                </label>
                                {logoPreview && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain border-2 border-[#DC3545] rounded bg-white" />
                                            <button
                                                onClick={() => {
                                                    setCustomLogo(null);
                                                    setLogoPreview(null);
                                                }}
                                                className="text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
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
                                                    className="text-xs text-yellow-400 hover:text-yellow-300 underline font-semibold cursor-pointer"
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

                    {/* Footer with Info */}
                    <div className="p-4 bg-[#191716] backdrop-blur-sm text-center border-t-2 border-[#DC3545]">
                        <p className="text-white text-sm">
                            Drag to rotate • Scroll to zoom • Right-click to pan • Press ESC
                            or click{" "}
                            <button
                                onClick={toggleFullscreen}
                                className="text-[#DC3545] hover:text-white underline ml-1 font-semibold cursor-pointer"
                            >
                                here
                            </button>{" "}
                            to exit
                        </p>
                    </div>
                </div>
            )}

            {/* Hanger Selection Modal */}
            {showHangerSelection && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full p-4 md:p-6 lg:p-8">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#191716] mb-2 text-center">Choose Your Hanger Type</h2>
                        <p className="text-sm md:text-base text-[#191716] text-center mb-6 md:mb-8">Select a hanger model to start designing</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                            {hangers.map((hanger) => (
                                <button
                                    key={hanger.id}
                                    onClick={() => handleSelectHanger(hanger.id)}
                                    className="group relative bg-white border-2 border-gray-300 hover:border-[#E6AF2E] rounded-xl p-3 md:p-4 lg:p-6 transition-all hover:shadow-xl hover:scale-105 cursor-pointer"
                                >
                                    <div className="aspect-square bg-gray-100 rounded-lg mb-2 md:mb-4 flex items-center justify-center">
                                        <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#E6AF2E] group-hover:scale-110 transition-transform">
                                            {hanger.name}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm md:text-base lg:text-lg text-center">{hanger.name}</h3>
                                    <p className="text-xs md:text-sm text-[#191716] text-center mt-1">Model {hanger.id}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className="mt-6 md:mt-8 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 md:py-3 px-4 md:px-6 rounded-lg transition-colors text-sm md:text-base cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content - Only show after hanger selection */}
            {selectedHanger && (
                <div className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-12">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-10">
                        Product Customization
                    </h1>

                    <section className="px-3 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                                <div className="flex flex-col gap-4 md:gap-6">
                                    {/* 3D Preview Container */}
                                    <div className="bg-gradient-to-br from-[#e6af2e] to-[#c82333] rounded-lg p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center relative border-2 border-[#DC3545] min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
                                        <button
                                            onClick={toggleFullscreen}
                                            className="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-300 text-[#353f94] p-2 rounded-lg transition-colors shadow-lg cursor-pointer"
                                            title="Fullscreen"
                                        >
                                            <Maximize2 size={20} />
                                        </button>

                                        <div ref={threeCanvasRef} className="w-full h-64 md:h-80 lg:h-96 rounded-lg">
                                            <Suspense fallback={
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <LoadingSpinner size="lg" text="Loading 3D Model..." color="white" />
                                                </div>
                                            }>
                                                {selectedHanger && (
                                                    <HangerScene
                                                        color={color}
                                                        hangerType={selectedHanger}
                                                        customText={customText}
                                                        textColor={textColor}
                                                        textPosition={textPosition}
                                                        textSize={textSize}
                                                        logoPreview={logoPreview}
                                                        logoPosition={logoPosition}
                                                        logoSize={logoSize}
                                                    />
                                                )}
                                            </Suspense>
                                        </div>

                                        <p className="text-white text-xs md:text-sm mt-3 md:mt-4 text-center font-semibold">
                                            Drag to rotate • Scroll to zoom • Right-click to pan
                                        </p>
                                    </div>

                                    {/* Hanger Selection - Compact Version */}
                                    <div className="bg-gradient-to-br from-[#e6af2e] to-[#c82333] rounded-lg border-2 border-gray-300 p-3">
                                        <h3 className="font-semibold mb-3 text-sm text-white">Type of Hanger</h3>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {hangers.map((hanger) => (
                                                <button
                                                    key={hanger.id}
                                                    onClick={() => {
                                                        setSelectedHanger(hanger.id);
                                                        if (hanger.id === '97-12' || hanger.id === '97-11') {
                                                            setShowColorLimitationModal(true);
                                                        }
                                                    }}
                                                    className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all w-20 cursor-pointer ${
                                                        selectedHanger === hanger.id
                                                            ? "border-[#007BFF] shadow-md"
                                                            : "border-gray-300 hover:border-gray-400"
                                                    }`}
                                                >
                                                    <div className="bg-white p-2 flex items-center justify-center aspect-square">
                                                        <div className="text-2xl">
                                                            <ProductCard />
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#DC3545] text-white py-1 font-semibold text-center text-xs">
                                                        {hanger.name}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 mt-4">
                                        <button 
                                            onClick={handleDownloadDesign}
                                            disabled={isDownloading}
                                            className="w-full bg-[#F5F5F5] hover:bg-[#e0e0e0] text-[#333333] font-semibold py-2 md:py-3 rounded flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base border border-gray-300"
                                        >
                                            {isDownloading ? (
                                                <>
                                                    <LoadingSpinner size="sm" color="black" />
                                                    Downloading...
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={18} className="md:w-5 md:h-5" />
                                                    Download Preview
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            onClick={handleSaveDesign}
                                            className="w-full bg-[#e6af2e] hover:bg-[#c8971e] text-white font-semibold py-2 md:py-3 rounded flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm md:text-base"
                                        >
                                            <Save size={18} className="md:w-5 md:h-5" />
                                            Save Design
                                        </button>
                                    </div>
                                </div>

                                {/* Customization Options */}
                                <div className="space-y-6">
                                    {/* Color Picker */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Pick a Color</h3>
                                        <div className="bg-white rounded-lg border p-4">
                                            {/* Live Preview */}
                                            <div
                                                className="relative h-32 rounded-lg mb-4 overflow-hidden border-2"
                                                style={{ backgroundColor: color }}
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                                        <span className="font-mono font-bold text-lg">
                                                            {color.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Color Input Controls */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <label className="text-sm font-medium">Hex:</label>
                                                <input
                                                    type="text"
                                                    value={color}
                                                    onChange={(e) => updateThreeJsColor(e.target.value)}
                                                    className="flex-1 border-2 rounded-lg px-3 py-2 text-sm font-mono focus:border-indigo-600 focus:outline-none transition-colors"
                                                    placeholder="#4F46E5"
                                                />
                                                <input
                                                    type="color"
                                                    value={color}
                                                    onChange={(e) => updateThreeJsColor(e.target.value)}
                                                    className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-indigo-600 transition-colors"
                                                    title="Pick a color"
                                                />
                                            </div>

                                            {/* Comic Style Color Picker */}
                                            <ColorPickerWrapper>
                                                <div className="comic-panel">
                                                    <div className="container-items">
                                                        {colors.map((col) => (
                                                            <button 
                                                                key={col}
                                                                className={`item-color ${color === col ? 'selected' : ''}`}
                                                                style={{'--color': col}} 
                                                                aria-color={col}
                                                                onClick={() => updateThreeJsColor(col)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </ColorPickerWrapper>
                                        </div>
                                    </div>

                                    {/* Custom Text */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Add Custom Text (Optional)</h3>
                                        <div className="bg-white rounded-lg border p-4 space-y-3">
                                            <input
                                                type="text"
                                                value={customText}
                                                onChange={(e) => setCustomText(e.target.value)}
                                                placeholder="Enter text to display on hanger"
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                maxLength={50}
                                            />
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-600">Text Size</label>
                                                    <input
                                                        type="range"
                                                        min="0.1"
                                                        max="1"
                                                        step="0.1"
                                                        value={textSize}
                                                        onChange={(e) => setTextSize(parseFloat(e.target.value))}
                                                        className="w-full"
                                                    />
                                                    <span className="text-xs">{textSize.toFixed(1)}x</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-600 block mb-2">
                                                    Text Color
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={textColor}
                                                        onChange={(e) => setTextColor(e.target.value)}
                                                        className="w-12 h-10 rounded cursor-pointer border"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={textColor}
                                                        onChange={(e) => setTextColor(e.target.value)}
                                                        className="flex-1 border rounded px-3 py-2 text-sm font-mono"
                                                        placeholder="#000000"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <label className="text-gray-600">X Position</label>
                                                    <input
                                                        type="number"
                                                        value={textPosition.x}
                                                        onChange={(e) =>
                                                            setTextPosition((prev) => ({
                                                                ...prev,
                                                                x: parseFloat(e.target.value) || 0,
                                                            }))
                                                        }
                                                        className="w-full border rounded px-2 py-1"
                                                        step="0.1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-gray-600">Y Position</label>
                                                    <input
                                                        type="number"
                                                        value={textPosition.y}
                                                        onChange={(e) =>
                                                            setTextPosition((prev) => ({
                                                                ...prev,
                                                                y: parseFloat(e.target.value) || 0,
                                                            }))
                                                        }
                                                        className="w-full border rounded px-2 py-1"
                                                        step="0.1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-gray-600">Z Position</label>
                                                    <input
                                                        type="number"
                                                        value={textPosition.z}
                                                        onChange={(e) =>
                                                            setTextPosition((prev) => ({
                                                                ...prev,
                                                                z: parseFloat(e.target.value) || 0,
                                                            }))
                                                        }
                                                        className="w-full border rounded px-2 py-1"
                                                        step="0.1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Logo */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Add Logo (Optional)</h3>
                                        <div className="bg-white rounded-lg border p-4 space-y-3">
                                            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-indigo-600 transition-colors">
                                                <ImageIcon size={20} />
                                                <span className="text-sm">
                                                    {customLogo
                                                        ? customLogo.name
                                                        : "Upload Logo (PNG, JPG, JPEG)"}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                />
                                            </label>

                                            {logoPreview && (
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        className="w-16 h-16 object-contain border rounded"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            setCustomLogo(null);
                                                            setLogoPreview(null);
                                                        }}
                                                        className="text-red-600 text-sm hover:underline cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}

                                            {customLogo && (
                                                <>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-600">Logo Size</label>
                                                        <input
                                                            type="range"
                                                            min="0.1"
                                                            max="2"
                                                            step="0.1"
                                                            value={logoSize}
                                                            onChange={(e) =>
                                                                setLogoSize(parseFloat(e.target.value))
                                                            }
                                                            className="w-full"
                                                        />
                                                        <span className="text-xs">{logoSize.toFixed(1)}x</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                        <div>
                                                            <label className="text-gray-600">X Position</label>
                                                            <input
                                                                type="number"
                                                                value={logoPosition.x}
                                                                onChange={(e) =>
                                                                    setLogoPosition((prev) => ({
                                                                        ...prev,
                                                                        x: parseFloat(e.target.value) || 0,
                                                                    }))
                                                                }
                                                                className="w-full border rounded px-2 py-1"
                                                                step="0.1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-gray-600">Y Position</label>
                                                            <input
                                                                type="number"
                                                                value={logoPosition.y}
                                                                onChange={(e) =>
                                                                    setLogoPosition((prev) => ({
                                                                        ...prev,
                                                                        y: parseFloat(e.target.value) || 0,
                                                                    }))
                                                                }
                                                                className="w-full border rounded px-2 py-1"
                                                                step="0.1"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-gray-600">Z Position</label>
                                                            <input
                                                                type="number"
                                                                value={logoPosition.z}
                                                                onChange={(e) =>
                                                                    setLogoPosition((prev) => ({
                                                                        ...prev,
                                                                        z: parseFloat(e.target.value) || 0,
                                                                    }))
                                                                }
                                                                className="w-full border rounded px-2 py-1"
                                                                step="0.1"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* Instructions Modal */}
            {showInstructionsModal && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <Info className="text-[#007BFF]" size={24} />
                                <h2 className="text-2xl font-bold text-[#007BFF]">
                                    Design Instructions
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowInstructionsModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 text-gray-700">
                            <div>
                                <h3 className="font-semibold mb-2">🎨 Customization Options</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Select hanger type from available models</li>
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
                            className="mt-6 w-full bg-[#E6AF2E] text-[#191716] hover:bg-[#191716] hover:text-white py-2 px-4 rounded-lg transition-colors cursor-pointer"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}

            {/* Save Design Modal */}
            {saveDesignModal && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-bold mb-4">Save Design</h2>
                        <input
                            type="text"
                            value={designName}
                            onChange={(e) => setDesignName(e.target.value)}
                            placeholder="Enter design name"
                            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35408E] mb-4 text-sm md:text-base"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSaveDesignModal(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm md:text-base cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSaveDesign}
                                disabled={isSaving}
                                className="flex-1 bg-[#35408E] hover:bg-[#2a3270] text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm md:text-base cursor-pointer"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Color Limitation Modal */}
            {showColorLimitationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[200]">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Info className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-center mb-4">Color Customization Notice</h3>

                        <p className="text-center text-gray-700 mb-6">
                            For Model <span className="font-semibold">{selectedHanger}</span>, kindly disregard the color change on hooks and bars. 
                            Color changes will only apply on the main body and clips.
                        </p>

                        <button
                            onClick={() => setShowColorLimitationModal(false)}
                            className="w-full px-4 py-2 bg-[#007BFF] text-white rounded hover:bg-[#0056b3] transition-colors cursor-pointer"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {notificationModal.show && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-4 md:p-6">
                        <div className="flex justify-center mb-4">
                            {notificationModal.type === 'success' && (
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl md:text-3xl">✓</span>
                                </div>
                            )}
                            {notificationModal.type === 'error' && (
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl md:text-3xl">✕</span>
                                </div>
                            )}
                        </div>
                        <p className="text-center text-gray-700 mb-6 text-sm md:text-base">{notificationModal.message}</p>
                        {notificationModal.message.includes('log in') ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setNotificationModal({ show: false, type: '', message: '' })}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm md:text-base cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex-1 bg-[#E6AF2E] text-[#191716] hover:bg-[#191716] hover:text-white py-2 px-4 rounded-lg transition-colors text-sm md:text-base cursor-pointer"
                                >
                                    Login
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setNotificationModal({ show: false, type: '', message: '' })}
                                className="w-full bg-[#35408E] hover:bg-[#2a3270] text-white py-2 px-4 rounded-lg transition-colors text-sm md:text-base cursor-pointer"
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