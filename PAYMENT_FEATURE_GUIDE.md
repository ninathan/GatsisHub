# Payment Proof Upload Feature

## Overview
The payment page now allows customers to upload proof of payment (receipts, transaction screenshots, etc.) for their orders using either Bank Transfer or Cheque Payment methods.

## Features Implemented

### Frontend (PaymentPage.jsx)
- **File Upload Modal**: Interactive modal for uploading payment proof
- **Payment Methods**: Bank Transfer and Cheque Payment options
- **File Validation**: 
  - Accepted formats: JPEG, PNG, GIF, PDF
  - Maximum file size: 5MB
- **Bank Details Display**: Shows bank account information for transfers
- **Upload Progress**: Loading states and success/error feedback
- **Responsive Design**: Mobile-friendly interface

### Backend (payments.js)
- **File Upload Endpoint**: `POST /api/payments/submit`
- **Payment Management**: 
  - `GET /api/payments` - List all payments (with filters)
  - `GET /api/payments/:paymentid` - Get single payment
  - `PATCH /api/payments/:paymentid/verify` - Verify/reject payment (admin)
- **Automatic Order Status Update**: Updates order to "Payment Submitted" upon upload
- **File Storage**: Securely stores files in `uploads/payments/` directory

### Database (payments table)
- Tracks payment submissions with proof of payment files
- Links payments to orders and customers
- Supports payment verification workflow
- Stores transaction references and notes

## Setup Instructions

### 1. Database Setup
Run the SQL script in Supabase SQL Editor:
```bash
create_payments_table.sql
```

### 2. Backend Dependencies
Multer is already installed in package.json. If needed:
```bash
cd backend
npm install
```

### 3. Create Uploads Directory
The server automatically creates `uploads/payments/` on startup, but you can manually create it:
```bash
mkdir -p backend/uploads/payments
```

### 4. Environment Variables
No additional environment variables needed. The feature uses existing Supabase configuration.

## Usage Flow

### Customer Side:
1. Navigate to Payment Page (`/payment`)
2. Select payment method (Bank Transfer or Cheque)
3. View bank account details (if Bank Transfer)
4. Upload payment proof (receipt/screenshot)
5. Submit payment
6. Receive confirmation

### Admin Side (Future):
1. View pending payments in admin panel
2. Download/view payment proof
3. Verify or reject payment
4. Order status automatically updates to "In Production" when verified

## API Endpoints

### Submit Payment
```
POST /api/payments/submit
Content-Type: multipart/form-data

Body:
- proofOfPayment (file) - Required
- paymentMethod (string) - Required (Bank Transfer/Cheque Payment)
- orderid (number) - Optional
- customerid (number) - Optional
- amountPaid (decimal) - Optional
- transactionReference (string) - Optional
- notes (text) - Optional
```

### Get All Payments
```
GET /api/payments?status=Pending Verification&orderid=123

Query Parameters:
- status: Filter by payment status
- orderid: Filter by order ID
- customerid: Filter by customer ID
```

### Get Single Payment
```
GET /api/payments/:paymentid
```

### Verify Payment (Admin)
```
PATCH /api/payments/:paymentid/verify

Body:
- status (string) - Required (Verified/Rejected)
- verifiedby (number) - Optional (Employee ID)
- notes (text) - Optional
```

## Payment Statuses
- **Pending Verification**: Initial status when uploaded
- **Verified**: Admin confirmed payment
- **Rejected**: Admin rejected payment

## Order Status Updates
- Upload payment → Order status: "Payment Submitted"
- Verify payment → Order status: "In Production"

## File Storage
- Files stored in: `backend/uploads/payments/`
- Naming convention: `payment-{timestamp}-{random}.{ext}`
- Access URL: `https://your-domain.com/uploads/payments/{filename}`

## Security Features
- File type validation (images and PDFs only)
- File size limits (5MB max)
- Unique filename generation
- Payment status tracking
- Admin-only verification

## Bank Account Details (Configurable)
Currently hardcoded in PaymentPage.jsx:
- Bank Name: BDO Unibank
- Account Name: GatsisHub Corporation
- Account Number: 1234-5678-9012
- Branch: Makati City

**Note**: Update these details in the component as needed.

## Future Enhancements
- [ ] Admin dashboard for payment verification
- [ ] Email notifications on payment submission/verification
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Payment amount matching with order total
- [ ] Multiple file uploads
- [ ] Payment history for customers
- [ ] PDF receipt generation

## Troubleshooting

### Upload fails with "File too large"
- Maximum file size is 5MB
- Compress images before uploading

### Upload fails with "Invalid file type"
- Only JPEG, PNG, GIF, and PDF files are accepted
- Convert other formats before uploading

### "Uploads directory not found"
- Server automatically creates directory on startup
- Manually create: `mkdir -p backend/uploads/payments`

### Files not accessible via URL
- Ensure static file serving is enabled in server.js
- Check file permissions on server

## Notes
- Uploaded files are stored on the server filesystem
- For production, consider cloud storage (S3, Cloudinary, etc.)
- Ensure proper backup strategy for uploaded files
- Add file cleanup for rejected/old payments
