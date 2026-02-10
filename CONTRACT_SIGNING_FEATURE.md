# Contract Signing Feature Implementation

## Overview
The contract signing feature requires customers to digitally sign a contract before they can make payment for orders in "Waiting for Payment" status. This ensures legal compliance and protects both the company and customers.

## Feature Components

### 1. Database Schema (`add_contract_fields.sql`)
Added three new columns to the `orders` table:
- `contract_signed` (BOOLEAN, default: FALSE) - Tracks if the contract has been signed
- `contract_signed_date` (TIMESTAMP) - Records when the contract was signed
- `contract_data` (JSONB) - Stores the complete contract details including:
  - Digital signature (base64 dataURL)
  - Contract HTML content
  - Signature date
  - All auto-filled contract information

**To apply migration:**
```sql
-- Run this in your Supabase SQL Editor
\i add_contract_fields.sql
```

### 2. Contract Modal Component (`frontend/src/components/ContractModal.jsx`)

**Features:**
- Digital signature pad using `react-signature-canvas`
- Auto-fills contract with order data:
  - Customer company name
  - Product type and quantity
  - Material specifications
  - Delivery date (deadline)
  - Total price
  - Compensation clause (10% of total price)
  - Jurisdiction (Metro Manila, Philippines)
  - Sales admin name as company representative
- Agreement checkbox requirement
- Download contract as HTML file
- View-only mode for signed contracts

**Props:**
- `order` (object) - The order data
- `onClose` (function) - Close modal callback
- `onContractSigned` (function) - Success callback after signing

### 3. Backend Endpoint (`backend/routes/orders.js`)

**Endpoint:** `PATCH /orders/:orderid/sign-contract`

**Request Body:**
```json
{
  "contract_data": {
    "signature": "data:image/png;base64,...",
    "contractHTML": "<html>...</html>",
    "signedDate": "2024-01-15T10:30:00.000Z",
    "terms": {...}
  }
}
```

**Response:**
```json
{
  "message": "Contract signed successfully",
  "order": {
    "orderid": 123,
    "contract_signed": true,
    "contract_signed_date": "2024-01-15T10:30:00.000Z"
  }
}
```

**Functionality:**
- Updates `contract_signed` to `true`
- Sets `contract_signed_date` to current timestamp
- Stores `contract_data` in JSONB format
- Creates in-app notification for customer
- Sends email notification to customer

### 4. Customer Interface Integration (`frontend/src/pages/CustomerPages/Order.jsx`)

**User Flow:**
1. Order reaches "Waiting for Payment" status (set by sales admin after price finalization)
2. Customer views order and sees "Sign Contract" button
3. Customer clicks button and contract modal opens
4. Customer:
   - Reviews all auto-filled contract details
   - Signs digitally on the signature pad
   - Checks the agreement checkbox
   - Optionally downloads contract for their records
   - Clicks "Submit Contract"
5. Contract is signed and stored
6. "Sign Contract" button changes to "View Contract"
7. "Payment" button becomes visible and accessible
8. Customer can proceed with payment

**Key Code Changes:**
- Imported `ContractModal` component
- Added state: `showContractModal`, `orderToSign`
- Added handlers: `openContractModal()`, `closeContractModal()`, `handleContractSigned()`
- Modified payment button visibility: Only shows when `order.contract_signed === true`
- Added "Sign Contract" button: Shows when `status === 'Waiting for Payment' AND !contract_signed`
- Added "View Contract" button: Shows when `contract_signed === true`

### 5. Sales Admin Interface Integration (`frontend/src/pages/SalesAdminPages/OrderDetail.jsx`)

**Features:**
- Contract status display section for "Waiting for Payment" orders
- Shows two states:
  - **Contract Signed**: Green badge with signed date and "View Signed Contract" button
  - **Awaiting Signature**: Orange badge indicating customer needs to sign
- View contract button opens the signed contract in a new window

**Contract Status Display:**
- Only visible for orders in "Waiting for Payment" status
- Color-coded indicators (green for signed, orange for pending)
- Displays signature timestamp
- One-click access to view the full signed contract

## Contract Template Details

