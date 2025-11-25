import React from 'react';
import { Upload } from 'lucide-react';
import ProductCard from '../productcard';

const Step1Selection = ({
    selectedHanger,
    setSelectedHanger,
    selectedMaterials,
    customDesignFile,
    hangers,
    materials,
    toggleMaterial,
    updateMaterialPercentage,
    handleCustomDesignUpload,
    setShowColorLimitationModal
}) => {
    return (
        <div className="space-y-8 md:space-y-12">
            {/* Hanger Selection */}
            <div className="flex flex-col items-center justify-center">
                <h3 className="text-black text-2xl md:text-3xl lg:text-4xl font-medium mb-6 md:mb-10">
                    Select the type of hanger you want
                </h3>
            </div>

            <section>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {hangers.map((hanger) => (
                        <button
                            key={hanger.id}
                            onClick={() => {
                                setSelectedHanger(hanger.id);
                                // Show modal for MB7 and 97-11
                                if (hanger.id === 'MB7' || hanger.id === '97-11') {
                                    setShowColorLimitationModal(true);
                                }
                            }}
                            className={`border-2 rounded-lg overflow-hidden transition-all ${selectedHanger === hanger.id
                                    ? "border-[#35408E] shadow-lg"
                                    : "border-gray-300"
                                }`}
                        >
                            <div className="bg-white p-4 md:p-6 lg:p-8 flex items-center justify-center aspect-square">
                                <div className="text-4xl md:text-5xl lg:text-6xl">
                                    <ProductCard />
                                </div>
                            </div>
                            <div className="bg-[#ECBA0B] py-2 md:py-3 font-semibold text-center text-sm md:text-base">
                                {hanger.name}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Custom Design Upload */}
                {selectedHanger === "own" && (
                    <div className="mt-4 md:mt-6 p-4 md:p-6 bg-white rounded-lg border-2 border-gray-300">
                        <h4 className="font-semibold mb-3 text-sm md:text-base">Upload Your Custom Design</h4>
                        <p className="text-xs md:text-sm text-gray-600 mb-3">
                            Accepted formats: STL, OBJ, STEP, PDF (technical drawing)
                        </p>
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-400 rounded-lg p-4 md:p-6 cursor-pointer hover:border-[#35408E] transition-colors">
                            <Upload size={24} />
                            <span>
                                {customDesignFile
                                    ? customDesignFile.name
                                    : "Click to upload design file"}
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
            </section>

            {/* Material Selection */}
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
        </div>
    );
};

export default Step1Selection;
