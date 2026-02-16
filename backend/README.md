# InventoryMaster Backend 🛠️

This is the RESTful API for the Inventory Management System, powered by Node.js, Express, and MongoDB.

## 🚀 Key Features

- **Robust Authentication**: JWT-based auth with secure password hashing (Bcrypt).
- **Role-Based Access**: Specialized middlewares for Admin-only operations.
- **Efficient Data Modeling**: Mongoose schemas for Products, Users, and Stock Movements.
- **Reporting & Exports**: Integration with `PDFKit` for PDF generation and `XLSX` for Excel exports.
- **Secure by Default**: Uses `Helmet` for security headers and `express-rate-limit` to prevent brute force.

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/users/register` | Register a new user | Public |
| POST | `/api/users/login` | Login and get token | Public |
| GET | `/api/users/me` | Get current user profile | Private |

### 📦 Products
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/products` | Get all products | Private |
| POST | `/api/products` | Create new product | Admin |
| GET | `/api/products/:id` | Get single product | Private |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| GET | `/api/products/low-stock` | Get low stock items | Private |

### 🔄 Stock Movements
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/stocks` | Get all movements | Private |
| POST | `/api/stocks` | Record movement (IN/OUT) | Private |

### 📊 Reports & Exports
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/reports/stats` | Get dashboard stats | Private |
| GET | `/api/export/excel` | Export products to Excel | Private |
| GET | `/api/export/pdf` | Export products to PDF | Private |

---

## 🛠️ Installation

1. Navigate to directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure environment:
   - Create a `.env` file in the root of the `backend` folder.
   - Add the following:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_super_secret_key
     NODE_ENV=development
     ```
4. Start development server: `npm run dev`

---

## 📦 Core Dependencies

- **Express 5.x**: Next-gen web framework.
- **Mongoose**: Elegant mongodb object modeling.
- **jsonwebtoken**: For secure token-based auth.
- **bcrypt**: For secure password hashing.
- **helmet**: To secure Express apps by setting various HTTP headers.
- **pdfkit & xlsx**: For generating professional reports.

---

<p align="center">
  Backend documentation maintained by the Development Team.
</p>