### Key Sections:
1. **Order Details**
   - Order number, date, customer company
   - Product specifications (type, quantity, materials)
   - Delivery date and location

2. **Terms & Conditions**
   - Service description (3D Hanger Manufacturing)
   - Quality standards
   - Delivery terms
   - Payment terms
   - Cancellation policy
   - Warranty information
   - Liability limitations

3. **Compensation Clause**
   - Customer entitled to 10% of total price if company fails to deliver by deadline
   - Calculated automatically: `Total Price × 0.10`

4. **Legal Provisions**
   - Governing law: Republic of the Philippines
   - Jurisdiction: Metro Manila courts
   - Force majeure clause
   - Entire agreement clause

5. **Signatures**
   - Company representative: Sales admin's name (auto-filled)
   - Customer representative: Digital signature
   - Date: Auto-filled when signed

## Payment Flow with Contract

### Before Contract Implementation:
```
Order → For Evaluation → Waiting for Payment → Upload Payment → Processing
```

### After Contract Implementation:
```
Order → For Evaluation → Waiting for Payment → 
  ↓
Sign Contract (new requirement)
  ↓
Upload Payment → Verifying Payment → Processing
```

## Security & Legal Considerations

1. **Digital Signatures**
   - Captured as PNG dataURL
   - Stored securely in JSONB column
   - Timestamp recorded for legal validity
   - Non-repudiable once signed

2. **Data Integrity**
   - Contract data stored immutably
   - All contract details preserved
   - Original terms cannot be changed after signing

3. **Legal Compliance**
   - Contract follows Philippine law
   - Clear compensation terms
   - Proper jurisdiction clauses
   - Force majeure provisions

## Testing Checklist

### Customer Side:
- [ ] "Sign Contract" button appears when order status is "Waiting for Payment"
- [ ] Contract modal opens with all order data correctly filled
- [ ] Signature pad works (can draw and clear)
- [ ] Agreement checkbox must be checked to enable submit
- [ ] Download contract button works
- [ ] Contract submits successfully
- [ ] "Sign Contract" changes to "View Contract" after signing
- [ ] Payment button appears only after contract is signed
- [ ] "View Contract" shows the signed contract correctly

### Sales Admin Side:
- [ ] Contract status section appears for "Waiting for Payment" orders
- [ ] Shows "Awaiting Customer Signature" when not signed
- [ ] Shows "Contract Signed" with date when signed
- [ ] "View Signed Contract" button works
- [ ] Contract opens in new window with all details

### Backend:
- [ ] `/orders/:orderid/sign-contract` endpoint works
- [ ] Database columns update correctly
- [ ] Notification is created for customer
- [ ] Error handling works properly

## Dependencies

### NPM Packages Required:
```json
{
  "react-signature-canvas": "^1.0.6"
}
```

**Installation:**
```bash
cd frontend
npm install react-signature-canvas
```

## Database Migration

**Apply the migration:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `add_contract_fields.sql`
3. Run the SQL
4. Verify columns added:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name LIKE 'contract%';
```

## Troubleshooting

### Contract button not showing:
- Verify order status is exactly "Waiting for Payment"
- Check `contract_signed` is `false` in database
- Ensure Order.jsx imported ContractModal correctly

### Payment button not appearing after signing:
- Check database: `contract_signed` should be `true`
- Verify real-time order updates are working
- Try refreshing the page

### Signature not saving:
- Check browser console for errors
- Verify react-signature-canvas is installed
- Ensure backend endpoint is accessible

### Contract data not storing:
- Verify JSONB column exists in database
- Check backend endpoint response
- Ensure contract_data is being sent in request

## Future Enhancements

1. **Email Contract Copy**
   - Automatically send signed contract to customer email
   - Use PDF generation instead of HTML

2. **Multiple Signatures**
   - Support for multiple signatories
   - Witness signatures

3. **Contract Templates**
   - Different templates for different order types
   - Customizable terms

4. **Audit Trail**
   - Log all contract interactions
   - Track who viewed the contract and when

5. **Contract Amendments**
   - Allow amendments before signing
   - Version control for contract changes

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in ContractModal.jsx
3. Check backend logs for API errors
4. Verify database schema matches migration file
