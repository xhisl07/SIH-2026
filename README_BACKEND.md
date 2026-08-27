# MahaSetu Backend

This is a backend service for the MahaSetu government integration platform frontend.

## Overview

The backend provides REST API endpoints that match the data access patterns used in the frontend, allowing the frontend to work with real data stored in a SQLite database instead of hardcoded mock data.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   or for development with auto-reload:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`.

## API Endpoints

### Mock Data Endpoints (matching frontend usage)
- `GET /mock/:system/:citizenId` - Get citizen data for a specific system
  - Systems: identity, residence, income, education, benefits, documents
  - Examples:
    - `/mock/identity/MH-CIT-10482`
    - `/mock/residence/MH-CIT-10482`
    - `/mock/income/MH-CIT-10482`
    - `/mock/education/MH-CIT-10482`
    - `/mock/benefits/MH-CIT-10482`
    - `/mock/documents/MH-CIT-10482`

### Management Endpoints
- `GET /api/departments` - Get all departments
- `GET /api/schemes` - Get all schemes (with parsed JSON eligibility/requires)
- `GET /api/consents/:citizenId` - Get consents for a citizen
- `POST /api/consents` - Create a new consent
- `GET /api/applications/:citizenId` - Get applications for a citizen
- `POST /api/applications` - Create a new application
- `GET /api/audit-log` - Get all audit log entries
- `POST /api/audit-log` - Create a new audit log entry
- `GET /health` - Health check endpoint

## Database

The backend uses SQLite for data persistence. The database file `mahasetu.db` is created automatically in the project root.

## Data Model

The database schema matches the frontend's data structures:
- **Citizens**: Stores normalized citizen data with separate fields for each system's data
- **Documents**: Separate table for citizen documents (one-to-many relationship)
- **Departments & Systems**: Reference data for government organizations
- **Schemes**: Government benefit schemes with eligibility requirements
- **Consents**: Records of citizen consent for data sharing
- **Applications**: Citizen applications for government schemes
- **Audit Log**: Tracking of all data access and operations
- **API Call Log**: Logging of all API requests made to the backend

## Sample Data

The backend is initialized with the same sample data that was in the frontend's mock data:
- 2 citizens: Rahul Patil (MH-CIT-10482) and Sneha Kulkarni (MH-CIT-20917)
- 6 government systems with realistic latency values (80-120ms)
- 1 scholarship scheme (Maharashtra Student Scholarship)
- Pre-populated document records for both citizens

## Integration with Frontend

To use this backend with the existing frontend, you would need to modify the frontend to make actual API calls instead of using the hardcoded mock data. Specifically:

1. Replace direct access to `CITIZENS`, `SYSTEMS`, etc. with fetch calls to the backend endpoints
2. Update the `citizen()` function to fetch citizen data from `/mock/identity/:citizenId` and related endpoints
3. Modify data access patterns to use asynchronous API calls
4. Update state management functions to work with API responses

However, as requested, the frontend files have been kept intact. To make the frontend work with this backend, you would need to modify `app.js` to replace the mock data access with actual API calls.

## Features

- **RESTful API**: Clean, intuitive endpoints for all frontend data needs
- **SQLite Persistence**: Data survives server restarts
- **CORS Enabled**: Allows frontend to make requests from different origins
- **Logging**: API calls are logged to the database for monitoring
- **Error Handling**: Proper HTTP status codes and error messages
- **Extensible**: Easy to add new endpoints or modify existing ones

## Notes

- The backend includes realistic latency simulation (70-120ms) to mimic real API behavior
- All data is persisted in the SQLite database and survives server restarts
- The backend can be run independently of the frontend for testing
- API endpoints return data in the same format as the original mock objects