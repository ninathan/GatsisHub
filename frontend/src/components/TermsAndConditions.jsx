// TermsAndConditions.jsx
import React from 'react';

const TermsAndConditions = ({
    effectiveDate = "June 2, 2025",
    companyName = "GatsisHub",
    websiteUrl = "GatsisHub.com",
    email = "support@gatsishub.com",
    phone = "Your Contact Number",
    address = "SIERRA MADRE BLDG. VICTORIA WAVE-SEZ, BRGY. 186 TALA, NORTH CALOOCAN",
    officeHours = "Monday–Saturday, 9:00 AM – 5:00 PM (PHT)",
    currency = "PHP",
    jurisdiction = "Republic of the Philippines"
}) => {
    return (
        <div className='max-w-4xl mx-auto p-6 '>
            <p className='text-white mb-6'>Effective Date: {effectiveDate}</p>

            <p className='mb-4'>
                Welcome to {companyName}. These Terms and Conditions ("Terms") govern your access to and use of our website {websiteUrl} and any related services, including the purchase of products through our e-commerce platform.
            </p>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using this website and placing orders for our custom bulk hanger services, you agree to comply with and be legally bound by these Terms of Service ("Terms"). If you do not agree with these Terms, you must not use this website or our services.
                </p>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>2. Our Services</h2>
                <p>
                    {companyName} offers custom-made bulk orders of hangers based on your specifications. We cater to businesses looking for personalized hanger production at scale. Our services include material selection, color choice, sizing, and optional printing (e.g., logos or labels).
                    All services are offered within the jurisdiction of the {jurisdiction}.
                </p>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>3. Eligibility</h2>
                <p>
                    You must be at least 18 years old and have the legal capacity to enter into binding agreements to use our website and services. By using the site, you represent and warrant that you meet these eligibility requirements.
                </p>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>4. Account Registration</h2>
                <p className='mb-2'>To place an order, you may be required to register for an account. When doing so, you agree to:</p>
                <ul className='list-disc pl-6 space-y-1'>
                    <li>Provide true, current, and complete information.</li>
                    <li>Keep your login credentials confidential.</li>
                    <li>Be responsible for all activities under your account.</li>
                </ul>
                <p className='mt-2'>We reserve the right to suspend or terminate your account if you violate any part of these Terms.</p>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>5. Quotations and Orders</h2>
                <ul className='list-disc pl-6 space-y-1'>
                    <li>All custom orders must go through our official quotation process.</li>
                    <li>You must provide clear specifications, including but not limited to: material type, size, color, design, quantity, and deadline.</li>
                    <li>We will issue a formal quotation valid for a limited time.</li>
                    <li>Production begins only after you confirm the quotation and we receive full payment.</li>
                    <li>All confirmed custom orders are final and non-refundable, except under specific conditions outlined in Section 9.</li>
                </ul>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>6. Pricing and Payment</h2>
                <ul className='list-disc pl-6 space-y-1'>
                    <li>Prices are listed in {currency} and may be adjusted without prior notice.</li>
                    <li>Pricing includes manufacturing and standard packaging. Shipping is calculated separately.</li>
                    <li>Accepted payment methods include GCash, bank transfer, PayPal, and other local gateways.</li>
                    <li>Full payment is required to confirm an order and initiate production.</li>
                    <li>We reserve the right to cancel unpaid or incomplete orders without notice.</li>
                </ul>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>7. Production and Lead Time</h2>
                <p className='mb-2'>
                    Production timelines vary depending on order complexity and quantity. Estimated completion times will be provided in your quotation. We are not liable for production delays due to:
                </p>
                <ul className='list-disc pl-6 space-y-1'>
                    <li>Force majeure (e.g., typhoons, power outages)</li>
                    <li>Supply disruptions</li>
                    <li>Incomplete or delayed specifications from the client</li>
                </ul>
                <p className='mt-2'>We will communicate any expected delays promptly.</p>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>8. Shipping and Delivery</h2>
                <ul className='list-disc pl-6 space-y-1'>
                    <li>We ship orders nationwide via trusted courier services.</li>
                    <li>Delivery fees and timelines vary depending on location.</li>
                    <li>We will provide tracking details once the order is shipped.</li>
                    <li>We are not responsible for courier delays, lost parcels, or incorrect shipping addresses provided by you.</li>
                    <li>Ownership and risk transfer to you upon release of goods to the courier.</li>
                </ul>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>9. Cancellations, Returns, and Refunds</h2>
                <p className='mb-2'>Since we offer custom-made products, cancellations and refunds are not allowed once production begins.</p>
                <p className='mb-2'>Refunds or product replacements are only applicable if:</p>
                <ul className='list-disc pl-6 space-y-1 mb-2'>
                    <li>The delivered items are defective or damaged due to our manufacturing error.</li>
                    <li>The final product does not match your approved specifications.</li>
                </ul>
                <p className='mb-2'>To file a return or refund request:</p>
                <ul className='list-disc pl-6 space-y-1'>
                    <li>Contact us within 3 business days of delivery.</li>
                    <li>Include photos of the issue and a detailed explanation.</li>
                    <li>We will evaluate the request and offer a resolution (replacement, partial refund, or full refund if applicable).</li>
                    <li>Returns due to customer error (e.g., incorrect specs submitted) are not eligible for refunds.</li>
                </ul>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>10. Intellectual Property</h2>
                <p className='mb-2'>
                    All content on this website—including product images, designs, logos, texts, and graphics—is owned by or licensed to GT Gatsis Corporation. You may not reproduce, redistribute, or commercially use any content without our written consent.
                </p>
                <p>
                    Custom logos or materials provided by clients remain the intellectual property of the client. By submitting such content, you confirm you have the right to use it.
                </p>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>11. Prohibited Activities</h2>
                <p className='mb-2'>You agree not to use this site or our services to:</p>
                <ul className='list-disc pl-6 space-y-1'>
                    <li>Submit false, misleading, or fraudulent information.</li>
                    <li>Violate any local or national law in the Philippines.</li>
                    <li>Upload harmful files, malware, or interfere with website operations.</li>
                    <li>Impersonate any person or misrepresent your identity.</li>
                    <li>Collect personal data from other users or attempt unauthorized access to the site.</li>
                </ul>
                <p className='mt-2'>Violation may result in immediate account termination and legal action.</p>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>12. Limitation of Liability</h2>
                <p className='mb-2'>To the extent permitted by law, GT Gatsis Corporation is not liable for:</p>
                <ul className='list-disc pl-6 space-y-1'>
                    <li>Indirect, incidental, or consequential damages.</li>
                    <li>Loss of income, business opportunities, or data.</li>
                    <li>Delays or failure to deliver due to circumstances beyond our control.</li>
                </ul>
                <p className='mt-2'>In all cases, our total liability will not exceed the value of the order you placed.</p>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>13. Changes to Terms</h2>
                <p>
                    We may update these Terms at any time. Any changes will be posted on this page with a revised "Effective Date." Continued use of the website after changes are made indicates your acceptance of the revised Terms.
                </p>
            </section>

            <section className='mb-6'>
                <h2 className='text-2xl font-semibold mb-3'>14. Contact Information</h2>
                <p className='mb-2'>If you have questions or concerns regarding these Terms, contact us at:</p>
                <ul className='space-y-1'>
                    <li><strong>Email:</strong> {email}</li>
                    <li><strong>Phone:</strong> {phone}</li>
                    <li><strong>Business Address:</strong> {address}</li>
                    <li><strong>Office Hours:</strong> {officeHours}</li>
                </ul>
            </section>
        </div>
    );
};

export default TermsAndConditions;