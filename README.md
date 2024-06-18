# JoesStocks - A Modern Stock Trading Web Application

## Overview

JoesStocks is a modern web application designed to facilitate stock trading and portfolio management. This application integrates various APIs, including the Finnhub API, to provide real-time stock information, allow users to perform stock transactions, and manage their portfolios. The application is built using a combination of HTML/CSS, Java Servlets, AJAX, and MySQL, and is hosted on a Tomcat server.

## Features

- **Search Stocks**: Users can search for stock information by entering a company's stock ticker.
- **Stock Details**: Display detailed information about the searched stock, including price, market status, and company details.
- **User Authentication**: Sign up and login functionality to provide a personalized experience.
- **Portfolio Management**: Logged-in users can view their portfolio, perform buy/sell transactions, and track their account value.
- **Real-time Quotes**: Get live stock quotes and market data using the Finnhub API.

## Getting Started

### Prerequisites

- Java Development Kit (JDK) 8 or higher
- Apache Tomcat 9.0
- MySQL Database
- Finnhub API Key

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/joesstocks.git
   cd joesstocks
   ```

2. **Set Up MySQL Database**:
   - Create a new MySQL database named `joesstocks`.
   - Run the provided SQL script (`database/schema.sql`) to create the necessary tables.
   - Update the database configuration in `src/main/resources/database.properties` with your MySQL credentials.

3. **Configure Finnhub API Key**:
   - Obtain an API key from [Finnhub](https://finnhub.io/).
   - Update the API key in `src/main/resources/apikey.properties`.

4. **Deploy to Tomcat**:
   - Build the project using Maven or your preferred build tool.
   - Deploy the WAR file to your local Tomcat server.
   - Start the Tomcat server and navigate to `http://localhost:8080/joesstocks`.

### Usage

- **Home/Search Page**: Use the search bar to find stock information by entering a stock ticker.
- **Login/Signup**: Register a new account or log in with an existing account to access portfolio features.
- **Portfolio Page**: View your current portfolio, perform buy/sell transactions, and track your account balance.

### API Integration

- **Finnhub Stock API**:
  - Company Profile: `https://finnhub.io/api/v1/stock/profile2?symbol={ticker}&token={apiKey}`
  - Stock Quote: `https://finnhub.io/api/v1/quote?symbol={ticker}&token={apiKey}`

### Project Structure

```
joesstocks/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── joesstocks/
│   │   │           ├── controller/
│   │   │           ├── model/
│   │   │           └── service/
│   │   ├── resources/
│   │   │   ├── database.properties
│   │   │   └── apikey.properties
│   │   └── webapp/
│   │       ├── WEB-INF/
│   │       │   └── web.xml
│   │       ├── css/
│   │       ├── js/
│   │       ├── index.jsp
│   │       └── ...
├── database/
│   └── schema.sql
└── pom.xml
```


## Acknowledgments

- [Finnhub API](https://finnhub.io/) for providing stock market data.
- The CSCI 201 Spring 2024 course for the initial project guidelines and requirements.

---
