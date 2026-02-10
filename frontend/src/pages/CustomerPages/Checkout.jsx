
import { button, div, label, li, span } from 'framer-motion/client'
import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef, Suspense } from 'react'
import ProductCard from '../../components/Checkout/productcard'
import preview3d from '../../images/preview3d.png'
import { Plus, Minus, Download, ChevronDown, PartyPopper, X, BotMessageSquare, Info, Upload, Type, Image as ImageIcon, Maximize2, Minimize2, Save } from 'lucide-react';
import validationIcon from '../../images/validation ico.png'
import MB3ProductPage from '../../images/MB3ProductPage.png'
import Product9712 from '../../images/97-12ProductPage.png'
import ProductCQ807 from '../../images/CQ-807ProductPage.png'
import Product9711 from '../../images/97-11ProductPage.png'
import Product9708 from '../../images/97-08ProductPage.png'
import { supabase } from '../../../supabaseClient'
import HangerScene from '../../components/Checkout/HangerScene'
import { useAuth } from '../../context/AuthContext'
import Stepper from '../../components/Checkout/CheckoutSteps/Stepper'
import StepNavigation from '../../components/Checkout/CheckoutSteps/StepNavigation'
import LoadingSpinner from '../../components/LoadingSpinner'
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

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const threeCanvasRef = useRef(null);
    const { user } = useAuth();

    // VAT rates by country (in percentage)
    const VAT_RATES = {
        'Philippines': 12,
        'Singapore': 9,
        'Malaysia': 10,
        'Indonesia': 11,
        'Thailand': 7,
        'Vietnam': 10,
        'Japan': 10,
        'South Korea': 10,
        'China': 13,
        'Hong Kong': 0,
        'Taiwan': 5,
        'India': 18,
        'United States': 0, // Varies by state
        'United Kingdom': 20,
        'Australia': 10,
        'Canada': 5, // GST, varies by province
        'Germany': 19,
        'France': 20,
        'Italy': 22,
        'Spain': 21,
        'Netherlands': 21,
        'default': 12 // Default to Philippines VAT
    };

    // Get VAT rate based on user's country
    const getVATRate = () => {
        const userCountry = user?.country || 'Philippines';
        return VAT_RATES[userCountry] || VAT_RATES['default'];
    };

    // Calculate delivery cost based on location and weight
    const calculateDeliveryCost = (totalWeightKg) => {
        const userCountry = user?.country || 'Philippines';
        const isLocal = userCountry === 'Philippines';
        
        // Base delivery cost
        const baseCost = isLocal ? 1000 : 5000;
        
        // Additional cost per kg over 10kg limit
        const weightLimit = 10;
        const additionalCostPerKg = isLocal ? 500 : 1000;
        
        // Calculate additional cost if weight exceeds limit
        let additionalCost = 0;
        let excessWeight = 0;
        if (totalWeightKg > weightLimit) {
            excessWeight = totalWeightKg - weightLimit;
            additionalCost = Math.ceil(excessWeight) * additionalCostPerKg;
        }
        
        return {
            total: baseCost + additionalCost,
            baseCost: baseCost,
            additionalCost: additionalCost,
            excessWeight: excessWeight,
            weightLimit: weightLimit,
            isLocal: isLocal,
            location: userCountry
        };
    };

    // Hanger image mapping
    const hangerImages = {
        'MB3': MB3ProductPage,
        '97-12': Product9712,
        'CQ-807': ProductCQ807,
        '97-11': Product9711,
        '97-08': Product9708
    };

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [submittedOrderData, setSubmittedOrderData] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [saveDesignModal, setSaveDesignModal] = useState(false);
    const [designName, setDesignName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [sceneLoaded, setSceneLoaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notificationModal, setNotificationModal] = useState({ show: false, type: '', message: '' });
    const [showColorLimitationModal, setShowColorLimitationModal] = useState(false);
    const [capturedThumbnail, setCapturedThumbnail] = useState(null);
    const [showStepper, setShowStepper] = useState(false);

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

    // Add this with your other state declarations
    // Add this with your other state declarations
    const [showDescribeModal, setShowDescribeModal] = useState(false);
    const [clothingDescription, setClothingDescription] = useState('');
    const [isSendingDescription, setIsSendingDescription] = useState(false);
    const [savedClothingDescription, setSavedClothingDescription] = useState('');
    const [aiRecommendations, setAiRecommendations] = useState(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false); // New: to save the description

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

    // Scroll listener for stepper dropdown animation
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowStepper(true);
            } else {
                setShowStepper(false);
            }
        };

        // Check initial scroll position
        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [addresses, setAddresses] = useState([]);
    const [hangers, setHangers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [products, setProducts] = useState([]); // Store full product data with weight
    const [materialsFullData, setMaterialsFullData] = useState([]); // Store full material data with price

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

    // Calculate total price based on weight, materials, and quantity
    const calculateTotalPrice = () => {
        try {
            // Find the selected product
            const product = products.find(p => p.productname === selectedHanger);
            if (!product || !product.weight) {
                console.warn('Product weight not found for:', selectedHanger);
                return null;
            }

            // Convert weight from grams to kg
            const weightInKg = parseFloat(product.weight) / 1000;

            // Calculate total weight for all units
            const totalWeight = weightInKg * quantity;

            // Calculate material cost
            let materialCost = 0;
            for (const [materialName, percentage] of Object.entries(selectedMaterials)) {
                const material = materialsFullData.find(m => m.materialname === materialName);
                if (material && material.price_per_kg) {
                    const materialWeight = totalWeight * (percentage / 100);
                    materialCost += materialWeight * parseFloat(material.price_per_kg);
                }
            }

            // Calculate delivery cost based on location and weight
            const deliveryCostBreakdown = calculateDeliveryCost(totalWeight);
            const deliveryCost = deliveryCostBreakdown.total;
            const subtotal = materialCost + deliveryCost;

            // Calculate VAT based on user's country
            const vatRate = getVATRate();
            const vatAmount = subtotal * (vatRate / 100);
            const totalPrice = subtotal + vatAmount;

            return totalPrice.toFixed(2);
        } catch (error) {
            console.error('Error calculating price:', error);
            return null;
        }
    };

    // Get AI material recommendations using Gemini API
    const getAIMaterialRecommendations = async () => {
        if (!clothingDescription.trim()) {
            showNotification('Please describe your clothing needs first');
            return;
        }

        setIsLoadingAI(true);
        try {
            // Use Gemini API (Free tier: https://ai.google.dev/)
            const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

            if (!GEMINI_API_KEY) {
                throw new Error('Gemini API key not configured');
            }

            // Get available materials info
            const materialsList = materials.map(m => `${m.name} - ${m.features.join(', ')}`).join('\n');

            const prompt = `You are a materials expert helping customers choose the best hanger materials for their clothing needs.

Available Materials:
${materialsList}

Customer's Clothing Needs:
${clothingDescription}

Based on the customer's needs, recommend:
1. Which materials are best suited (can be multiple)
2. Suggested percentage composition for each material (must total 100%)
3. Brief explanation why these materials work best

Respond in JSON format:
{
  "recommendations": [
    {"material": "Material Name", "percentage": 50, "reason": "explanation"},
    {"material": "Material Name", "percentage": 50, "reason": "explanation"}
  ],
  "summary": "Brief overall explanation"
}`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', response.status, errorData);
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text;

            // Extract JSON from response
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const recommendations = JSON.parse(jsonMatch[0]);
                setAiRecommendations(recommendations);

                // Auto-apply recommendations
                const newMaterials = {};
                recommendations.recommendations.forEach(rec => {
                    // Find matching material (case-insensitive)
                    const material = materials.find(m =>
                        m.name.toLowerCase() === rec.material.toLowerCase()
                    );
                    if (material) {
                        newMaterials[material.name] = rec.percentage;
                    }
                });

                if (Object.keys(newMaterials).length > 0) {
                    setSelectedMaterials(newMaterials);
                    showNotification('AI recommendations applied! Review the materials below.', 'success');
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('AI recommendation error:', error);

            // Check if it's an API key issue
            if (error.message.includes('API_KEY_INVALID') || error.message.includes('403')) {
                showNotification('AI service configuration error. Please contact support or select materials manually.');
            } else if (error.message.includes('429')) {
                showNotification('AI service is temporarily busy. Please try again in a moment or select materials manually.');
            } else {
                showNotification('Failed to get AI recommendations. Please try again or select materials manually.');
            }
        } finally {
            setIsLoadingAI(false);
        }
    };

    // Get detailed price breakdown for display
    const getPriceBreakdown = () => {
        try {
            const product = products.find(p => p.productname === selectedHanger);
            if (!product || !product.weight) return null;

            const weightInKg = parseFloat(product.weight) / 1000;
            const totalWeight = weightInKg * quantity;

            const deliveryCostBreakdown = calculateDeliveryCost(totalWeight);
            
            const breakdown = {
                productWeight: parseFloat(product.weight),
                weightPerUnit: weightInKg,
                totalWeight: totalWeight,
                materials: [],
                totalMaterialCost: 0,
                deliveryCost: deliveryCostBreakdown.total,
                deliveryBreakdown: deliveryCostBreakdown,
                vatRate: getVATRate(),
                country: user?.country || 'Philippines'
            };

            for (const [materialName, percentage] of Object.entries(selectedMaterials)) {
                const material = materialsFullData.find(m => m.materialname === materialName);
                if (material && material.price_per_kg) {
                    const materialWeight = totalWeight * (percentage / 100);
                    const materialCost = materialWeight * parseFloat(material.price_per_kg);

                    breakdown.materials.push({
                        name: materialName,
                        percentage: percentage,
                        pricePerKg: parseFloat(material.price_per_kg),
                        weight: materialWeight,
                        cost: materialCost
                    });

                    breakdown.totalMaterialCost += materialCost;
                }
            }

            breakdown.subtotal = breakdown.totalMaterialCost + breakdown.deliveryCost;
            breakdown.vatAmount = breakdown.subtotal * (breakdown.vatRate / 100);
            breakdown.totalPrice = breakdown.subtotal + breakdown.vatAmount;

            return breakdown;
        } catch (error) {
            console.error('Error getting price breakdown:', error);
            return null;
        }
    };

    // Download invoice as HTML file
    const handleDownloadInvoice = () => {
        if (!submittedOrderData) return;

        const docType = submittedOrderData.hasPayment ? 'Receipt' : 'Invoice';
        const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docType} - ${submittedOrderData.orderNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #191716;
            margin-bottom: 5px;
        }
        .doc-title {
            font-size: 24px;
            color: #3b82f6;
            margin-top: 10px;
        }
        .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-block h3 {
            color: #191716;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .info-row {
            margin: 8px 0;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #3b82f6;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }
        .breakdown-section {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .breakdown-item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px;
            background: white;
            border-radius: 4px;
        }
        .total-section {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #3b82f6;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 16px;
        }
        .total-amount {
            display: flex;
            justify-content: space-between;
            font-size: 24px;
            font-weight: bold;
            color: #191716;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #3b82f6;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 20px;
        }
        .status-paid {
            background-color: #10b981;
            color: white;
        }
        .status-pending {
            background-color: #f59e0b;
            color: white;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">GatsisHub</div>
        <div class="doc-title">${docType}</div>
        <div class="status-badge ${submittedOrderData.hasPayment ? 'status-paid' : 'status-pending'}">
            ${submittedOrderData.hasPayment ? '✓ PAID' : 'PENDING PAYMENT'}
        </div>
    </div>

    <div class="info-section">
        <div class="info-block">
            <h3>Order Information</h3>
            <div class="info-row"><span class="label">Order Number:</span> ${submittedOrderData.orderNumber}</div>
            <div class="info-row"><span class="label">Date:</span> ${new Date(submittedOrderData.datecreated || Date.now()).toLocaleDateString()}</div>
        </div>
        <div class="info-block">
            <h3>Customer Information</h3>
            <div class="info-row"><span class="label">Company:</span> ${submittedOrderData.companyName}</div>
            <div class="info-row"><span class="label">Contact:</span> ${submittedOrderData.contactPerson}</div>
            <div class="info-row"><span class="label">Phone:</span> ${submittedOrderData.contactPhone}</div>
        </div>
    </div>

    <div class="info-block">
        <h3>Product Details</h3>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Specification</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Product</td>
                    <td>${submittedOrderData.selectedHanger}</td>
                </tr>
                <tr>
                    <td>Quantity</td>
                    <td>${submittedOrderData.quantity} units</td>
                </tr>
                <tr>
                    <td>Color</td>
                    <td>${submittedOrderData.color}</td>
                </tr>
                <tr>
                    <td>Materials</td>
                    <td>${Object.entries(submittedOrderData.selectedMaterials).map(([name, pct]) => `${Math.round(pct)}% ${name}`).join(', ')}</td>
                </tr>
                ${submittedOrderData.customtext ? `<tr><td>Custom Text</td><td>"${submittedOrderData.customtext}"</td></tr>` : ''}
                ${submittedOrderData.customlogo ? `<tr><td>Custom Logo</td><td>✓ Included</td></tr>` : ''}
            </tbody>
        </table>
    </div>

    ${submittedOrderData.breakdown ? `
    <div class="breakdown-section">
        <h3>Price Breakdown</h3>
        <div class="info-row">
            <span class="label">Product Weight:</span> ${submittedOrderData.breakdown.productWeight}g per unit
        </div>
        <div class="info-row">
            <span class="label">Total Weight:</span> ${submittedOrderData.breakdown.totalWeight.toFixed(3)} kg
        </div>
        
        <h4 style="margin-top: 20px;">Material Costs:</h4>
        ${submittedOrderData.breakdown.materials.map(mat => `
        <div class="breakdown-item">
            <div>
                <strong>${mat.name} (${mat.percentage}%)</strong><br>
                <small>₱${mat.pricePerKg.toLocaleString('en-PH', { minimumFractionDigits: 2 })} per kg × ${mat.weight.toFixed(3)} kg</small>
            </div>
            <div>
                <strong>₱${mat.cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
            </div>
        </div>
        `).join('')}
    </div>

    <div class="total-section">
        <div class="total-row">
            <span>Total Material Cost:</span>
            <span>₱${submittedOrderData.breakdown.totalMaterialCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="total-row" style="margin-bottom: 5px;">
            <span><strong>Delivery Fee (${submittedOrderData.breakdown.deliveryBreakdown.isLocal ? 'Local' : 'International'}):</strong></span>
            <span><strong>₱${submittedOrderData.breakdown.deliveryCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></span>
        </div>
        <div class="total-row" style="margin-left: 20px; font-size: 0.9em; color: #666;">
            <span>• Base cost:</span>
            <span>₱${submittedOrderData.breakdown.deliveryBreakdown.baseCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>
        ${submittedOrderData.breakdown.deliveryBreakdown.additionalCost > 0 ? `
        <div class="total-row" style="margin-left: 20px; font-size: 0.9em; color: #666;">
            <span>• Extra weight (${Math.ceil(submittedOrderData.breakdown.deliveryBreakdown.excessWeight)} kg over ${submittedOrderData.breakdown.deliveryBreakdown.weightLimit} kg):</span>
            <span>₱${submittedOrderData.breakdown.deliveryBreakdown.additionalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>` : ''}
        <div class="total-row" style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 5px;">
            <span><strong>Subtotal:</strong></span>
            <span><strong>₱${submittedOrderData.breakdown.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong></span>
        </div>
        <div class="total-row">
            <span>VAT (${submittedOrderData.breakdown.vatRate}% - ${submittedOrderData.breakdown.country}):</span>
            <span>₱${submittedOrderData.breakdown.vatAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="total-amount">
            <span>${submittedOrderData.hasPayment ? 'FINAL AMOUNT:' : 'ESTIMATED AMOUNT:'}</span>
            <span>₱${submittedOrderData.breakdown.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>GatsisHub</strong> - Custom Hanger Solutions</p>
        <p>Thank you for your business!</p>
        <p style="margin-top: 10px;">This is a computer-generated ${docType.toLowerCase()} and does not require a signature.</p>
    </div>
</body>
</html>
        `.trim();

        // Create blob and download
        const blob = new Blob([invoiceHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${docType}-${submittedOrderData.orderNumber}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

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

        setIsSubmitting(true);

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

        // Calculate total price
        const totalPrice = calculateTotalPrice();

        // Get detailed price breakdown for saving
        const priceBreakdown = getPriceBreakdown();

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
            clothingPreferences: savedClothingDescription || null, // New: save clothing description
            totalprice: totalPrice, // Add calculated price
            estimatedBreakdown: priceBreakdown ? JSON.stringify({
                ...priceBreakdown,
                isEstimate: true,
                createdAt: new Date().toISOString()
            }) : null // Save estimated breakdown for sales admin reference
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

            // Store submitted order data for invoice
            const orderDataForInvoice = {
                ...result.order,
                orderNumber: localOrderData.orderNumber,
                companyName,
                contactPerson,
                contactPhone,
                quantity,
                selectedHanger,
                selectedMaterials,
                color,
                breakdown: getPriceBreakdown(),
                deliveryAddress: addresses.length > 0 && addresses[selectedAddress]?.address
                    ? addresses[selectedAddress].address
                    : `${companyName}, ${contactPhone}`,
                hasPayment: false // Will be updated when payment is submitted
            };
            console.log('Setting submitted order data:', orderDataForInvoice);
            setSubmittedOrderData(orderDataForInvoice);

            // Show success modal and redirect to orders page after 2 seconds
            setShowModal(true);
            // setTimeout(() => {
            //     navigate("/orders");
            // }, 2000);
        } catch (error) {

            showNotification(`Failed to create order: ${error.message}`);
        } finally {
            setIsSubmitting(false);
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
                    // Store full product data
                    setProducts(productsData.products);

                    // Map for UI display
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
                    // Store full material data
                    setMaterialsFullData(materialsData.materials);

                    // Map for UI display
                    const mappedMaterials = materialsData.materials.map(material => ({
                        name: material.materialname,
                        features: material.features || [],
                        price_per_kg: material.price_per_kg
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
            {/* Sticky Stepper - Right Side for Large Screens */}
            <div className="hidden lg:block fixed top-1/2 -translate-y-1/2 right-0 z-40 transition-transform duration-500 ease-out">
                <div className="px-2 py-2">
                    <Stepper currentStep={currentStep} totalSteps={totalSteps} goToStep={goToStep} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8 mt-20 md:mt-24">

                {/* Stepper for Small/Medium Screens - Stationary */}
                <div className="lg:hidden mt-6 mb-6">
                    <Stepper currentStep={currentStep} totalSteps={totalSteps} goToStep={goToStep} />
                </div>

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
                                        <div className="bg-gradient-to-br from-[#e6af2e] to-[#c82333] rounded-lg p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center relative border-2 border-[#DC3545] min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
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
                                                        className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all w-20 ${selectedHanger === hanger.id
                                                            ? "border-[#007BFF] shadow-md"
                                                            : "border-gray-300 hover:border-gray-400"
                                                            }`}
                                                    >
                                                        <div className="bg-white p-2 flex items-center justify-center aspect-square">
                                                            <img
                                                                src={hangerImages[hanger.id]}
                                                                alt={hanger.name}
                                                                className="w-full h-full object-contain"
                                                            />
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
                                                    disabled={quantity <= 100}
                                                    className="bg-white border rounded p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
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

                                                {/* Comic Style Color Picker */}
                                                <ColorPickerWrapper>
                                                    <div className="comic-panel">
                                                        <div className="container-items">
                                                            <button
                                                                className={`item-color ${color === '#e11d48' ? 'selected' : ''}`}
                                                                style={{ '--color': '#e11d48' }}
                                                                aria-color="#e11d48"
                                                                onClick={() => updateThreeJsColor('#e11d48')}
                                                            />
                                                            <button
                                                                className={`item-color ${color === '#f472b6' ? 'selected' : ''}`}
                                                                style={{ '--color': '#f472b6' }}
                                                                aria-color="#f472b6"
                                                                onClick={() => updateThreeJsColor('#f472b6')}
                                                            />
                                                            <button
                                                                className={`item-color ${color === '#fb923c' ? 'selected' : ''}`}
                                                                style={{ '--color': '#fb923c' }}
                                                                aria-color="#fb923c"
                                                                onClick={() => updateThreeJsColor('#fb923c')}
                                                            />
                                                            <button
                                                                className={`item-color ${color === '#facc15' ? 'selected' : ''}`}
                                                                style={{ '--color': '#facc15' }}
                                                                aria-color="#facc15"
                                                                onClick={() => updateThreeJsColor('#facc15')}
                                                            />
                                                            <button
                                                                className={`item-color ${color === '#84cc16' ? 'selected' : ''}`}
                                                                style={{ '--color': '#84cc16' }}
                                                                aria-color="#84cc16"
                                                                onClick={() => updateThreeJsColor('#84cc16')}
                                                            />
                                                            <button
                                                                className={`item-color ${color === '#10b981' ? 'selected' : ''}`}
                                                                style={{ '--color': '#10b981' }}
                                                                aria-color="#10b981"
                                                                onClick={() => updateThreeJsColor('#10b981')}
                                                            />
                                                            <button
                                                                className={`item-color ${color === '#0ea5e9' ? 'selected' : ''}`}
                                                                style={{ '--color': '#0ea5e9' }}
                                                                aria-color="#0ea5e9"
                                                                onClick={() => updateThreeJsColor('#0ea5e9')}
                                                            />
                                                            <button
                                                                className={`item-color ${color === '#3b82f6' ? 'selected' : ''}`}
                                                                style={{ '--color': '#3b82f6' }}
                                                                aria-color="#3b82f6"
                                                                onClick={() => updateThreeJsColor('#3b82f6')}
                                                            />
                                                            <button
                                                                className={`item-color ${color === '#8b5cf6' ? 'selected' : ''}`}
                                                                style={{ '--color': '#8b5cf6' }}
                                                                aria-color="#8b5cf6"
                                                                onClick={() => updateThreeJsColor('#8b5cf6')}
                                                            />
                                                            <button
                                                                className={`item-color ${color === '#a78bfa' ? 'selected' : ''}`}
                                                                style={{ '--color': '#a78bfa' }}
                                                                aria-color="#a78bfa"
                                                                onClick={() => updateThreeJsColor('#a78bfa')}
                                                            />
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
                {/* UI Enchance Describe your preferences button for UI/UX still hardcoded */}
                {currentStep === 2 && (
                    <>
                        <div className="flex flex-col items-center justify-center mt-6 md:mt-10">
                            <h3 className="text-black text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                                Select Your Materials
                            </h3>
                            <p className="text-gray-600 text-base md:text-lg lg:text-xl text-center max-w-2xl px-4">
                                Choose one or multiple materials and adjust percentages to create your perfect blend
                            </p>
                        </div>

                        <section className="px-3 md:px-6 py-6 md:py-8">
                            <div className="max-w-7xl mx-auto">
                                {/* Enhanced AI Help Banner */}
                                <div className="bg-gradient-to-br from-[#E6AF2E] via-[#f0b940] to-[#E6AF2E] rounded-2xl p-4 md:p-8 mb-8 shadow-2xl border-2 border-yellow-600">
                                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                                <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
                                                <h4 className="text-[#191716] text-lg md:text-2xl font-bold">
                                                    AI-Powered Material Recommendations
                                                </h4>
                                            </div>
                                            <p className="text-[#191716]/90 text-xs md:text-base mb-3 md:mb-4">
                                                Not sure which materials to choose? Our AI assistant will analyze your needs and recommend the perfect material combination!
                                            </p>
                                            <button
                                                onClick={() => setShowDescribeModal(true)}
                                                className="bg-[#191716] hover:bg-gray-800 text-white font-bold px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto md:mx-0 text-sm md:text-base"
                                            >
                                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                                Get AI Recommendations
                                            </button>
                                        </div>
                                        <div className="hidden lg:block flex-shrink-0">
                                            <BotMessageSquare size={60} className="text-[#191716]/80" />
                                        </div>
                                    </div>
                                </div>

                                {/* User's Clothing Preference Card - NEW */}
                                {savedClothingDescription && (
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300 shadow-lg p-6 mb-8 animate-fadeIn">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-lg md:text-xl font-bold text-green-900 flex items-center gap-2">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Your Clothing Preference
                                                    </h4>
                                                    <button
                                                        onClick={() => {
                                                            setSavedClothingDescription('');
                                                            setClothingDescription('');
                                                        }}
                                                        className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
                                                        title="Remove preference"
                                                    >
                                                        <X size={16} />
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-sm">
                                                    <p className="text-gray-700 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                                                        {savedClothingDescription}
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-1 bg-blue-100 border-l-4 border-blue-500 rounded-r-lg p-3">
                                                        <div className="flex items-start gap-2">
                                                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs font-bold text-blue-900 mb-1">✓ Preference Saved</p>
                                                                <p className="text-xs text-blue-800">
                                                                    Our team will review your needs during order validation and recommend the best materials.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            setClothingDescription(savedClothingDescription);
                                                            setAiRecommendations(null); // Clear previous AI recommendations
                                                            setShowDescribeModal(true);
                                                        }}
                                                        className="bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit & Get New AI Suggestions
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Materials Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                                    {materials.map((material) => {
                                        const isSelected = selectedMaterials[material.name];

                                        // Define best clothing types for each material
                                        const clothingTypes = {
                                            'Polypropylene (PP)': {
                                                icon: '👕',
                                                clothes: ['T-shirts', 'Sportswear', 'Casual wear', 'Lightweight garments'],
                                                description: 'Ideal for everyday clothing'
                                            },
                                            'ABS Plastic': {
                                                icon: '🧥',
                                                clothes: ['Jackets', 'Coats', 'Heavy garments', 'Structured clothing'],
                                                description: 'Perfect for heavy-duty items'
                                            },
                                            'Polycarbonate (PC)': {
                                                icon: '👔',
                                                clothes: ['Suits', 'Formal wear', 'Delicate fabrics', 'Premium clothing'],
                                                description: 'Best for high-end garments'
                                            },
                                            'High Impact Polystyrene (HIPS)': {
                                                icon: '👗',
                                                clothes: ['Dresses', 'Blouses', 'Light tops', 'Delicate items'],
                                                description: 'Gentle on fine fabrics'
                                            },
                                            'Polyethylene Terephthalate (PET)': {
                                                icon: '🩳',
                                                clothes: ['Pants', 'Shorts', 'Activewear', 'Durable clothing'],
                                                description: 'Great for everyday use'
                                            },
                                            'Polyvinyl Chloride (PVC)': {
                                                icon: '🧤',
                                                clothes: ['Accessories', 'Outerwear', 'Waterproof items', 'Heavy garments'],
                                                description: 'Durable for all conditions'
                                            }
                                        };

                                        const materialInfo = clothingTypes[material.name] || {
                                            icon: '👚',
                                            clothes: ['Various clothing types'],
                                            description: 'Versatile material'
                                        };

                                        return (
                                            <button
                                                key={material.name}
                                                onClick={() => toggleMaterial(material.name)}
                                                className={`group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 ${isSelected
                                                    ? 'bg-gradient-to-br from-[#E6AF2E] to-[#d4a02a] shadow-xl ring-4 ring-[#E6AF2E] ring-opacity-50'
                                                    : 'bg-white hover:shadow-lg border-2 border-gray-200 hover:border-[#E6AF2E]'
                                                    }`}
                                            >
                                                {/* Selected Badge */}
                                                {isSelected && (
                                                    <div className="absolute top-3 right-3 z-10">
                                                        <div className="bg-white rounded-full p-1.5 shadow-lg">
                                                            <svg className="w-5 h-5 text-[#E6AF2E]" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Card Content */}
                                                <div className="p-5 md:p-6 flex flex-col h-full cursor-pointer">
                                                    {/* Material Icon & Name */}
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className={`text-4xl transform transition-transform group-hover:scale-110 ${isSelected ? 'animate-bounce' : ''}`}>
                                                            {materialInfo.icon}
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <h3 className={`text-lg md:text-xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                                {material.name}
                                                            </h3>
                                                            <p className={`text-xs md:text-sm ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                                                                {materialInfo.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Features */}
                                                    <div className={`mb-4 p-3 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-gray-50'}`}>
                                                        <p className={`text-xs font-semibold mb-2 ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                                            ✨ Key Features:
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {material.features && material.features.length > 0 ? (
                                                                material.features.slice(0, 3).map((feature, i) => (
                                                                    <li key={i} className={`text-xs md:text-sm flex items-start gap-2 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                                                        <span className="mt-0.5">•</span>
                                                                        <span>{feature}</span>
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className={`text-xs md:text-sm ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                                                    High-quality material
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>

                                                    {/* Best For Section */}
                                                    <div className={`p-3 rounded-lg border-2 ${isSelected ? 'bg-white/10 border-white/30' : 'bg-blue-50 border-blue-200'}`}>
                                                        <p className={`text-xs font-semibold mb-2 flex items-center gap-1 ${isSelected ? 'text-white' : 'text-blue-900'}`}>
                                                            <span>👍</span> Best For:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {materialInfo.clothes.slice(0, 3).map((clothing, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${isSelected
                                                                        ? 'bg-white/20 text-white'
                                                                        : 'bg-blue-100 text-blue-800'
                                                                        }`}
                                                                >
                                                                    {clothing}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Hover Instruction */}
                                                    <div className={`mt-4 text-center text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-[#E6AF2E]'}`}>
                                                        {isSelected ? '✓ Selected' : 'Click to select'}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Material Percentage Control */}
                                {Object.keys(selectedMaterials).length > 0 && (
                                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-[#E6AF2E] p-6 md:p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                                    Material Composition
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Adjust percentages to achieve 100% mixture
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-3xl md:text-4xl font-black ${Math.abs(Object.values(selectedMaterials).reduce((sum, val) => sum + val, 0) - 100) < 0.1
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                    {Object.values(selectedMaterials).reduce((sum, val) => sum + val, 0).toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-gray-500 font-semibold">Total</div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-6">
                                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                                                {Object.entries(selectedMaterials).map(([name, percentage], index) => {
                                                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
                                                    return (
                                                        <div
                                                            key={name}
                                                            className={`${colors[index % colors.length]} transition-all duration-300`}
                                                            style={{ width: `${percentage}%` }}
                                                            title={`${name}: ${percentage.toFixed(1)}%`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Material Sliders */}
                                        <div className="space-y-4">
                                            {Object.entries(selectedMaterials).map(([name, percentage], index) => {
                                                const colors = [
                                                    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', slider: 'accent-blue-600' },
                                                    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', slider: 'accent-green-600' },
                                                    { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', slider: 'accent-yellow-600' },
                                                    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', slider: 'accent-purple-600' },
                                                    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300', slider: 'accent-pink-600' },
                                                    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', slider: 'accent-indigo-600' }
                                                ];
                                                const colorScheme = colors[index % colors.length];

                                                return (
                                                    <div
                                                        key={name}
                                                        className={`p-4 rounded-xl border-2 ${colorScheme.bg} ${colorScheme.border} transition-all hover:shadow-md`}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className={`font-bold text-sm md:text-base ${colorScheme.text}`}>
                                                                {name}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={Math.round(percentage)}
                                                                    onChange={(e) => updateMaterialPercentage(name, e.target.value)}
                                                                    className={`w-16 md:w-20 px-2 py-1 border-2 ${colorScheme.border} rounded-lg text-center font-bold ${colorScheme.text} bg-white focus:ring-2 focus:ring-offset-2 ${colorScheme.slider.replace('accent', 'focus:ring')}`}
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                                <span className={`text-lg font-bold ${colorScheme.text}`}>%</span>
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            value={percentage}
                                                            onChange={(e) => updateMaterialPercentage(name, e.target.value)}
                                                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${colorScheme.slider}`}
                                                            min="0"
                                                            max="100"
                                                            step="0.1"
                                                        />
                                                        <div className="flex justify-between mt-2">
                                                            <span className="text-xs text-gray-500">0%</span>
                                                            <span className="text-xs text-gray-500">50%</span>
                                                            <span className="text-xs text-gray-500">100%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Validation Message */}
                                        {Math.abs(Object.values(selectedMaterials).reduce((sum, val) => sum + val, 0) - 100) < 0.1 ? (
                                            <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl flex items-center gap-3">
                                                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <p className="font-bold text-green-800">Perfect! Your material composition is balanced.</p>
                                                    <p className="text-sm text-green-700">You can proceed to the next step.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl flex items-center gap-3">
                                                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <p className="font-bold text-yellow-800">Material percentages must total 100%</p>
                                                    <p className="text-sm text-yellow-700">
                                                        Current total: {Object.values(selectedMaterials).reduce((sum, val) => sum + val, 0).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* No Materials Selected Message */}
                                {Object.keys(selectedMaterials).length === 0 && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
                                        <div className="text-6xl mb-4">🎨</div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            No materials selected yet
                                        </h3>
                                        <p className="text-gray-600">
                                            Click on the material cards above to start building your custom blend, or describe your needs for expert recommendations!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Describe Your Needs Modal */}
                        {showDescribeModal && (
                            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[200] p-4 overflow-y-auto">
                                <div className="bg-white sm:rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-scaleIn">
                                    {/* Modal Header */}
                                    <div className="bg-[#E6AF2E] px-6 py-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-[#191716] text-xl font-bold truncate">AI Material Assistant</h3>
                                                    <p className="text-[#191716]/80 text-sm">Get personalized recommendations</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setShowDescribeModal(false);
                                                    setClothingDescription(savedClothingDescription);
                                                    setAiRecommendations(null);
                                                }}
                                                className="text-[#191716] hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                                        {/* Instructions */}
                                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 mb-6">
                                            <div className="flex gap-3">
                                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-blue-900 mb-2 text-sm">How to describe your needs:</h4>
                                                    <ul className="text-sm text-blue-800 space-y-1">
                                                        <li>• What types of clothing will you hang?</li>
                                                        <li>• Are they heavy coats or light garments?</li>
                                                        <li>• Any special requirements (waterproof, delicate fabrics, etc.)?</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Text Area */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                                Tell us about your clothing needs:
                                            </label>
                                            <textarea
                                                value={clothingDescription}
                                                onChange={(e) => setClothingDescription(e.target.value)}
                                                placeholder="Example: I need hangers for formal wear including suits, dress shirts, and heavy winter coats. The garments are typically heavier and require strong, durable hangers..."
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-sm"
                                                rows="5"
                                                maxLength={1000}
                                            />
                                            <div className="flex justify-between mt-2">
                                                <p className="text-xs text-gray-500">Be as detailed as possible for better recommendations</p>
                                                <p className="text-xs text-gray-400 font-mono">{clothingDescription.length}/1000</p>
                                            </div>
                                        </div>

                                        {/* Example Suggestions */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Quick suggestions (click to add):
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    'Heavy winter coats',
                                                    'Delicate silk dresses',
                                                    'Business suits',
                                                    'Casual t-shirts',
                                                    "Children's clothing",
                                                    'Activewear'
                                                ].map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setClothingDescription(prev =>
                                                            prev ? `${prev}\n• ${suggestion}` : `• ${suggestion}`
                                                        )}
                                                        className="text-xs bg-white hover:bg-blue-50 text-blue-700 px-3 py-2 rounded-full border border-blue-200 transition-colors cursor-pointer font-medium hover:border-blue-400"
                                                    >
                                                        + {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Info Note */}
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4 mb-6">
                                            <div className="flex gap-3">
                                                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-sm text-yellow-800 flex-1">
                                                    <strong>Note:</strong> You can select materials manually, or let our AI analyze your needs and suggest the perfect blend.
                                                </p>
                                            </div>
                                        </div>

                                        {/* AI Recommendations Display */}
                                        {aiRecommendations && (
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 animate-fadeIn">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <h4 className="font-bold text-green-900 text-base">AI Recommendations</h4>
                                                </div>

                                                <div className="bg-white rounded-lg p-4 mb-4">
                                                    <p className="text-sm text-gray-700 mb-3">
                                                        <strong className="text-gray-900">Summary:</strong> {aiRecommendations.summary}
                                                    </p>

                                                    <div className="space-y-3">
                                                        <p className="text-sm font-semibold text-gray-700">Recommended Materials:</p>
                                                        {aiRecommendations.recommendations.map((rec, idx) => (
                                                            <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                                <div className="flex justify-between items-start mb-2 gap-3">
                                                                    <span className="font-semibold text-gray-900 text-sm">{rec.material}</span>
                                                                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold flex-shrink-0">{rec.percentage}%</span>
                                                                </div>
                                                                <p className="text-xs text-gray-600">{rec.reason}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-blue-100 border-l-4 border-blue-500 rounded-r-lg p-3">
                                                    <p className="text-sm text-blue-800 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Recommendations applied! You can adjust the percentages manually if needed.</span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowDescribeModal(false);
                                                    setClothingDescription(savedClothingDescription);
                                                    setAiRecommendations(null);
                                                }}
                                                className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                onClick={() => {
                                                    if (!clothingDescription.trim()) {
                                                        showNotification('Please describe your clothing needs');
                                                        return;
                                                    }

                                                    setSavedClothingDescription(clothingDescription);

                                                    if (!aiRecommendations && !isLoadingAI) {
                                                        getAIMaterialRecommendations();
                                                        return;
                                                    }

                                                    setShowDescribeModal(false);
                                                    showNotification('Your preference has been saved!', 'success');
                                                }}
                                                disabled={!clothingDescription.trim() || isLoadingAI}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] hover:from-[#d4a02a] hover:to-[#c49723] text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {isLoadingAI ? (
                                                    <>
                                                        <LoadingSpinner size="sm" color="white" />
                                                        <span>Processing...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>{aiRecommendations ? 'Save & Apply' : 'Save & Get Recommendations'}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                            Customer Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Enter customer name"
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
                                                disabled={quantity <= 100}
                                                className="border rounded p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                            >
                                                <Minus size={16}></Minus>
                                            </button>
                                            <span className="w-12 text-center">{quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(10)}
                                                className="border rounded p-1 hover:bg-gray-100"
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

                                    {/* Price Breakdown */}
                                    {(() => {
                                        const breakdown = getPriceBreakdown();
                                        if (!breakdown) return null;

                                        return (
                                            <div className="pt-4 border-t space-y-3">
                                                <h3 className="font-semibold mb-3 text-base">Price Computation</h3>

                                                {/* Product Weight Info */}
                                                <div className="bg-blue-50 p-3 rounded text-xs space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Product Weight:</span>
                                                        <span className="font-medium">{breakdown.productWeight}g per unit</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Quantity:</span>
                                                        <span className="font-medium">{quantity} units</span>
                                                    </div>
                                                    <div className="flex justify-between font-semibold border-t border-blue-200 pt-1">
                                                        <span className="text-gray-700">Total Weight:</span>
                                                        <span className="text-blue-700">{breakdown.totalWeight.toFixed(3)} kg</span>
                                                    </div>
                                                </div>

                                                {/* Material Breakdown */}
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm text-gray-700">Material Costs:</h4>
                                                    {breakdown.materials.map((mat, idx) => (
                                                        <div key={idx} className="bg-gray-50 p-3 rounded text-xs space-y-1">
                                                            <div className="font-medium text-gray-800 mb-1">
                                                                {mat.name} ({mat.percentage}%)
                                                            </div>
                                                            <div className="flex justify-between text-gray-600">
                                                                <span>Price per kg:</span>
                                                                <span>₱{mat.pricePerKg.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                            <div className="flex justify-between text-gray-600">
                                                                <span>Material used:</span>
                                                                <span>{mat.weight.toFixed(3)} kg</span>
                                                            </div>
                                                            <div className="flex justify-between text-gray-600">
                                                                <span className="text-xs">({mat.weight.toFixed(3)} kg × ₱{mat.pricePerKg.toFixed(2)})</span>
                                                            </div>
                                                            <div className="flex justify-between font-semibold border-t border-gray-300 pt-1">
                                                                <span className="text-gray-700">Subtotal:</span>
                                                                <span className="text-green-600">₱{mat.cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Total Summary */}
                                                <div className="space-y-1 text-sm border-t-2 pt-3">
                                                    <div className="flex justify-between text-gray-700">
                                                        <span>Total Material Cost:</span>
                                                        <span className="font-semibold">₱{breakdown.totalMaterialCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="border-l-2 border-gray-300 pl-2 py-1 space-y-1">
                                                        <div className="flex justify-between text-gray-700">
                                                            <span className="font-medium">Delivery Fee ({breakdown.deliveryBreakdown.isLocal ? 'Local' : 'International'}):</span>
                                                            <span className="font-semibold">₱{breakdown.deliveryCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-gray-600 ml-3">
                                                            <span>• Base cost:</span>
                                                            <span>₱{breakdown.deliveryBreakdown.baseCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        {breakdown.deliveryBreakdown.additionalCost > 0 && (
                                                            <div className="flex justify-between text-xs text-gray-600 ml-3">
                                                                <span>• Extra weight ({Math.ceil(breakdown.deliveryBreakdown.excessWeight)} kg over {breakdown.deliveryBreakdown.weightLimit} kg):</span>
                                                                <span>₱{breakdown.deliveryBreakdown.additionalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between text-gray-700 pt-1 border-t border-gray-300">
                                                        <span className="font-semibold">Subtotal:</span>
                                                        <span className="font-bold">₱{breakdown.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between text-gray-700">
                                                        <span>VAT ({breakdown.vatRate}% - {breakdown.country}):</span>
                                                        <span className="font-semibold">₱{breakdown.vatAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-lg pt-2 border-t-2">
                                                        <span className="text-gray-900">Estimated Total Price:</span>
                                                        <span className="text-green-600">₱{breakdown.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

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
                                            className="cursor-pointer bg-[#e6af2e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c8971e] transition-colors w-full disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            onClick={handleSubmitOrder}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <LoadingSpinner size="sm" color="white" />
                                                    <span>Submitting Order...</span>
                                                </>
                                            ) : (
                                                'Send for Evaluation'
                                            )}
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
                            <div className="fixed inset-0 flex items-center justify-center backdrop-blue-sm bg-opacity-50 backdrop-blur-sm z-[200] p-3 md:p-4">
                                <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
                                    {/* Success Header with Gradient */}
                                    <div className="bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] px-4 md:px-6 py-4 md:py-8 text-center">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                                            <img
                                                src={validationIcon}
                                                alt="Validation Icon"
                                                className="w-12 h-12"
                                            />
                                        </div>
                                        <h3 className="text-xl md:text-2xl lg:text-3xl text-white font-bold mb-2">
                                            Order Submitted Successfully! <PartyPopper size={32} className="justify-center inline-block md:w-10 md:h-10" />
                                        </h3>
                                        <p className="text-white/90 text-xs md:text-sm">
                                            Your custom hanger order is being reviewed
                                        </p>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-4 md:p-6 lg:p-8">
                                        {/* Order Number Badge */}
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 md:mb-6 border-2 border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#E6AF2E] rounded-lg flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs text-gray-500 font-medium">Order Number</p>
                                                        <p className="text-lg font-bold text-gray-900">
                                                            {companyName ? `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}` : "Generating..."}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const orderNum = companyName ? `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}` : "";
                                                        navigator.clipboard.writeText(orderNum);
                                                    }}
                                                    className="text-[#E6AF2E] hover:text-[#d4a02a] transition-colors"
                                                    title="Copy order number"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Information Box */}
                                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 mb-6">
                                            <div className="flex gap-3">
                                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-blue-900 mb-1">What happens next?</h4>
                                                    <ul className="text-sm text-blue-800 space-y-1">
                                                        <li>• Our team will review your order details</li>
                                                        <li>• You'll receive pricing and timeline information</li>
                                                        <li>• We'll keep you updated via messages</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timeline Steps */}
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-semibold text-green-700">Current: Order Validation</span>
                                            </div>
                                            <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                                    <span>Next: Payment</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                                    <span>Then: Production</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                                    <span>Finally: Delivery</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-3">
                                            {/* View Invoice Button */}
                                            <button
                                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                onClick={() => {
                                                    setShowModal(false);
                                                    setShowInvoiceModal(true);
                                                }}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span>View Invoice</span>
                                            </button>

                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <Link to="/orders" className="flex-1">
                                                    <button
                                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                        onClick={() => setShowModal(false)}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        <span>View My Orders</span>
                                                    </button>
                                                </Link>
                                                <Link to="/messages" className="flex-1">
                                                    <button
                                                        className="w-full bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] hover:from-[#d4a02a] hover:to-[#c49723] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                        onClick={() => setShowModal(false)}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                        </svg>
                                                        <span>Go to Messages</span>
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Note */}
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                        <p className="text-center text-xs text-gray-600">
                                            Expected response time: <span className="font-semibold text-gray-900">Within 24 hours</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Invoice/Receipt Modal */}
                        {showInvoiceModal && submittedOrderData && (
                            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[200] p-3 md:p-4 overflow-y-auto h-[85vh]">
                                <div className="bg-white rounded-lg md:rounded-xl shadow-2xl max-w-3xl w-full my-4 md:my-8 animate-scaleIn">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate">
                                                    {submittedOrderData.hasPayment ? 'Receipt' : 'Invoice'}
                                                </h2>
                                                <p className="text-white/90 text-xs md:text-sm truncate">
                                                    {submittedOrderData.hasPayment ? 'Payment Confirmed' : 'Awaiting Payment'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowInvoiceModal(false)}
                                            className="text-white hover:bg-white/20 p-1.5 md:p-2 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <X size={20} className="md:w-6 md:h-6" />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="p-3 md:p-4 lg:p-6 max-h-[70vh] overflow-y-auto">
                                        {/* Order Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Order Number</p>
                                                <p className="font-bold text-sm md:text-base lg:text-lg">{submittedOrderData.orderNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Date</p>
                                                <p className="font-semibold text-sm md:text-base">{new Date().toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Customer</p>
                                                <p className="font-semibold text-sm md:text-base">{submittedOrderData.companyName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Contact</p>
                                                <p className="font-semibold text-sm md:text-base">{submittedOrderData.contactPerson}</p>
                                                <p className="text-xs md:text-sm text-gray-600">{submittedOrderData.contactPhone}</p>
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                                            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Product Details</h3>
                                            <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2 text-xs md:text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Product:</span>
                                                    <span className="font-semibold">{submittedOrderData.selectedHanger}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Quantity:</span>
                                                    <span className="font-semibold">{submittedOrderData.quantity} units</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Color:</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded border" style={{ backgroundColor: submittedOrderData.color }}></div>
                                                        <span className="font-mono text-xs">{submittedOrderData.color}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <span className="text-gray-600">Materials:</span>
                                                    <div className="text-right">
                                                        {Object.entries(submittedOrderData.selectedMaterials).map(([name, percentage]) => (
                                                            <div key={name} className="font-semibold">{percentage}% {name}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price Breakdown */}
                                        {submittedOrderData.breakdown && (
                                            <div className="mb-4 md:mb-6">
                                                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Price Breakdown</h3>

                                                {/* Weight Info */}
                                                <div className="bg-blue-50 p-2 md:p-3 rounded-lg mb-3 md:mb-4 text-xs md:text-sm space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Product Weight:</span>
                                                        <span className="font-medium">{submittedOrderData.breakdown.productWeight}g per unit</span>
                                                    </div>
                                                    <div className="flex justify-between font-semibold border-t border-blue-200 pt-1">
                                                        <span>Total Weight:</span>
                                                        <span className="text-blue-700">{submittedOrderData.breakdown.totalWeight.toFixed(3)} kg</span>
                                                    </div>
                                                </div>

                                                {/* Material Costs */}
                                                <div className="space-y-3 mb-4">
                                                    <h4 className="font-semibold text-sm">Material Costs:</h4>
                                                    {submittedOrderData.breakdown.materials.map((mat, idx) => (
                                                        <div key={idx} className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                                                            <div className="font-semibold text-gray-800 mb-1">{mat.name} ({mat.percentage}%)</div>
                                                            <div className="flex justify-between text-gray-600">
                                                                <span>Price per kg:</span>
                                                                <span>₱{mat.pricePerKg.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                            <div className="flex justify-between text-gray-600">
                                                                <span>Material used:</span>
                                                                <span>{mat.weight.toFixed(3)} kg</span>
                                                            </div>
                                                            <div className="flex justify-between font-semibold border-t border-gray-300 pt-1">
                                                                <span>Subtotal:</span>
                                                                <span className="text-green-600">₱{mat.cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Total Summary */}
                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-700">Total Material Cost:</span>
                                                        <span className="font-semibold">₱{submittedOrderData.breakdown.totalMaterialCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="border-l-2 border-green-300 pl-2 py-1 space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-700 font-medium">Delivery Fee ({submittedOrderData.breakdown.deliveryBreakdown.isLocal ? 'Local' : 'International'}):</span>
                                                            <span className="font-semibold">₱{submittedOrderData.breakdown.deliveryCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-gray-600 ml-3">
                                                            <span>• Base cost:</span>
                                                            <span>₱{submittedOrderData.breakdown.deliveryBreakdown.baseCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        {submittedOrderData.breakdown.deliveryBreakdown.additionalCost > 0 && (
                                                            <div className="flex justify-between text-xs text-gray-600 ml-3">
                                                                <span>• Extra weight ({Math.ceil(submittedOrderData.breakdown.deliveryBreakdown.excessWeight)} kg over {submittedOrderData.breakdown.deliveryBreakdown.weightLimit} kg):</span>
                                                                <span>₱{submittedOrderData.breakdown.deliveryBreakdown.additionalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between text-sm pt-2 border-t border-green-300">
                                                        <span className="text-gray-700 font-semibold">Subtotal:</span>
                                                        <span className="font-bold">₱{submittedOrderData.breakdown.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-700">VAT ({submittedOrderData.breakdown.vatRate}% - {submittedOrderData.breakdown.country}):</span>
                                                        <span className="font-semibold">₱{submittedOrderData.breakdown.vatAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-xl pt-2 border-t-2 border-green-400">
                                                        <span className="text-gray-900">Estimated Total Amount:</span>
                                                        <span className="text-green-600">₱{submittedOrderData.breakdown.totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Payment Status */}
                                        {submittedOrderData.hasPayment ? (
                                            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-green-900">Payment Received</p>
                                                        <p className="text-sm text-green-700">Thank you for your payment!</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-yellow-900">Payment Pending</p>
                                                        <p className="text-sm text-yellow-700">Please proceed to payment after order validation</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-gray-50 px-3 md:px-4 lg:px-6 py-3 md:py-4 border-t flex flex-col sm:flex-row gap-2 md:gap-3">
                                        <button
                                            onClick={() => window.print()}
                                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                                        >
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            <span className="hidden sm:inline">Print {submittedOrderData.hasPayment ? 'Receipt' : 'Invoice'}</span>
                                            <span className="sm:hidden">Print</span>
                                        </button>
                                        <button
                                            onClick={handleDownloadInvoice}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                                        >
                                            <Download size={16} className="md:w-5 md:h-5" />
                                            <span className="hidden sm:inline">Download {submittedOrderData.hasPayment ? 'Receipt' : 'Invoice'}</span>
                                            <span className="sm:hidden">Download</span>
                                        </button>
                                        <button
                                            onClick={() => setShowInvoiceModal(false)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all text-xs md:text-sm"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add animation styles if not already present */}
                        <style jsx>{`
                        @keyframes scaleIn {
                            from {
                            opacity: 0;
                            transform: scale(0.9);
                        }
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }
                        .animate-scaleIn {
                        animation: scaleIn 0.3s ease-out;
                        }
                        `}</style>

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
                    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 backdrop-blur-sm z-[9999] p-3 md:p-4">
                        <div className="bg-white rounded-lg md:rounded-xl shadow-xl p-4 md:p-6 lg:p-8 max-w-2xl max-h-[80vh] md:max-h-[80vh] overflow-y-auto w-full relative z-[10000] animate-scaleIn">
                            <div className="flex justify-between items-start md:items-center mb-4 md:mb-6 gap-2">
                                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                    <Info className="text-[#007BFF] flex-shrink-0" size={20} />
                                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[#007BFF]">
                                        Ordering Process Instructions
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowInstructionsModal(false)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0 p-1"
                                >
                                    <X size={20} className="md:w-6 md:h-6" />
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
                                        <div className="bg-[#f1b322] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                            1
                                        </div>
                                        <div className="flex-1">
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
                                        <div className="bg-[#f1b322] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                            2
                                        </div>
                                        <div className="flex-1">
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
                                        <div className="bg-[#f1b322] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                            3
                                        </div>
                                        <div className="flex-1">
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
                                        <div className="bg-[#f1b322] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                            4
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg">Review & Submit</h4>
                                            <p className="text-gray-600">
                                                Check your order summary, confirm your delivery address,
                                                and submit for evaluation.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="bg-[#f1b322] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                                            5
                                        </div>
                                        <div className="flex-1">
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
                                        className="bg-[#191716] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#f1b322] transition-colors hover:text-[#191716] cursor-pointer"
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
                    <div className="fixed inset-0 bg-[#191716] z-[200] flex flex-col">
                        {/* Header with Close Button */}
                        <div className="flex justify-between items-center p-3 md:p-4 bg-[#191716] backdrop-blur-sm border-b-2 border-[#E6AF2E]">
                            <div className="flex items-center gap-2 md:gap-3">
                                <h3 className="text-white text-base md:text-lg lg:text-xl font-semibold">3D Preview</h3>
                                <span className="text-[#E6AF2E] text-xs md:text-sm">({selectedHanger})</span>
                            </div>
                            <button
                                onClick={toggleFullscreen}
                                className="text-white hover:bg-[#f1b322] hover:text-white p-2 rounded-lg transition-colors"
                                title="Exit Fullscreen cursor-pointer"
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
                                            <div className="comic-panel" style={{ background: '#191716', borderColor: '#E6AF2E' }}>
                                                <div className="container-items">
                                                    <button
                                                        className={`item-color ${color === '#e11d48' ? 'selected' : ''}`}
                                                        style={{ '--color': '#e11d48' }}
                                                        aria-color="#e11d48"
                                                        onClick={() => updateThreeJsColor('#e11d48')}
                                                    />
                                                    <button
                                                        className={`item-color ${color === '#f472b6' ? 'selected' : ''}`}
                                                        style={{ '--color': '#f472b6' }}
                                                        aria-color="#f472b6"
                                                        onClick={() => updateThreeJsColor('#f472b6')}
                                                    />
                                                    <button
                                                        className={`item-color ${color === '#fb923c' ? 'selected' : ''}`}
                                                        style={{ '--color': '#fb923c' }}
                                                        aria-color="#fb923c"
                                                        onClick={() => updateThreeJsColor('#fb923c')}
                                                    />
                                                    <button
                                                        className={`item-color ${color === '#facc15' ? 'selected' : ''}`}
                                                        style={{ '--color': '#facc15' }}
                                                        aria-color="#facc15"
                                                        onClick={() => updateThreeJsColor('#facc15')}
                                                    />
                                                    <button
                                                        className={`item-color ${color === '#84cc16' ? 'selected' : ''}`}
                                                        style={{ '--color': '#84cc16' }}
                                                        aria-color="#84cc16"
                                                        onClick={() => updateThreeJsColor('#84cc16')}
                                                    />
                                                    <button
                                                        className={`item-color ${color === '#10b981' ? 'selected' : ''}`}
                                                        style={{ '--color': '#10b981' }}
                                                        aria-color="#10b981"
                                                        onClick={() => updateThreeJsColor('#10b981')}
                                                    />
                                                    <button
                                                        className={`item-color ${color === '#0ea5e9' ? 'selected' : ''}`}
                                                        style={{ '--color': '#0ea5e9' }}
                                                        aria-color="#0ea5e9"
                                                        onClick={() => updateThreeJsColor('#0ea5e9')}
                                                    />
                                                    <button
                                                        className={`item-color ${color === '#3b82f6' ? 'selected' : ''}`}
                                                        style={{ '--color': '#3b82f6' }}
                                                        aria-color="#3b82f6"
                                                        onClick={() => updateThreeJsColor('#3b82f6')}
                                                    />
                                                    <button
                                                        className={`item-color ${color === '#8b5cf6' ? 'selected' : ''}`}
                                                        style={{ '--color': '#8b5cf6' }}
                                                        aria-color="#8b5cf6"
                                                        onClick={() => updateThreeJsColor('#8b5cf6')}
                                                    />
                                                    <button
                                                        className={`item-color ${color === '#a78bfa' ? 'selected' : ''}`}
                                                        style={{ '--color': '#a78bfa' }}
                                                        aria-color="#a78bfa"
                                                        onClick={() => updateThreeJsColor('#a78bfa')}
                                                    />
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
                                                    onChange={(e) => setTextPosition({ ...textPosition, x: parseFloat(e.target.value) })}
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
                                                    onChange={(e) => setTextPosition({ ...textPosition, y: parseFloat(e.target.value) })}
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
                                                    onChange={(e) => setTextPosition({ ...textPosition, z: parseFloat(e.target.value) })}
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
                                <div className="bg-[#191716]/70 rounded-lg p-3 md:p-4 border border-[#E6AF2E]">
                                    <h4 className="text-[#E6AF2E] font-semibold mb-2 md:mb-3 text-xs md:text-sm">Logo</h4>
                                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#E6AF2E] rounded-lg p-2 md:p-3 cursor-pointer hover:bg-[#E6AF2E] transition-colors">
                                        <ImageIcon size={16} className="text-white" />
                                        <span className="text-xs text-white ">
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
                                                            onChange={(e) => setLogoPosition({ ...logoPosition, x: parseFloat(e.target.value) })}
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
                                                            onChange={(e) => setLogoPosition({ ...logoPosition, y: parseFloat(e.target.value) })}
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
                                                            onChange={(e) => setLogoPosition({ ...logoPosition, z: parseFloat(e.target.value) })}
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

                {/* Save Design Modal */}
                {saveDesignModal && (
                    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[200] p-3 md:p-4">
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
                            {/* Modal Header with Gradient */}
                            <div className="bg-[#E6AF2E] px-4 md:px-6 py-4 md:py-6">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                            <Save className="w-5 h-5 md:w-6 md:h-6 text-[#E6AF2E]" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-[#191716]">Save Your Design</h3>
                                            <p className="text-xs md:text-sm text-[#191716]/80 hidden sm:block">Access it anytime from your account</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSaveDesignModal(false)}
                                        className="text-[#191716] cursor-pointer hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto">
                                {/* Design Name Input */}
                                <div className="mb-4 md:mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Design Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={designName}
                                            onChange={(e) => setDesignName(e.target.value)}
                                            placeholder="e.g., Red 97-12 with Logo"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6AF2E] focus:border-transparent transition-all"
                                            autoFocus
                                            maxLength={50}
                                        />
                                        <div className="absolute right-3 top-3 text-xs text-gray-400">
                                            {designName.length}/50
                                        </div>
                                    </div>
                                    {!designName.trim() && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Give your design a memorable name
                                        </p>
                                    )}
                                </div>

                                {/* Design Preview Card */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border-2 border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#E6AF2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Design Preview
                                        </h4>
                                        {capturedThumbnail && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                                                ✓ Thumbnail Ready
                                            </span>
                                        )}
                                    </div>

                                    {/* Thumbnail Preview */}
                                    {capturedThumbnail && (
                                        <div className="mb-4 flex justify-center">
                                            <div className="relative">
                                                <img
                                                    src={capturedThumbnail}
                                                    alt="Design thumbnail"
                                                    className="w-32 h-32 object-cover rounded-lg border-4 border-white shadow-lg"
                                                />
                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#E6AF2E] rounded-full flex items-center justify-center shadow-lg">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Design Details Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white rounded-lg p-3 shadow-sm">
                                            <p className="text-xs text-gray-500 mb-1">Hanger Model</p>
                                            <p className="font-bold text-gray-900">{selectedHanger}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 shadow-sm">
                                            <p className="text-xs text-gray-500 mb-1">Color</p>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded border-2 border-gray-300 shadow-sm"
                                                    style={{ backgroundColor: color }}
                                                ></div>
                                                <span className="font-mono text-xs font-bold text-gray-900">{color}</span>
                                            </div>
                                        </div>
                                        {customText && (
                                            <div className="bg-white rounded-lg p-3 shadow-sm col-span-2">
                                                <p className="text-xs text-gray-500 mb-1">Custom Text</p>
                                                <p className="font-semibold text-gray-900 text-sm">"{customText}"</p>
                                            </div>
                                        )}
                                        {logoPreview && (
                                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                                <p className="text-xs text-gray-500 mb-1">Logo</p>
                                                <div className="flex items-center gap-2">
                                                    <img src={logoPreview} alt="Logo" className="w-8 h-8 object-contain rounded border" />
                                                    <span className="text-green-600 font-semibold text-sm">✓ Included</span>
                                                </div>
                                            </div>
                                        )}
                                        {Object.keys(selectedMaterials).length > 0 && (
                                            <div className="bg-white rounded-lg p-3 shadow-sm col-span-2">
                                                <p className="text-xs text-gray-500 mb-1">Materials</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Object.entries(selectedMaterials).map(([name, percentage]) => (
                                                        <span
                                                            key={name}
                                                            className="text-xs bg-[#E6AF2E] text-white px-2 py-1 rounded-full font-semibold"
                                                        >
                                                            {name} {Math.round(percentage)}%
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3 mb-6">
                                    <div className="flex gap-2">
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-xs text-blue-800">
                                            Your design will be saved to your account and can be accessed from <strong>Account Settings → Designs</strong>
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSaveDesignModal(false)}
                                        className="cursor-pointer flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold text-gray-700 shadow-sm hover:shadow-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmSaveDesign}
                                        disabled={isSaving || !designName.trim()}
                                        className="cursor-pointer flex-1 px-6 py-3 bg-gradient-to-r from-[#E6AF2E] to-[#d4a02a] hover:from-[#d4a02a] hover:to-[#c49723] text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save Design
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Color Limitation Modal for 97-12 and 97-11 */}
                {showColorLimitationModal && (
                    <div className="fixed inset-0 backdrop-blue-sm bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[200] p-3 md:p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
                            {/* Modal Header */}
                            <div className="bg-[#E6AF2E] px-4 md:px-6 py-4 md:py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <Info className="w-5 h-5 md:w-6 md:h-6 text-[#191716]" />
                                    </div>
                                    <h3 className="text-[#191716] text-lg md:text-xl font-bold">Color Customization Notice</h3>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 md:p-6">
                                {/* Visual Representation */}
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="text-3xl">🪝</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">Model {selectedHanger}</p>
                                            <p className="text-xs text-gray-600">Limited color customization</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700"><strong>Main body</strong> - Color applies</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700"><strong>Clips</strong> - Color applies</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-500"><strong>Hooks & bars</strong> - Color won't change</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Text */}
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-yellow-800 font-medium">
                                                Please note: Hooks and bars will maintain their default color regardless of your selected color.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-gray-600 text-sm">
                                    This is a design limitation specific to this model. All other parts can be fully customized.
                                </p>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-5 md:px-6 py-4 flex justify-center border-t border-gray-200">
                                <button
                                    onClick={() => setShowColorLimitationModal(false)}
                                    className="bg-[#E6AF2E] cursor-pointer text-white font-semibold px-8 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm md:text-base"
                                >
                                    I Understand
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notification Modal */}
                {notificationModal.show && (
                    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[200] p-3 md:p-4">
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
                            {/* Modal Header */}
                            <div className={`px-4 md:px-6 py-3 md:py-5 ${notificationModal.type === 'success'
                                ? 'bg-gradient-to-r from-[#4ade80] to-[#22c55e]'
                                : 'bg-gradient-to-r from-[#ff6b6b] to-[#ef4444]'
                                }`}>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        {notificationModal.type === 'success' ? (
                                            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#4ade80]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#ff6b6b]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[#191716]">
                                        {notificationModal.type === 'success' ? 'Success!' : 'Error'}
                                    </h2>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 md:p-6 lg:p-8">
                                <div className={`p-3 md:p-4 rounded-lg border-l-4 ${notificationModal.type === 'success'
                                    ? 'bg-green-50 border-green-400'
                                    : 'bg-red-50 border-red-400'
                                    }`}>
                                    <p className={`text-sm md:text-base lg:text-lg leading-relaxed ${notificationModal.type === 'success'
                                        ? 'text-green-800'
                                        : 'text-red-800'
                                        }`}>
                                        {notificationModal.message}
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={() => setNotificationModal({ show: false, type: '', message: '' })}
                                    className={`px-4 md:px-6 lg:px-8 py-2 md:py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-xs md:text-sm lg:text-base cursor-pointer ${notificationModal.type === 'success'
                                        ? 'bg-gradient-to-r from-[#4ade80] to-[#22c55e] hover:from-[#22c55e] hover:to-[#16a34a] text-[#191716]'
                                        : 'bg-gradient-to-r from-[#ff6b6b] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-[#191716]'
                                        }`}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
