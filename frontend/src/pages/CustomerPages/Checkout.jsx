
import { button, div, label, li, span } from 'framer-motion/client'
import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef, Suspense } from 'react'
import ProductCard from '../../components/Checkout/productcard'
import preview3d from '../../images/preview3d.png'
import { Plus, Minus, Download, ChevronDown, X, Info, Upload, Type, Image as ImageIcon, Maximize2, Minimize2, Save } from 'lucide-react';
import validationIcon from '../../images/validation ico.png'
import { supabase } from '../../../supabaseClient'
import HangerScene from '../../components/Checkout/HangerScene'
import { useAuth } from '../../context/AuthContext'
import Stepper from '../../components/Checkout/CheckoutSteps/Stepper'
import StepNavigation from '../../components/Checkout/CheckoutSteps/StepNavigation'
import LoadingSpinner from '../../components/LoadingSpinner'


const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const threeCanvasRef = useRef(null);
    const { user } = useAuth();

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [saveDesignModal, setSaveDesignModal] = useState(false);
    const [designName, setDesignName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [sceneLoaded, setSceneLoaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [notificationModal, setNotificationModal] = useState({ show: false, type: '', message: '' });
    const [showColorLimitationModal, setShowColorLimitationModal] = useState(false);
    const [capturedThumbnail, setCapturedThumbnail] = useState(null);

    // Multi-step wizard
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    // Form state
    const [companyName, setCompanyName] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [selectedHanger, setSelectedHanger] = useState("MB3");
    const [selectedMaterials, setSelectedMaterials] = useState({});
    const [customDesignFile, setCustomDesignFile] = useState(null);

    // Order details state
    const [color, setColor] = useState("#A39F9F");
    const [quantity, setQuantity] = useState(130);
    const [orderInstructions, setOrderInstructions] = useState("");
    const [deliveryNotes, setDeliveryNotes] = useState("");
    const [selectedAddress, setSelectedAddress] = useState(0);

    // 3D Customization state
        const [customText, setCustomText] = useState("");
        const [textColor, setTextColor] = useState("#FFFFFF");
        const [customLogo, setCustomLogo] = useState(null);
        const [logoPreview, setLogoPreview] = useState(null);
        const [textPosition, setTextPosition] = useState({ x: 0, y: 0, z: 0 });
        const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0, z: 0 });
        const [textSize, setTextSize] = useState(0.5);
        const [logoSize, setLogoSize] = useState(1);

        // Set default positions/sizes for 97-12 and 97-11
        useEffect(() => {
            if (selectedHanger === "97-11") {
                setTextPosition({ x: 0, y: -0.045, z: 0.0537 });
                setLogoPosition({ x: 0, y: -0.04, z: 0.0561 });
                setTextSize(0.5);
                setLogoSize(1);
            } else if (selectedHanger === "97-12") {
                setTextPosition({ x: 0, y: -0.15, z: 0.06 });
                setLogoPosition({ x: 0, y: -0.17, z: 0.0611 });
                setTextSize(0.4);
                setLogoSize(0.6);
            } else {
                // Reset to default for MB3, CQ-807, and others
                setTextPosition({ x: 0, y: 0, z: 0 });
                setLogoPosition({ x: 0, y: 0, z: 0 });
                setTextSize(0.5);
                setLogoSize(1);
            }
        }, [selectedHanger]);
    const [addresses, setAddresses] = useState([]);
    const [hangers, setHangers] = useState([]);
    const [materials, setMaterials] = useState([]);

    // Predefined colors for quick selection
    const colors = [
        "#FF6B6B",
        "#FF8E8E",
        "#FFA07A",
        "#FFB347",
        "#9B59B6",
        "#E91E63",
        "#3B82F6",
        "#10B981",
        "#06B6D4",
        "#14B8A6",
        "#84CC16",
        "#EAB308",
    ];

    // Handlers
    const handleQuantityChange = (delta) => {
        setQuantity(Math.max(1, quantity + delta));
    };

    // Material selection and percentage distribution
    const toggleMaterial = (materialName) => {
        setSelectedMaterials((prev) => {
            const newMaterials = { ...prev };

            if (newMaterials[materialName]) {
                // Remove material
                delete newMaterials[materialName];

                // Redistribute percentages evenly among remaining materials
                const remainingCount = Object.keys(newMaterials).length;
                if (remainingCount > 0) {
                    const evenPercentage = 100 / remainingCount;
                    Object.keys(newMaterials).forEach((key) => {
                        newMaterials[key] = evenPercentage;
                    });
                }
            } else {
                // Add material
                newMaterials[materialName] = 0; // Temporarily set to 0

                // Redistribute percentages evenly among all materials
                const totalCount = Object.keys(newMaterials).length;
                const evenPercentage = 100 / totalCount;
                Object.keys(newMaterials).forEach((key) => {
                    newMaterials[key] = evenPercentage;
                });
            }

            return newMaterials;
        });
    };

    // Update material percentage and adjust others accordingly
    const updateMaterialPercentage = (materialName, value) => {
        const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));

        setSelectedMaterials((prev) => {
            const newMaterials = { ...prev };
            const otherMaterials = Object.keys(newMaterials).filter(
                (key) => key !== materialName
            );

            // If there are no other materials, just set the value
            if (otherMaterials.length === 0) {
                newMaterials[materialName] = newValue;
                return newMaterials;
            }

            // Set the new value for the changed material
            newMaterials[materialName] = newValue;

            // Calculate remaining percentage to distribute among other materials
            const remainingPercentage = 100 - newValue;

            // Get current total of other materials
            const otherTotal = otherMaterials.reduce(
                (sum, key) => sum + prev[key],
                0
            );

            // Redistribute remaining percentage proportionally among other materials
            if (otherTotal > 0) {
                // Distribute proportionally based on current percentages
                otherMaterials.forEach((key) => {
                    const proportion = prev[key] / otherTotal;
                    newMaterials[key] = remainingPercentage * proportion;
                });
            } else {
                // If other materials are at 0, distribute evenly
                const evenShare = remainingPercentage / otherMaterials.length;
                otherMaterials.forEach((key) => {
                    newMaterials[key] = evenShare;
                });
            }

            return newMaterials;
        });
    };

    // Handle logo upload and preview
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
            if (!allowedTypes.includes(file.type.toLowerCase())) {
                showNotification('Please upload a PNG, JPG, or JPEG image file');
                e.target.value = ''; // Reset input
                return;
            }

            // Validate file size (5MB = 5 * 1024 * 1024 bytes)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                showNotification('Logo file size must be less than 5MB');
                e.target.value = ''; // Reset input
                return;
            }

            setCustomLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomDesignUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomDesignFile(file);
        }
    };

    // Three.js color update callback (to be connected when Three.js is integrated)
    const updateThreeJsColor = (newColor) => {
        setColor(newColor);
        // TODO: Update Three.js material color when integrated
        // if (threeMaterialRef.current) {
        //     threeMaterialRef.current.color.set(newColor);
        // }
    };

    // Toggle fullscreen for 3D viewer
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Show notification modal
    const showNotification = (message, type = 'error') => {
        setNotificationModal({ show: true, type, message });
    };

    const closeNotification = () => {
        setNotificationModal({ show: false, type: '', message: '' });
    };

    // Form validation
    const validateForm = () => {
        if (!companyName.trim()) {
            showNotification("Please enter company name");
            return false;
        }
        if (!contactPerson.trim()) {
            showNotification("Please enter contact person name");
            return false;
        }
        if (!contactPhone.trim()) {
            showNotification("Please enter contact phone");
            return false;
        }
        if (Object.keys(selectedMaterials).length === 0) {
            showNotification("Please select at least one material");
            return false;
        }
        const totalPercentage = Object.values(selectedMaterials).reduce(
            (sum, val) => sum + val,
            0
        );
        if (Math.abs(totalPercentage - 100) > 0.1) {
            showNotification(
                `Material percentages must total 100%. Current total: ${totalPercentage}%`
            );
            return false;
        }
        if (quantity < 100) {
            showNotification("Minimum order quantity is 100 pieces");
            return false;
        }
        return true;
    };

    // Submit order
    const handleSubmitOrder = async () => {
        if (!validateForm()) {
            return;
        }

        // Get user data from localStorage (assuming user is logged in)
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = userData.userid || null;

        // Use the pre-captured thumbnail or try to capture one now if it wasn't captured
        let thumbnailBase64 = capturedThumbnail;
        if (!thumbnailBase64) {
            console.warn('Thumbnail was not captured during navigation, attempting to capture now...');
            thumbnailBase64 = await captureThumbnail();
        }

        // Prepare complete 3D design data for database storage and admin viewing
        const threeDDesignData = {
            hangerType: selectedHanger,
            color: color,
            customText: customText || null,
            textColor: textColor,
            textPosition: textPosition,
            textSize: textSize,
            logoFileName: customLogo ? customLogo.name : null,
            logoPreview: logoPreview || null, // Base64 encoded image
            logoPosition: logoPosition,
            logoSize: logoSize,
            materials: selectedMaterials,
            quantity: quantity,
            timestamp: new Date().toISOString(),
            thumbnail: thumbnailBase64, // Add thumbnail for order preview
        };

        // Prepare order data
        const orderData = {
            userid: userId,
            companyName,
            contactPerson,
            contactPhone,
            hangerType: selectedHanger,
            materialType: Object.keys(selectedMaterials)[0], // Primary material
            quantity: quantity,
            materials: selectedMaterials,
            designOption: selectedHanger === "own" ? "custom" : "default",
            customDesignUrl: customDesignFile ? customDesignFile.name : null,
            selectedColor: color,
            customText: customText || null,
            textColor: textColor,
            textPosition: customText ? textPosition : null,
            textSize: customText ? textSize : null,
            customLogo: customLogo ? customLogo.name : null,
            logoPosition: customLogo ? logoPosition : null,
            logoSize: customLogo ? logoSize : null,
            deliveryNotes: deliveryNotes || null,
            orderInstructions: orderInstructions || null,
            deliveryAddress:
                addresses.length > 0 && addresses[selectedAddress]?.address
                    ? addresses[selectedAddress].address
                    : `${companyName}, ${contactPhone}`, // Use company info as fallback address
            threeDDesignData: JSON.stringify(threeDDesignData), // Store complete design as JSON
        };





        try {
            // Submit to backend
            const response = await fetch(
                "https://gatsis-hub.vercel.app/orders/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderData),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create order");
            }

            // Also save to localStorage for backward compatibility with Order.jsx
            const localOrderData = {
                id: result.order.orderid,
                orderNumber: `ORD-${new Date().getFullYear()}${String(
                    new Date().getMonth() + 1
                ).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000) + 1000
                    }`,
                companyName,
                contactPerson,
                contactPhone,
                customerName: contactPerson,
                status: "For Evaluation",
                statusColor: "bg-yellow-400",
                price: "₱0",
                details: {
                    company: companyName,
                    orderPlaced: new Date().toLocaleDateString(),
                    quantity: `${quantity}x`,
                    product: selectedHanger,
                    color: color,
                    materials: Object.entries(selectedMaterials).map(
                        ([name, percentage]) => ({
                            name,
                            percentage: `${percentage}%`,
                        })
                    ),
                    deliveryAddress: addresses.length > 0 && addresses[selectedAddress]?.address
                        ? addresses[selectedAddress].address
                        : `${companyName}, ${contactPhone}`,
                    notesAndInstruction: orderInstructions,
                    deliveryNotes: deliveryNotes,
                    designFile: customDesignFile ? customDesignFile.name : null,
                    customization: {
                        text: customText,
                        textPosition,
                        textSize,
                        hasLogo: !!customLogo,
                        logoFileName: customLogo ? customLogo.name : null,
                        logoPosition,
                        logoSize,
                    },
                },
            };

            const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
            existingOrders.unshift(localOrderData);
            localStorage.setItem("orders", JSON.stringify(existingOrders));

            // Show success modal and redirect to orders page after 2 seconds
            setShowModal(true);
            setTimeout(() => {
                navigate("/orders");
            }, 2000);
        } catch (error) {

            showNotification(`Failed to create order: ${error.message}`);
        }
    };

    // Download design as PNG + JSON
    const handleDownloadDesign = async () => {
        if (!threeCanvasRef.current) {
            showNotification('Please wait for the 3D model to load');
            return;
        }

        setIsDownloading(true);

        try {
            // Wait a moment for the canvas to fully render
            await new Promise(resolve => setTimeout(resolve, 500));

            // Get the canvas element
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
                quantity: quantity,
                exportDate: new Date().toISOString()
            };

            // Download JSON data first
            const jsonBlob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const jsonLink = document.createElement('a');
            jsonLink.download = `hanger-design-${selectedHanger}-${Date.now()}.json`;
            jsonLink.href = jsonUrl;
            document.body.appendChild(jsonLink);
            jsonLink.click();
            document.body.removeChild(jsonLink);
            URL.revokeObjectURL(jsonUrl);

            // Try to capture the canvas as PNG
            try {
                // Use toBlob for better quality
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
                    } else {
                        throw new Error('Failed to capture canvas');
                    }
                }, 'image/png');
            } catch (pngError) {

                // Fallback to toDataURL
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.download = `hanger-design-${selectedHanger}-${Date.now()}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setNotificationModal({ 
                    show: true, 
                    type: 'success', 
                    message: 'Design downloaded successfully! (PNG + JSON files)' 
                });
            }

        } catch (error) {

            setNotificationModal({ 
                show: true, 
                type: 'error', 
                message: `Failed to download design: ${error.message}` 
            });
        } finally {
            setIsDownloading(false);
        }
    };

    // Save design to database
    const handleSaveDesign = async () => {
        if (!user || !user.userid) {
            setNotificationModal({ 
                show: true, 
                type: 'error', 
                message: 'Please log in to save designs' 
            });
            return;
        }

        // Open modal to get design name
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
            // Capture thumbnail from canvas with better framing
            let thumbnailBase64 = null;
            try {
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait for canvas to render
                const canvas = threeCanvasRef.current?.querySelector('canvas');
                if (canvas) {
                    // Create a thumbnail by detecting the non-background bounds so the hanger is centered
                    const thumbnailCanvas = document.createElement('canvas');
                    const thumbnailSize = 400; // square thumbnail
                    thumbnailCanvas.width = thumbnailSize;
                    thumbnailCanvas.height = thumbnailSize;
                    const ctx = thumbnailCanvas.getContext('2d');

                    // Read pixel data from source canvas
                    try {
                        const sw = canvas.width;
                        const sh = canvas.height;
                        const tmpCtx = canvas.getContext('2d');
                        const imgData = tmpCtx.getImageData(0, 0, sw, sh).data;

                        // detect bounds of non-white pixels (simple background detection)
                        let minX = sw, minY = sh, maxX = 0, maxY = 0;
                        const thresh = 250; // near-white threshold
                        for (let y = 0; y < sh; y += 2) { // step by 2 for speed
                            for (let x = 0; x < sw; x += 2) {
                                const i = (y * sw + x) * 4;
                                const r = imgData[i], g = imgData[i + 1], b = imgData[i + 2], a = imgData[i + 3];
                                // consider pixel non-background if not nearly white and not transparent
                                if (a > 10 && !(r > thresh && g > thresh && b > thresh)) {
                                    if (x < minX) minX = x;
                                    if (y < minY) minY = y;
                                    if (x > maxX) maxX = x;
                                    if (y > maxY) maxY = y;
                                }
                            }
                        }

                        // if no non-background detected, fallback to center crop
                        if (minX > maxX || minY > maxY) {
                            const sourceSize = Math.min(sw, sh);
                            const cropSize = sourceSize * 0.7; // slightly zoomed
                            const sourceX = (sw - cropSize) / 2;
                            const sourceY = (sh - cropSize) / 2;
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, thumbnailSize, thumbnailSize);
                            ctx.drawImage(canvas, sourceX, sourceY, cropSize, cropSize, 0, 0, thumbnailSize, thumbnailSize);
                        } else {
                            // add padding around detected bounds
                            const pad = 20; // pixels
                            minX = Math.max(0, minX - pad);
                            minY = Math.max(0, minY - pad);
                            maxX = Math.min(sw, maxX + pad);
                            maxY = Math.min(sh, maxY + pad);

                            const cropW = maxX - minX;
                            const cropH = maxY - minY;
                            // make crop square by expanding the smaller dimension
                            const cropSize = Math.max(cropW, cropH);
                            let sx = minX - Math.floor((cropSize - cropW) / 2);
                            let sy = minY - Math.floor((cropSize - cropH) / 2);
                            // clamp
                            sx = Math.max(0, Math.min(sx, sw - cropSize));
                            sy = Math.max(0, Math.min(sy, sh - cropSize));

                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, thumbnailSize, thumbnailSize);
                            ctx.drawImage(canvas, sx, sy, cropSize, cropSize, 0, 0, thumbnailSize, thumbnailSize);
                        }

                        thumbnailBase64 = thumbnailCanvas.toDataURL('image/png', 0.7);

                    } catch (e) {
                        // If reading pixel data fails (tainted canvas), fallback to simple center draw

                        const sourceSize = Math.min(canvas.width, canvas.height);
                        const cropSize = sourceSize * 0.7;
                        const sourceX = (canvas.width - cropSize) / 2;
                        const sourceY = (canvas.height - cropSize) / 2;
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, thumbnailSize, thumbnailSize);
                        ctx.drawImage(canvas, sourceX, sourceY, cropSize, cropSize, 0, 0, thumbnailSize, thumbnailSize);
                        thumbnailBase64 = thumbnailCanvas.toDataURL('image/png', 0.7);
                    }
                }
            } catch (thumbError) {

                // Continue without thumbnail
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
                thumbnail: thumbnailBase64, // Add thumbnail to design data
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
                thumbnail: thumbnailBase64, // Include thumbnail
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
                const errorText = await response.text();

                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            setSaveDesignModal(false);
            setDesignName('');
            setNotificationModal({ 
                show: true, 
                type: 'success', 
                message: `Design "${designName}" saved successfully! You can view it in Account Settings > Designs tab.` 
            });
        } catch (error) {

            // More detailed error message
            let errorMessage = '';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Cannot connect to server. The designs feature may not be deployed yet. Please check that the SQL update was run and the backend is deployed.';
            } else {
                errorMessage = `Failed to save design: ${error.message}`;
            }
            
            setNotificationModal({ 
                show: true, 
                type: 'error', 
                message: errorMessage 
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Fetch customer data from database
    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem("user") || "{}");
                const userId = userData.userid;

                if (!userId) {

                    return;
                }

                // Fetch customer data from Supabase
                const { data: customer, error } = await supabase
                    .from("customers")
                    .select("*")
                    .eq("userid", userId)
                    .single();

                if (error) {

                    return;
                }

                if (customer) {
                    // Pre-fill company information
                    setCompanyName(customer.companyname || "");
                    setContactPerson(customer.companyname || ""); // You can add a separate contact person field in DB if needed
                    setContactPhone(customer.companynumber || "");

                    // Load addresses from database
                    if (customer.addresses && Array.isArray(customer.addresses) && customer.addresses.length > 0) {
                        setAddresses(customer.addresses);

                        // Automatically select the default address
                        const defaultAddressIndex = customer.addresses.findIndex(addr => addr.isDefault);
                        if (defaultAddressIndex !== -1) {
                            setSelectedAddress(defaultAddressIndex);

                        } else {
                            // If no default, select the first address
                            setSelectedAddress(0);

                        }
                    } else {

                    }
                }
            } catch (error) {

            }
        };

        fetchCustomerData();
        setShowInstructionsModal(true);
    }, []);

    // Fetch products and materials
    useEffect(() => {
        const fetchProductsAndMaterials = async () => {
            try {
                // Fetch products (hangers)
                const productsResponse = await fetch('https://gatsis-hub.vercel.app/products?is_active=true');
                const productsData = await productsResponse.json();
                
                if (productsData.products) {
                    const mappedHangers = productsData.products.map(product => ({
                        id: product.productname,
                        name: product.productname,
                        description: product.description || ''
                    }));
                    setHangers(mappedHangers);
                }
                
                // Fetch materials
                const materialsResponse = await fetch('https://gatsis-hub.vercel.app/materials?is_active=true');
                const materialsData = await materialsResponse.json();
                
                if (materialsData.materials) {
                    const mappedMaterials = materialsData.materials.map(material => ({
                        name: material.materialname,
                        features: material.features || []
                    }));
                    setMaterials(mappedMaterials);
                }
            } catch (error) {
                console.error('Error fetching products and materials:', error);
                showNotification('Failed to load products and materials. Please refresh the page.');
            }
        };

        fetchProductsAndMaterials();
    }, []);

    // Load saved design if navigated from saved designs
    useEffect(() => {
        if (location.state?.loadDesign && location.state?.designData) {
            const designData = location.state.designData;

            try {
                // Apply design data to state
                if (designData.hangerType) setSelectedHanger(designData.hangerType);
                if (designData.color || designData.selectedColor) setColor(designData.color || designData.selectedColor);
                if (designData.customText) setCustomText(designData.customText);
                if (designData.textColor) setTextColor(designData.textColor);
                if (designData.textPosition) setTextPosition(designData.textPosition);
                if (designData.textSize) setTextSize(designData.textSize);
                if (designData.logoPreview) setLogoPreview(designData.logoPreview);
                if (designData.logoPosition) setLogoPosition(designData.logoPosition);
                if (designData.logoSize) setLogoSize(designData.logoSize);
                if (designData.materials) setSelectedMaterials(designData.materials);
                
                // Show success message (without setTimeout to avoid doubling)
                setNotificationModal({ 
                    show: true, 
                    type: 'success', 
                    message: `Design "${designData.designName || 'Untitled'}" loaded successfully! You can modify it and place an order.` 
                });
                
                // Clear the location state to prevent reloading on refresh
                window.history.replaceState({}, document.title);
            } catch (error) {

                setNotificationModal({ 
                    show: true, 
                    type: 'error', 
                    message: 'Failed to load design data. Please try again.' 
                });
            }
        }
    }, [location.state]);

    // Handle ESC key to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFullscreen]);

    // Material percentage handling
    
    // Function to capture thumbnail from 3D canvas
    const captureThumbnail = async () => {
        try {
            // Try multiple times with increasing delays
            for (let attempt = 0; attempt < 5; attempt++) {
                await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
                const canvas = threeCanvasRef.current?.querySelector('canvas');
                
                if (canvas && canvas.width > 0 && canvas.height > 0) {
                    console.log('Capturing thumbnail from canvas (attempt', attempt + 1, '):', canvas.width, 'x', canvas.height);
                    
                    const thumbnailCanvas = document.createElement('canvas');
                    const thumbnailSize = 400;
                    thumbnailCanvas.width = thumbnailSize;
                    thumbnailCanvas.height = thumbnailSize;
                    const ctx = thumbnailCanvas.getContext('2d');
                    
                    // Simple center crop
                    const sourceSize = Math.min(canvas.width, canvas.height);
                    const cropSize = sourceSize * 0.7;
                    const sourceX = (canvas.width - cropSize) / 2;
                    const sourceY = (canvas.height - cropSize) / 2;
                    
                    // White background
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, thumbnailSize, thumbnailSize);
                    
                    // Draw the cropped canvas
                    ctx.drawImage(canvas, sourceX, sourceY, cropSize, cropSize, 0, 0, thumbnailSize, thumbnailSize);
                    
                    // Convert to base64
                    const thumbnailBase64 = thumbnailCanvas.toDataURL('image/png', 0.8);
                    console.log('Thumbnail generated successfully, size:', thumbnailBase64.length);
                    setCapturedThumbnail(thumbnailBase64);
                    return thumbnailBase64;
                } else {
                    console.warn('Canvas not ready or invalid dimensions (attempt', attempt + 1, ')');
                }
            }
            console.error('Failed to capture thumbnail after 5 attempts');
            return null;
        } catch (error) {
            console.error('Error capturing thumbnail:', error);
            return null;
        }
    };
    
    // Navigation
    const nextStep = async () => {
        if (validateCurrentStep()) {
            // Capture thumbnail when leaving step 1 (3D customization step)
            if (currentStep === 1 && !capturedThumbnail) {
                await captureThumbnail();
            }
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToStep = (step) => {
        if (step < currentStep) {
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const validateCurrentStep = () => {
        if (currentStep === 1) {
            if (!selectedHanger) {
                setNotificationModal({ show: true, type: 'error', message: 'Please select a hanger type' });
                return false;
            }
            if (selectedHanger === "own" && !customDesignFile) {
                setNotificationModal({ show: true, type: 'error', message: 'Please upload your custom design file' });
                return false;
            }
            if (quantity < 100) {
                setNotificationModal({ show: true, type: 'error', message: 'Minimum order quantity is 100 pieces' });
                return false;
            }
        } else if (currentStep === 2) {
            if (Object.keys(selectedMaterials).length === 0) {
                setNotificationModal({ show: true, type: 'error', message: 'Please select at least one material' });
                return false;
            }
            const totalPercentage = Object.values(selectedMaterials).reduce((sum, val) => sum + parseFloat(val || 0), 0);
            if (Math.abs(totalPercentage - 100) > 0.01) {
                setNotificationModal({ show: true, type: 'error', message: `Material percentages must total 100%. Current total: ${totalPercentage.toFixed(1)}%` });
                return false;
            }
        } else if (currentStep === 3) {
            if (!companyName.trim() || !contactPerson.trim() || !contactPhone.trim()) {
                setNotificationModal({ show: true, type: 'error', message: 'Please fill in all company information' });
                return false;
            }
            if (!addresses || addresses.length === 0) {
                setNotificationModal({ show: true, type: 'error', message: 'Please add a delivery address' });
                return false;
            }
        }
        return true;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Sticky Stepper */}
            {!isFullscreen && !showModal && !saveDesignModal && !showInstructionsModal && !showColorLimitationModal && !notificationModal.show && (
                <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-gray-50 shadow-lg border-b-2 border-gray-300">
                    <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 py-3 md:py-4">
                        <Stepper currentStep={currentStep} totalSteps={totalSteps} goToStep={goToStep} />
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8 mt-20 md:mt-24">

                {currentStep === 1 && (
                    <>
            {/* product customization */}
            <section className="px-3 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8">
                <h2 className="text-center text-black text-2xl md:text-3xl lg:text-4xl font-medium mb-6 md:mb-10">
                    Product Customization
                </h2>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                    <div className="flex flex-col gap-4 md:gap-6">
                        {/* Three.js 3D Preview Container */}
                        <div className="bg-gradient-to-br from-[#007BFF] to-[#0056b3] rounded-lg p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center relative border-2 border-[#DC3545] min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
                            {/* Fullscreen Button */}
                            <button
                                onClick={toggleFullscreen}
                                className="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-300 text-[#353f94] p-2 rounded-lg transition-colors shadow-lg"
                                title="Fullscreen"
                            >
                                <Maximize2 size={20} />
                            </button>

                            {/* Three.js Canvas */}
                            <div ref={threeCanvasRef} className="w-full h-64 md:h-80 lg:h-96 rounded-lg">
                                <Suspense
                                    fallback={
                                        <div className="w-full h-full flex items-center justify-center bg-[#007BFF] rounded-lg">
                                            <LoadingSpinner size="lg" text="Loading 3D Model..." color="white" />
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
                                        onSceneReady={() => setSceneLoaded(true)}
                                    />
                                </Suspense>
                            </div>

                            <p className="text-white text-xs md:text-sm mt-3 md:mt-4 text-center font-semibold">
                                Drag to rotate • Scroll to zoom • Right-click to pan
                            </p>
                        </div>

                        {/* Hanger Selection - Compact Version */}
                        <div className="bg-white rounded-lg border-2 border-gray-300 p-3">
                            <h3 className="font-semibold mb-3 text-sm">Type of Hanger</h3>
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
                                        className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all w-20 ${
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
                            
                            {/* Custom Design Upload */}
                            {selectedHanger === "own" && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold mb-2 text-xs">Upload Your Custom Design</h4>
                                    <p className="text-xs text-gray-600 mb-2">
                                        Accepted formats: STL, OBJ, STEP, PDF
                                    </p>
                                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-400 rounded-lg p-3 cursor-pointer hover:border-[#007BFF] transition-colors">
                                        <Upload size={16} />
                                        <span className="text-xs">
                                            {customDesignFile
                                                ? customDesignFile.name
                                                : "Click to upload"}
                                        </span>
                                        <input
                                            type="file"
                                            accept=".stl,.obj,.step,.pdf"
                                            onChange={handleCustomDesignUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* quantity selector */}
                        <div className="flex flex-col justify-center items-center">
                            <h3 className="font-semibold mb-3 text-sm md:text-base">Quantity of Hangers</h3>
                            <p className="text-xs text-gray-600 mb-2">
                                Minimum order quantity is 100 pieces
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleQuantityChange(-10)}
                                    className="bg-white border rounded p-2 hover:bg-gray-100"
                                >
                                    <Minus size={18} className="md:w-5 md:h-5" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="border rounded px-3 md:px-4 py-2 text-center w-20 md:w-24 text-sm md:text-base"
                                />
                                <button
                                    onClick={() => handleQuantityChange(10)}
                                    className="bg-white border rounded p-2 hover:bg-gray-100"
                                >
                                    <Plus size={18} className="md:w-5 md:h-5" />
                                </button>
                            </div>
                        </div>
                        {/* order instructions */}
                        <div className="flex flex-col justify-center">
                            <h3 className="font-semibold mb-3 text-sm md:text-base">
                                Order Instruction (optional)
                            </h3>
                            <textarea
                                value={orderInstructions}
                                onChange={(e) => setOrderInstructions(e.target.value)}
                                placeholder="Type your instructions here..."
                                className="w-full border rounded px-3 py-2 h-20 md:h-24 text-sm md:text-base"
                            ></textarea>
                        </div>
                        {/* action buttons */}
                        <div className="space-y-2 mt-4">
                            <button 
                                onClick={handleDownloadDesign}
                                disabled={isDownloading}
                                className="w-full bg-[#F5F5F5] hover:bg-[#e0e0e0] text-[#333333] font-semibold py-2 md:py-3 rounded flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base border border-gray-300"
                            >
                                {isDownloading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
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
                                className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white font-semibold py-2 md:py-3 rounded flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm md:text-base"
                            >
                                <Save size={18} className="md:w-5 md:h-5" />
                                Save Design
                            </button>
                        </div>
                    </div>

                    {/* customization options */}
                    <div className="space-y-6">
                        {/* color picker */}
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

                                {/* Preset Colors Grid */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Quick Select:
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {colors.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => updateThreeJsColor(c)}
                                                className={`relative w-full aspect-square rounded-lg border-2 shadow-sm transition-all hover:scale-110 hover:shadow-md ${color === c
                                                        ? "border-indigo-600 ring-2 ring-indigo-300 scale-105"
                                                        : "border-gray-300 hover:border-indigo-400"
                                                    }`}
                                                style={{ backgroundColor: c }}
                                                title={c}
                                            >
                                                {color === c && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <svg
                                                            className="w-4 h-4 text-white drop-shadow-lg"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
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
                                            min="0.01"
                                            max="3"
                                            step="0.01"
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
                                            : "Upload Logo (PNG, JPG, JPEG - Max 5MB)"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpg,image/jpeg"
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
                                            className="text-red-600 text-sm hover:underline"
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
                                                min="0.5"
                                                max="3"
                                                step="0.01"
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

            <StepNavigation 
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={nextStep}
                onPrev={prevStep}
                isLastStep={false}
            />
            </>
            )}

            {/* STEP 2: Material Selection */}
            {currentStep === 2 && (
                <>
            <div className="flex flex-col items-center justify-center mt-10">
                <h3 className="text-black text-2xl md:text-3xl lg:text-4xl font-medium mb-6 md:mb-10">
                    Select the material you want
                </h3>
                <p className="text-black text-lg md:text-xl lg:text-2xl font-normal">
                    you can select multiple materials and combined by percentage
                </p>
            </div>

            <section>
                {/* materials selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {materials.map((material) => (
                        <button
                            key={material.name}
                            onClick={() => toggleMaterial(material.name)}
                            className={`cursor-pointer hover:border-yellow-500 border-2 rounded-lg p-4 text-left transition-all ${selectedMaterials[material.name]
                                    ? "border-yellow-500 bg-yellow-50"
                                    : "border-gray-300"
                                }`}
                        >
                            <h3 className="text-xl font-semibold mb-2">{material.name}</h3>
                            <ul className="list-disc list-inside">
                                {material.features.map((feature, i) => (
                                    <li key={i} className="text-black text-base font-normal">
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </button>
                    ))}
                    {/* materials percentage */}
                    <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
                        <h3 className="font-semibold mb-3">Materials selected</h3>
                        <p className="text-xs text-gray-600 mb-3">
                            Note: You may adjust percentages to achieve 100% mixture
                        </p>
                        <div className="space-y-2">
                            {Object.entries(selectedMaterials).map(([name, percentage]) => (
                                <div key={name} className="flex items-center justify-between">
                                    <span className="text-sm">{name}</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={percentage}
                                            onChange={(e) =>
                                                updateMaterialPercentage(name, e.target.value)
                                            }
                                            className="w-16 px-2 py-1 border rounded text-sm"
                                            min="0"
                                            max="100"
                                        />
                                        <span className="text-sm">%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <StepNavigation 
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={nextStep}
                onPrev={prevStep}
                isLastStep={false}
            />
            </>
            )}

            {/* STEP 3: Review & Submit */}
            {currentStep === 3 && (
                <>
            {/* Company Information */}
            <div className="flex flex-col items-center justify-center mt-6 md:mt-10 mb-8">
                <h3 className="text-black text-2xl md:text-3xl lg:text-4xl font-medium mb-6">
                    Company Information
                </h3>
                <div className="w-full max-w-2xl bg-white rounded-lg border-2 border-gray-300 p-4 md:p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs md:text-sm font-semibold mb-2">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Enter company name"
                                className="w-full border rounded px-3 py-2 bg-gray-50 text-sm md:text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-semibold mb-2">
                                Contact Person *
                            </label>
                            <input
                                type="text"
                                value={contactPerson}
                                onChange={(e) => setContactPerson(e.target.value)}
                                placeholder="Enter contact person name"
                                className="w-full border rounded px-3 py-2 bg-gray-50 text-sm md:text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-semibold mb-2">
                                Contact Phone *
                            </label>
                            <input
                                type="tel"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="(+63) 9XX XXX XXXX"
                                className="w-full border rounded px-3 py-2 bg-gray-50 text-sm md:text-base"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Order summary and address */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-5 ml-5 mr-5">
                {/* Order summary */}
                <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
                    <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b">
                            <span className="font-semibold">Quantity</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleQuantityChange(-10)}
                                    className="border rounded p-1"
                                >
                                    <Minus size={16}></Minus>
                                </button>
                                <span className="w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(10)}
                                    className="border rounded p-1"
                                >
                                    <Plus size={16}></Plus>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Product:</span>
                                <span className="font-semibold">{selectedHanger}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600"> Material:</span>
                                <div className="text-right">
                                    {Object.entries(selectedMaterials).map(
                                        ([name, percentage]) => (
                                            <div key={name}>
                                                {percentage}% {name}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between item-center">
                                <span className="text-gray-600">Color:</span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: color }}
                                    ></div>
                                    <span className="font-mono text-xs">{color}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <label className="block font-semibold mb-2">
                                Delivery Instruction
                            </label>
                            <textarea
                                value={deliveryNotes}
                                onChange={(e) => setDeliveryNotes(e.target.value)}
                                placeholder="Write a note..."
                                className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                            ></textarea>
                        </div>
                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                className="cursor-pointer bg-[#DC3545] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c82333] transition-colors w-full"
                                onClick={handleSubmitOrder}
                            >
                                Send for Evaluation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Address Selection */}
                <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
                    <h2 className="text-xl font-semibold mb-6">My Address</h2>

                    <div className="space-y-4">
                        {addresses.length > 0 ? (
                            addresses.map((addr, idx) => (
                                <label
                                    key={idx}
                                    className="flex item-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                                >
                                    <input
                                        type="radio"
                                        name="address"
                                        checked={selectedAddress === idx}
                                        onChange={() => setSelectedAddress(idx)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold">{addr.name}</span>
                                            {addr.isDefault && (
                                                <span className="bg-[#007BFF] text-white text-xs px-2 py-0.5 rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{addr.phone}</p>
                                        <p className="text-sm text-gray-600">{addr.address}</p>
                                    </div>
                                </label>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="mb-2 text-yellow-800 font-semibold">
                                    ⚠️ No delivery address found
                                </p>
                                <p className="text-sm text-yellow-700">
                                    Please update your company address in Account Settings
                                </p>
                                <p className="text-xs text-yellow-600 mt-2">
                                    Orders without a proper address may experience delivery delays
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-[200]">
                        <div className="bg-[#007BFF] rounded-lg shadow-lg p-8 text-center max-w-md">
                            <img
                                src={validationIcon}
                                alt="Validation Icon"
                                className="mx-auto mb-4 w-16 h-16"
                            />
                            <h3 className="text-xl text-white font-semibold mb-4">
                                Your order will be validated first
                            </h3>
                            <p className="mb-6 text-white">
                                We will maintain communication and provide updates as needed.
                            </p>
                            <p className="mb-6 text-white text-sm">
                                Order Number:{" "}
                                {companyName ? `ORD-${new Date().getFullYear()}...` : ""}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Link to="/order">
                                    <button
                                        className="bg-[#F5F5F5] text-[#333333] px-8 py-2 rounded-lg font-semibold cursor-pointer hover:bg-[#e0e0e0] transition-colors border border-gray-300"
                                        onClick={() => setShowModal(false)}
                                    >
                                        View My Orders
                                    </button>
                                </Link>
                                <Link to="/messages">
                                    <button
                                        className="bg-white text-[#007BFF] px-8 py-2 rounded-lg font-semibold cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Go to Messages
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

            <StepNavigation 
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={nextStep}
                onPrev={prevStep}
                isLastStep={true}
            />
            </>
            )}

            {/* Instructions Modal */}
            {showInstructionsModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-[9999] pt-24 md:pt-28">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto mx-4 relative z-[10000] mt-4">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <Info className="text-[#007BFF]" size={24} />
                                    <h2 className="text-2xl font-bold text-[#007BFF]">
                                        Ordering Process Instructions
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowInstructionsModal(false)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                    <h3 className="font-semibold text-yellow-800 mb-2">
                                        Welcome to GatsisHub Custom Hanger Ordering!
                                    </h3>
                                    <p className="text-yellow-700">
                                        Follow these simple steps to create your perfect custom
                                        hangers.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="bg-[#007BFF] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">
                                                Select Hanger Type
                                            </h4>
                                            <p className="text-gray-600">
                                                Choose from our available hanger designs (MB3, 97-12,
                                                CQ-807, 97-11, 97-08) or upload your own design.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-[#007BFF] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">
                                                Choose Materials
                                            </h4>
                                            <p className="text-gray-600">
                                                Select one or multiple materials and adjust percentages
                                                to create your ideal blend. Popular options include PP,
                                                ABS, and Polycarbonate.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-[#007BFF] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">
                                                Customize Your Design
                                            </h4>
                                            <p className="text-gray-600">
                                                Pick your preferred color and specify the quantity
                                                (minimum 100 pieces). Add any special instructions.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-[#007BFF] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                            4
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Review & Submit</h4>
                                            <p className="text-gray-600">
                                                Check your order summary, confirm your delivery address,
                                                and submit for evaluation.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-[#007BFF] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                            5
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">
                                                Order Validation
                                            </h4>
                                            <p className="text-gray-600">
                                                Our team will review your order and contact you with
                                                pricing, timeline, and any clarifications needed.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                    <h4 className="font-semibold text-blue-800 mb-2">
                                        Important Notes:
                                    </h4>
                                    <ul className="text-blue-700 space-y-1 text-sm">
                                        <li>• Minimum order quantity: 100 pieces</li>
                                        <li>• Material percentages should total 100%</li>
                                        <li>• All orders require validation before production</li>
                                        <li>
                                            • Production time varies based on complexity and quantity
                                        </li>
                                        <li>• Custom designs may require additional review time</li>
                                        <li>
                                            • Text and logo customizations available for all models
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex justify-center gap-4 pt-4">
                                    <button
                                        onClick={() => setShowInstructionsModal(false)}
                                        className="bg-[#007BFF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0056b3] transition-colors"
                                    >
                                        Got it, let's start!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {/* Fullscreen 3D Viewer Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-[#007BFF] z-[200] flex flex-col">
                    {/* Header with Close Button */}
                    <div className="flex justify-between items-center p-3 md:p-4 bg-[#2c3575] backdrop-blur-sm border-b-2 border-yellow-400">
                        <div className="flex items-center gap-2 md:gap-3">
                            <h3 className="text-white text-base md:text-lg lg:text-xl font-semibold">3D Preview</h3>
                            <span className="text-[#DC3545] text-xs md:text-sm">({selectedHanger})</span>
                        </div>
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:bg-[#DC3545] hover:text-white p-2 rounded-lg transition-colors"
                            title="Exit Fullscreen"
                        >
                            <X size={20} className="md:w-6 md:h-6" />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        {/* 3D Canvas */}
                        <div className="flex-1 relative bg-gradient-to-br from-[#007BFF] to-[#0056b3]">
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
                        <div className="w-full md:w-80 lg:w-96 bg-[#2c3575]/95 backdrop-blur-sm overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 border-t-2 md:border-t-0 md:border-l-2 border-yellow-400 max-h-[40vh] md:max-h-none">
                            {/* Color Picker */}
                            <div className="bg-[#007BFF]/70 rounded-lg p-3 md:p-4 border border-[#0056b3]">
                                <h4 className="text-yellow-400 font-semibold mb-2 md:mb-3 text-xs md:text-sm">Color</h4>
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
                                            className="flex-1 bg-[#0056b3] text-white border border-[#DC3545] rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#DC3545]"
                                            placeholder="#4F46E5"
                                        />
                                    </div>
                                    <div className="grid grid-cols-6 gap-1.5 md:gap-2">
                                        {['#FF6B6B', '#FF8E8E', '#FFA07A', '#FFB347', '#9B59B6', '#E91E63', 
                                        '#3B82F6', '#10B981', '#06B6D4', '#14B8A6', '#84CC16', '#EAB308'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => updateThreeJsColor(c)}
                                                className="w-full aspect-square rounded border-2 border-[#0056b3] hover:border-[#DC3545] transition-colors"
                                                style={{ backgroundColor: c }}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Custom Text */}
                            <div className="bg-[#007BFF]/70 rounded-lg p-3 md:p-4 border border-[#0056b3]">
                                <h4 className="text-white font-semibold mb-2 md:mb-3 text-xs md:text-sm">Custom Text</h4>
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="Enter text"
                                    className="w-full bg-[#0056b3] text-white border border-[#DC3545] rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#DC3545]"
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
                                        className="flex-1 bg-[#0056b3] text-white border border-[#DC3545] rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#DC3545]"
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
                                            min="0.5"
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
                            <div className="bg-[#007BFF]/70 rounded-lg p-3 md:p-4 border border-[#0056b3]">
                                <h4 className="text-white font-semibold mb-2 md:mb-3 text-xs md:text-sm">Logo</h4>
                                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#DC3545] rounded-lg p-2 md:p-3 cursor-pointer hover:bg-[#0056b3] transition-colors">
                                    <ImageIcon size={16} className="text-white" />
                                    <span className="text-xs text-white">
                                        {customLogo ? customLogo.name : 'Upload Logo'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/svg+xml"
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
                                                        setLogoSize(0.5);
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
                                                    min="0.5"
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
                    <div className="p-4 bg-[#0056b3] backdrop-blur-sm text-center border-t-2 border-[#DC3545]">
                        <p className="text-white text-sm">
                            Drag to rotate • Scroll to zoom • Right-click to pan • Press ESC
                            or click
                            <button
                                onClick={toggleFullscreen}
                                className="text-[#DC3545] hover:text-white underline ml-1 font-semibold"
                            >
                                here
                            </button>{" "}
                            to exit
                        </p>
                    </div>
                </div>
            )}

            {/* Save Design Modal */}
            {saveDesignModal && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-[200] p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Save Design</h3>
                            <button 
                                onClick={() => setSaveDesignModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Design Name</label>
                            <input
                                type="text"
                                value={designName}
                                onChange={(e) => setDesignName(e.target.value)}
                                placeholder="e.g., Red 97-12 with Logo"
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                                autoFocus
                            />
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold mb-2 text-sm">Design Details:</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p>• Hanger: <span className="font-medium">{selectedHanger}</span></p>
                                <p>• Color: <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: color }}></span> {color}</p>
                                {customText && <p>• Text: <span className="font-medium">"{customText}"</span></p>}
                                {logoPreview && <p>• Logo: <span className="font-medium">✓ Included</span></p>}
                                {Object.keys(selectedMaterials).length > 0 && (
                                    <p>• Materials: <span className="font-medium">{Object.keys(selectedMaterials).join(', ')}</span></p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSaveDesignModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSaveDesign}
                                disabled={isSaving || !designName.trim()}
                                className="flex-1 px-4 py-2 bg-[#007BFF] text-white rounded hover:bg-[#0056b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save Design'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Color Limitation Modal for 97-12 and 97-11 */}
            {showColorLimitationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[200]">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        {/* Modal Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Info className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        {/* Modal Title */}
                        <h3 className="text-xl font-bold text-center mb-4">Color Customization Notice</h3>

                        {/* Modal Message */}
                        <p className="text-center text-gray-700 mb-6">
                            For Model <span className="font-semibold">{selectedHanger}</span>, kindly disregard the color change on hooks and bars. 
                            Color changes will only apply on the main body and clips.
                        </p>

                        {/* Modal Button */}
                        <button
                            onClick={() => setShowColorLimitationModal(false)}
                            className="w-full px-4 py-2 bg-[#007BFF] text-white rounded hover:bg-[#0056b3] transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {notificationModal.show && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[200]">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        {/* Modal Icon */}
                        <div className="flex justify-center mb-4">
                            {notificationModal.type === 'success' && (
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl text-green-600">✓</span>
                                </div>
                            )}
                            {notificationModal.type === 'error' && (
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl text-red-600">✕</span>
                                </div>
                            )}
                        </div>

                        {/* Modal Message */}
                        <p className="text-center text-gray-700 mb-6">{notificationModal.message}</p>

                        {/* Modal Button */}
                        <button
                            onClick={() => setNotificationModal({ show: false, type: '', message: '' })}
                            className="w-full px-4 py-2 bg-[#007BFF] text-white rounded hover:bg-[#0056b3] transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default Checkout;
