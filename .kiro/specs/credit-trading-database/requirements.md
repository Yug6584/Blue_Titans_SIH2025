# Credit Trading Database System Requirements

## Introduction

This specification defines the requirements for a separate credit trading database system that maintains detailed transaction records for each company user. The system will track all buy/sell transactions with comprehensive metadata including timestamps, values, quantities, and transaction details, while maintaining integration with the main company database.

## Glossary

- **Credit_Trading_System**: The dedicated database and API system for managing carbon credit transactions
- **Transaction_Record**: A complete record of a single buy or sell transaction with all associated metadata
- **Company_User**: A user with panel type 'company' who can perform credit trading operations
- **Main_Company_Database**: The existing SQLite database containing company profile, projects, and files
- **Trading_Database**: The separate SQLite database dedicated to credit trading transactions
- **Transaction_ID**: Unique identifier for each trading transaction
- **Credit_Type**: The type of carbon credit being traded (e.g., Blue Carbon - Mangrove)
- **Order_Status**: Current state of a trading order (pending, partial, completed, cancelled)

## Requirements

### Requirement 1: Separate Trading Database Creation

**User Story:** As a company user, I want my credit trading data stored in a separate dedicated database so that trading records are organized and performant.

#### Acceptance Criteria

1. WHEN a company user is created, THE Credit_Trading_System SHALL create a separate SQLite database file for trading records
2. THE Credit_Trading_System SHALL name the trading database using the pattern `trading_{userId}_{sanitizedEmail}.db`
3. THE Credit_Trading_System SHALL store trading databases in a dedicated directory `database/trading/`
4. THE Credit_Trading_System SHALL ensure trading database isolation between different company users
5. THE Credit_Trading_System SHALL create all required tables in the trading database upon initialization

### Requirement 2: Transaction Record Structure

**User Story:** As a company user, I want detailed transaction records stored so that I can track all my trading activity with complete information.

#### Acceptance Criteria

1. THE Credit_Trading_System SHALL store transaction records with transaction_id as primary key
2. THE Credit_Trading_System SHALL record transaction_type (buy or sell) for each transaction
3. THE Credit_Trading_System SHALL store credit_type information for each transaction
4. THE Credit_Trading_System SHALL record quantity of credits in each transaction
5. THE Credit_Trading_System SHALL store price_per_credit for each transaction
6. THE Credit_Trading_System SHALL calculate and store total_value (quantity × price_per_credit)
7. THE Credit_Trading_System SHALL record transaction_date with full timestamp
8. THE Credit_Trading_System SHALL store order_status (pending, partial, completed, cancelled)
9. THE Credit_Trading_System SHALL record counterparty information when available
10. THE Credit_Trading_System SHALL store additional metadata (order_id, market_conditions, etc.)

### Requirement 3: Active Orders Management

**User Story:** As a company user, I want to manage my active trading orders so that I can track pending transactions and their progress.

#### Acceptance Criteria

1. THE Credit_Trading_System SHALL maintain active orders in a separate table
2. THE Credit_Trading_System SHALL store order details including type, credit_type, quantity, price_limit
3. THE Credit_Trading_System SHALL track filled quantity and remaining quantity for each order
4. THE Credit_Trading_System SHALL calculate and display progress percentage for partial fills
5. THE Credit_Trading_System SHALL update order status in real-time as transactions occur
6. THE Credit_Trading_System SHALL allow users to cancel pending orders
7. THE Credit_Trading_System SHALL move completed orders to transaction history

### Requirement 4: Database Integration

**User Story:** As a company user, I want my trading database connected to my main company database so that trading activities are reflected in my overall company statistics.

#### Acceptance Criteria

1. THE Credit_Trading_System SHALL maintain references between trading records and company projects
2. THE Credit_Trading_System SHALL update company portfolio statistics when trades are completed
3. THE Credit_Trading_System SHALL synchronize credit balances between trading and main databases
4. THE Credit_Trading_System SHALL log trading activities in the main company activity log
5. THE Credit_Trading_System SHALL ensure data consistency between both databases

### Requirement 5: Real-time Data Access

**User Story:** As a company user, I want to access my trading data in real-time so that I can make informed trading decisions.

#### Acceptance Criteria

1. THE Credit_Trading_System SHALL provide API endpoints for retrieving active orders
2. THE Credit_Trading_System SHALL provide API endpoints for retrieving transaction history
3. THE Credit_Trading_System SHALL return trading statistics (total volume, profit/loss, etc.)
4. THE Credit_Trading_System SHALL support filtering and sorting of transaction records
5. THE Credit_Trading_System SHALL provide real-time updates when order status changes

### Requirement 6: Transaction Security and Validation

**User Story:** As a company user, I want my trading transactions to be secure and validated so that my trading data is accurate and protected.

#### Acceptance Criteria

1. THE Credit_Trading_System SHALL validate user authentication before allowing trading operations
2. THE Credit_Trading_System SHALL ensure users can only access their own trading database
3. THE Credit_Trading_System SHALL validate transaction data before storing records
4. THE Credit_Trading_System SHALL prevent duplicate transaction entries
5. THE Credit_Trading_System SHALL maintain audit trails for all trading operations

### Requirement 7: Performance and Scalability

**User Story:** As a company user, I want fast access to my trading data even as my transaction history grows so that the system remains responsive.

#### Acceptance Criteria

1. THE Credit_Trading_System SHALL create database indexes on frequently queried fields
2. THE Credit_Trading_System SHALL optimize queries for transaction history retrieval
3. THE Credit_Trading_System SHALL support pagination for large transaction datasets
4. THE Credit_Trading_System SHALL maintain acceptable response times under normal load
5. THE Credit_Trading_System SHALL handle concurrent trading operations safely

### Requirement 8: Data Backup and Recovery

**User Story:** As a company user, I want my trading data backed up and recoverable so that I don't lose important transaction history.

#### Acceptance Criteria

1. THE Credit_Trading_System SHALL include trading databases in backup procedures
2. THE Credit_Trading_System SHALL support restoration of trading databases from backups
3. THE Credit_Trading_System SHALL maintain data integrity during backup operations
4. THE Credit_Trading_System SHALL provide mechanisms for data export and import
5. THE Credit_Trading_System SHALL log backup and recovery operations for audit purposes