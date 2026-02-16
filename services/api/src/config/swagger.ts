import swaggerJsdoc, { type Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "SalonMind API",
      version: "1.0.0",
      description: `
## Multi-Tenant Salon Management Platform API

SalonMind provides a comprehensive REST API for managing salon operations including:
- **Authentication**: OTP-based login with JWT tokens
- **Multi-Tenancy**: Isolated data per salon tenant
- **Branch Management**: Multiple locations per tenant
- **Staff Management**: Employees with roles and permissions
- **Client Management**: Customer profiles and history
- **Appointments**: Booking and scheduling
- **Services & Products**: Catalog management
- **Inventory**: Stock tracking with alerts
- **Revenue & Reports**: Analytics and insights

### Authentication Flow
1. Send OTP to phone number
2. Verify OTP to receive access + refresh tokens
3. Use access token in Authorization header
4. Refresh token when access token expires

### Multi-Tenant Architecture
- **Tenant**: A salon business entity
- **Branch**: A physical location within a tenant
- **Surface**: Access scope (ADMIN, SALON_OWNER, SALON_EMPLOYEE)
      `,
      contact: {
        name: "SalonMind Support",
        email: "support@salonmind.com",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: "http://localhost:5009",
        description: "Development server",
      },
      {
        url: "https://stg-api.salonmind.com",
        description: "Staging server",
      },
      {
        url: "https://api.salonmind.com",
        description: "Production server",
      },
    ],
    tags: [
      { name: "Health", description: "Health check endpoints" },
      { name: "Auth - Salon Owner", description: "Authentication for salon owners" },
      { name: "Auth - Admin", description: "Authentication for platform admins" },
      { name: "Auth - Employee", description: "Authentication for salon employees" },
      { name: "Owner - Context", description: "Tenant context and onboarding" },
      { name: "Owner - Branches", description: "Branch management" },
      { name: "Owner - Staff", description: "Staff management" },
      { name: "Owner - Services", description: "Service catalog management" },
      { name: "Owner - Clients", description: "Client profile management" },
      { name: "Owner - Appointments", description: "Appointment scheduling" },
      { name: "Owner - Products", description: "Product catalog management" },
      { name: "Owner - Inventory", description: "Inventory tracking" },
      { name: "Owner - Revenue", description: "Revenue analytics" },
      { name: "Owner - Reports", description: "Business reports" },
      { name: "Owner - Settings", description: "Salon settings" },
      { name: "Owner - Plans", description: "Subscription plans" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your access token",
        },
      },
      schemas: {
        // Common schemas
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            statusCode: { type: "integer", example: 200 },
            message: { type: "string", example: "Success" },
            data: { type: "object" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                message: { type: "string", example: "Validation failed" },
                code: { type: "string", example: "VALIDATION_ERROR" },
                details: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string" },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 100 },
            totalPages: { type: "integer", example: 5 },
            hasNext: { type: "boolean", example: true },
            hasPrev: { type: "boolean", example: false },
          },
        },
        // Auth schemas
        OtpSendRequest: {
          type: "object",
          required: ["phone"],
          properties: {
            phone: {
              type: "string",
              pattern: "^\\+[1-9]\\d{10,14}$",
              example: "+919876543210",
              description: "Phone number in E.164 format",
            },
          },
        },
        OtpSendResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            statusCode: { type: "integer", example: 200 },
            message: { type: "string", example: "OTP sent successfully" },
            data: {
              type: "object",
              properties: {
                challengeId: {
                  type: "string",
                  format: "uuid",
                  example: "550e8400-e29b-41d4-a716-446655440000",
                },
                expiresIn: { type: "integer", example: 300, description: "Seconds until expiry" },
              },
            },
          },
        },
        OtpVerifyRequest: {
          type: "object",
          required: ["challengeId", "otp"],
          properties: {
            challengeId: {
              type: "string",
              format: "uuid",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            otp: {
              type: "string",
              pattern: "^\\d{6}$",
              example: "123456",
              description: "6-digit OTP code",
            },
          },
        },
        OtpVerifyResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            statusCode: { type: "integer", example: 200 },
            message: { type: "string", example: "Authentication successful" },
            data: {
              type: "object",
              properties: {
                accessToken: { type: "string", description: "JWT access token" },
                refreshToken: { type: "string", description: "Refresh token for token rotation" },
                expiresIn: { type: "integer", example: 900, description: "Access token TTL in seconds" },
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
        TokenRefreshRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              description: "The refresh token from previous auth",
            },
          },
        },
        // User schemas
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "507f1f77bcf86cd799439011" },
            phoneNumber: { type: "string", example: "+919876543210" },
            email: { type: "string", format: "email", example: "owner@salon.com" },
            name: { type: "string", example: "John Doe" },
            role: {
              type: "string",
              enum: ["owner", "manager", "staff", "client", "ADMIN", "SALON_OWNER", "SALON_EMPLOYEE"],
            },
            tenant: { type: "string", example: "507f1f77bcf86cd799439012" },
            activeBranch: { type: "string", example: "507f1f77bcf86cd799439013" },
            isActive: { type: "boolean", example: true },
            isOnboarded: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        // Tenant schemas
        Tenant: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Glamour Salon" },
            owner: { type: "string" },
            logoUrl: { type: "string", format: "uri" },
            contact: {
              type: "object",
              properties: {
                phone: { type: "string" },
                email: { type: "string", format: "email" },
              },
            },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string" },
                country: { type: "string" },
              },
            },
            status: { type: "string", enum: ["PENDING", "ACTIVE"] },
            defaultBranch: { type: "string" },
          },
        },
        // Branch schemas
        Branch: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Main Branch" },
            description: { type: "string" },
            phone: { type: "string" },
            email: { type: "string", format: "email" },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string" },
              },
            },
            isDefault: { type: "boolean" },
            isActive: { type: "boolean" },
          },
        },
        CreateBranchRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Downtown Branch" },
            description: { type: "string" },
            phone: { type: "string" },
            email: { type: "string", format: "email" },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string" },
              },
            },
          },
        },
        // Staff schemas
        Staff: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Jane Smith" },
            phoneNumber: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["manager", "staff"] },
            specializations: { type: "array", items: { type: "string" } },
            workingHours: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  isWorking: { type: "boolean" },
                  startTime: { type: "string" },
                  endTime: { type: "string" },
                },
              },
            },
            isActive: { type: "boolean" },
          },
        },
        CreateStaffRequest: {
          type: "object",
          required: ["name", "phoneNumber"],
          properties: {
            name: { type: "string" },
            phoneNumber: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["manager", "staff"], default: "staff" },
            specializations: { type: "array", items: { type: "string" } },
          },
        },
        // Service schemas
        Service: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Haircut" },
            description: { type: "string" },
            category: {
              type: "string",
              enum: ["haircare", "skincare", "nailcare", "makeup", "massage", "other"],
            },
            price: { type: "number", example: 500 },
            duration: { type: "integer", example: 30, description: "Duration in minutes" },
            isActive: { type: "boolean" },
          },
        },
        CreateServiceRequest: {
          type: "object",
          required: ["name", "price", "duration", "category"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            price: { type: "number" },
            duration: { type: "integer" },
          },
        },
        // Client schemas
        Client: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Alice Johnson" },
            phoneNumber: { type: "string" },
            email: { type: "string", format: "email" },
            notes: { type: "string" },
            totalVisits: { type: "integer" },
            totalSpent: { type: "number" },
            lastVisit: { type: "string", format: "date-time" },
          },
        },
        CreateClientRequest: {
          type: "object",
          required: ["name", "phoneNumber"],
          properties: {
            name: { type: "string" },
            phoneNumber: { type: "string" },
            email: { type: "string", format: "email" },
            notes: { type: "string" },
          },
        },
        // Appointment schemas
        Appointment: {
          type: "object",
          properties: {
            id: { type: "string" },
            client: { $ref: "#/components/schemas/Client" },
            staff: { $ref: "#/components/schemas/Staff" },
            services: {
              type: "array",
              items: { $ref: "#/components/schemas/Service" },
            },
            dateTime: { type: "string", format: "date-time" },
            duration: { type: "integer" },
            status: {
              type: "string",
              enum: ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
            },
            totalAmount: { type: "number" },
            notes: { type: "string" },
          },
        },
        CreateAppointmentRequest: {
          type: "object",
          required: ["clientId", "staffId", "serviceIds", "dateTime"],
          properties: {
            clientId: { type: "string" },
            staffId: { type: "string" },
            serviceIds: { type: "array", items: { type: "string" } },
            dateTime: { type: "string", format: "date-time" },
            notes: { type: "string" },
          },
        },
        // Product schemas
        Product: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Shampoo" },
            brand: { type: "string" },
            category: { type: "string" },
            price: { type: "number" },
            description: { type: "string" },
            currentStock: { type: "integer" },
            minStock: { type: "integer" },
          },
        },
        CreateProductRequest: {
          type: "object",
          required: ["name", "price"],
          properties: {
            name: { type: "string" },
            brand: { type: "string" },
            category: { type: "string" },
            price: { type: "number" },
            description: { type: "string" },
            currentStock: { type: "integer", default: 0 },
            minStock: { type: "integer", default: 5 },
          },
        },
        // Inventory schemas
        InventoryItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            product: { $ref: "#/components/schemas/Product" },
            currentStock: { type: "integer" },
            minStock: { type: "integer" },
            maxStock: { type: "integer" },
            inStock: { type: "boolean" },
            lastRestocked: { type: "string", format: "date-time" },
          },
        },
        // Subscription schemas
        SubscriptionPlan: {
          type: "object",
          properties: {
            id: { type: "string" },
            code: { type: "string", example: "BASIC" },
            name: { type: "string", example: "Basic Plan" },
            description: { type: "string" },
            price: { type: "number", example: 999 },
            duration: { type: "integer", example: 30, description: "Duration in days" },
            features: {
              type: "object",
              properties: {
                maxBranches: { type: "integer" },
                maxStaff: { type: "integer" },
                maxClients: { type: "integer" },
              },
            },
          },
        },
        // Settings schemas
        SalonSettings: {
          type: "object",
          properties: {
            currency: { type: "string", example: "INR" },
            timezone: { type: "string", example: "Asia/Kolkata" },
            businessHours: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  isOpen: { type: "boolean" },
                  openTime: { type: "string" },
                  closeTime: { type: "string" },
                },
              },
            },
            notifications: {
              type: "object",
              properties: {
                emailNotifications: { type: "boolean" },
                smsNotifications: { type: "boolean" },
                appointmentReminders: { type: "boolean" },
              },
            },
          },
        },
      },
      parameters: {
        BranchId: {
          name: "X-Branch-Id",
          in: "header",
          description: "Branch ID for multi-branch operations",
          schema: { type: "string" },
        },
        PageParam: {
          name: "page",
          in: "query",
          description: "Page number (1-indexed)",
          schema: { type: "integer", minimum: 1, default: 1 },
        },
        LimitParam: {
          name: "limit",
          in: "query",
          description: "Items per page (max 100)",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        },
        SearchParam: {
          name: "search",
          in: "query",
          description: "Search query string",
          schema: { type: "string" },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: {
                success: false,
                error: {
                  message: "Unauthorized - Invalid or expired token",
                  code: "UNAUTHORIZED",
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
        ValidationError: {
          description: "Input validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: {
                success: false,
                error: {
                  message: "Validation failed",
                  code: "VALIDATION_ERROR",
                  details: [{ field: "phone", message: "Invalid phone format" }],
                },
              },
            },
          },
        },
        RateLimitError: {
          description: "Too many requests",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: {
                success: false,
                error: {
                  message: "Too many requests, please try again later",
                  code: "RATE_LIMIT_EXCEEDED",
                },
              },
            },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/openapi/*.yaml"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
