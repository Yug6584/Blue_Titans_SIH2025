# GreenTrace - Carbon Credit Management System - Frontend

A comprehensive React.js frontend for managing carbon credit projects with role-based access control.

## 🚀 Features

### ✅ **Multi-Panel System**
- **User Panel** - Citizens and environmental enthusiasts
- **Company Panel** - Blue carbon project management
- **Government Panel** - Regulatory and verification authority  
- **Admin Panel** - System administration

### ✅ **Company Panel Features**
- **Dashboard** - Project overview, credit generation trends, revenue analytics
- **Project Management** - Create, edit, and monitor blue carbon projects
- **MRV Upload** - Upload monitoring, reporting, and verification data
- **GIS Mapping** - Interactive maps with satellite imagery and monitoring points
- **Marketplace** - Browse and list carbon credits for trading
- **Credit Trading** - Real-time trading platform with market charts

### ✅ **Government Panel Features**
- **Dashboard** - Verification queue, compliance monitoring, system oversight
- **Project Verification** - Review and approve carbon credit projects
- **Policy Management** - Manage regulations and standards
- **Compliance Monitoring** - Track project compliance and performance
- **Registry Management** - Maintain official carbon credit registry
- **Reports & Analytics** - Generate regulatory reports and insights

### ✅ **Admin Panel Features**
- **Dashboard** - System health, user activity, performance metrics
- **User Management** - Manage users across all panels
- **System Settings** - Configure system parameters and preferences
- **Audit Logs** - Track all system activities and changes
- **System Monitoring** - Monitor server performance and uptime
- **Backup & Restore** - Database backup and recovery tools

### ✅ **Technical Features**
- **React 18** with modern hooks and patterns
- **Material-UI v5** for professional UI components
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** toggle
- **Role-based Authentication** with JWT tokens
- **Web3 Integration** ready for blockchain connectivity
- **Chart.js Integration** for data visualization
- **RESTful API** integration with Axios

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Quick Start

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   - Open http://localhost:3000
   - Use demo login buttons to test different panels

### Windows Users
Run the provided installation script:
```bash
install.bat
```

## 🎯 Usage

### Login System
The application features a unified login page with panel selection:
- Select your role (User/Company/Government/Admin)
- Use demo login buttons for testing
- Each panel has role-specific navigation and features

### Demo Credentials
- **User Panel**: Demo user login
- **Company Panel**: Demo company login  
- **Government Panel**: Demo government login
- **Admin Panel**: Demo admin login

## 🏗️ Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── CardStats.jsx  # Statistics cards
│   │   ├── Layout.tsx     # Main layout wrapper
│   │   ├── Navbar.jsx     # Navigation bar
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── Sidebar.jsx    # Navigation sidebar
│   ├── config/           # Configuration files
│   │   ├── contracts.ts  # Smart contract configs
│   │   └── wagmi.ts      # Web3 configuration
│   ├── pages/            # Standalone pages
│   │   ├── Credits.tsx   # Credit management
│   │   ├── Dashboard.tsx # Main dashboard
│   │   ├── Login.jsx     # Authentication
│   │   └── ...
│   ├── panels/           # Role-based panels
│   │   ├── user/         # User panel components
│   │   ├── company/      # Company panel components
│   │   ├── government/   # Government panel components
│   │   ├── admin/        # Admin panel components
│   │   └── components/   # Shared panel components
│   ├── utils/            # Utility functions
│   │   ├── api.js        # API integration
│   │   ├── auth.js       # Authentication logic
│   │   └── web3.js       # Blockchain integration
│   ├── App.js            # Main application component
│   ├── index.js          # Application entry point
│   └── theme.ts          # Material-UI theme
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BLOCKCHAIN_NETWORK=localhost
REACT_APP_CONTRACT_ADDRESS=0x...
```

### API Integration
The frontend is configured to work with a RESTful API backend:
- Authentication endpoints
- Role-based data access
- File upload capabilities
- Real-time updates

### Blockchain Integration
Web3 integration is ready for:
- MetaMask wallet connection
- Smart contract interactions
- Transaction monitoring
- Credit tokenization

## 🎨 Customization

### Themes
The application supports both light and dark themes:
- Toggle available in the navbar
- Automatic system preference detection
- Customizable color schemes in `theme.ts`

### Branding
Update branding elements:
- Logo in `public/` directory
- Colors in theme configuration
- Company information in components

## 📱 Responsive Design

The application is fully responsive:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Drawer navigation
- **Touch-friendly**: Optimized for touch interactions

## 🔒 Security Features

- **JWT Authentication** with automatic token refresh
- **Role-based Access Control** (RBAC)
- **Protected Routes** with role validation
- **Input Validation** on all forms
- **XSS Protection** with sanitized inputs
- **CSRF Protection** ready

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
- Configure production API endpoints
- Set up SSL certificates
- Configure reverse proxy (nginx)
- Set up monitoring and logging

## 🧪 Testing

Run the test suite:
```bash
npm test
```

### Test Coverage
- Component unit tests
- Integration tests
- E2E testing with Cypress
- API integration tests

## 📈 Performance

### Optimization Features
- **Code Splitting** for faster loading
- **Lazy Loading** of components
- **Image Optimization** for better performance
- **Bundle Analysis** tools included
- **Progressive Web App** ready

### Monitoring
- Performance metrics tracking
- Error boundary implementation
- User analytics integration ready
- Real-time monitoring capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information
- Contact the development team

## 🔄 Updates

### Version 1.0.0
- ✅ Complete multi-panel system
- ✅ Company panel with full project management
- ✅ Government panel with verification tools
- ✅ Admin panel with system oversight
- ✅ Responsive design and dark mode
- ✅ Web3 integration ready
- ✅ Professional UI/UX design

### Upcoming Features
- Real-time notifications
- Advanced analytics dashboard
- Mobile app companion
- Offline mode support
- Multi-language support
- Advanced reporting tools

---

**Built with ❤️ for sustainable blue carbon management**