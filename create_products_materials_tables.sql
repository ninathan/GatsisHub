-- Create products table for hanger types
CREATE TABLE IF NOT EXISTS products (
    productid SERIAL PRIMARY KEY,
    productname TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
    materialid SERIAL PRIMARY KEY,
    materialname TEXT NOT NULL UNIQUE,
    features TEXT[], -- Array of feature descriptions
    is_active BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert existing product types
INSERT INTO products (productname, description) VALUES
('MB3', 'Standard hanger model MB3'),
('97-12', 'Hanger model 97-12'),
('CQ-807', 'Hanger model CQ-807'),
('97-11', 'Hanger model 97-11'),
('97-08', 'Hanger model 97-08')
ON CONFLICT (productname) DO NOTHING;

-- Insert existing material types
INSERT INTO materials (materialname, features) VALUES
('Polypropylene (PP)', ARRAY[
    'Lightweight yet strong',
    'Good chemical resistance',
    'Flexible enough to prevent breaking under stress',
    'Easy to mold, often used for colorful or custom-shaped'
]),
('Acrylonitrile Butadiene Styrene (ABS)', ARRAY[
    'Durable and impact-resistant',
    'Has a smooth, glossy finish for premium look',
    'Resistant to physical wear',
    'Often used for sturdy, designer-style hangers/hangers'
]),
('Polystyrene (PS) / High Impact polystyrene (HIPS)', ARRAY[
    'Rigid and glossy',
    'Economical but still offers a clean, high-quality finish',
    'Used in hangers that require a firm structure'
]),
('Nylon (Polyamide)', ARRAY[
    'Strong, flexible, and durable',
    'Resistant to wear and some chemicals',
    'Used in specialized or high-end hangers requiring flexibility'
]),
('Polycarbonate (PC)', ARRAY[
    'Very strong and tough',
    'Transparent or can be colored',
    'Resistance to heat and wear',
    'Often used for premium, transparent, or designer hangers'
])
ON CONFLICT (materialname) DO NOTHING;

-- Add comments
COMMENT ON TABLE products IS 'Stores available hanger product types';
COMMENT ON TABLE materials IS 'Stores available material types with their features';
