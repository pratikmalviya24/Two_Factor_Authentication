# Two-Factor Authentication Demo

This project demonstrates a full-stack implementation of two-factor authentication using Spring Boot and React with TypeScript.

## Features

- User registration and login
- JWT-based authentication
- Two-factor authentication using TOTP (Time-based One-Time Password)
- Material-UI based responsive design
- TypeScript for type safety
- Protected routes and API endpoints
- Error handling and loading states
- Form validation

## Project Structure

```
two-factor-auth/
├── backend/              # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   └── pom.xml
└── frontend/            # React frontend
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── services/
    │   └── types/
    ├── package.json
    └── tsconfig.json
```

## Prerequisites

- Java 17 or higher
- Node.js 14 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Backend Setup

1. Configure MySQL database:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/two_factor_auth
    username: your_username
    password: your_password
```

2. Run the backend:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Testing the Application

1. Register a new user:
   - Navigate to `http://localhost:3000/register`
   - Fill in the registration form
   - Submit the form

2. Login:
   - Navigate to `http://localhost:3000/login`
   - Enter your credentials
   - If 2FA is not set up, you'll be redirected to the setup page

3. Set up 2FA:
   - Scan the QR code with an authenticator app (like Google Authenticator)
   - Enter the verification code from your app
   - After successful verification, you'll be redirected to the dashboard

4. Future logins:
   - Enter your credentials
   - Enter the current 2FA code from your authenticator app
   - Access the dashboard

## Security Features

- JWT token authentication
- TOTP-based two-factor authentication
- Password hashing using BCrypt
- Protected API endpoints
- CORS configuration
- Form validation
- Secure session handling

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `POST /api/auth/setup-2fa` - Initialize 2FA setup
- `POST /api/auth/verify-2fa` - Verify 2FA code

### User
- `GET /api/auth/profile` - Get user profile (protected)

## Development

### Backend Development
- Written in Java using Spring Boot
- Uses JPA for database operations
- JWT for authentication
- TOTP for 2FA implementation

### Frontend Development
- React with TypeScript
- Material-UI for components
- Axios for API calls
- React Router for routing
- Context API for state management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
