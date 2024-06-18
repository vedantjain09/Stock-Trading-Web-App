const isLoggedIn = localStorage.getItem('isLoggedIn');
let currentTicker = null;
let currentPrice = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const navLinks = document.querySelector('.nav-links');

    if (isLoggedIn) {
        // Create the 'Portfolio' link
        const portfolioLink = document.createElement('a');
        portfolioLink.href = 'portfolio.html';
        portfolioLink.textContent = 'Portfolio';
        navLinks.insertBefore(portfolioLink, navLinks.children[1]); // Insert between Home/Search and Login/SignUp
        
        // Change 'Login / Sign Up' to 'Logout'
        const loginSignUpLink = navLinks.lastElementChild;
        loginSignUpLink.textContent = 'Logout';
        loginSignUpLink.href = '#';
        loginSignUpLink.id = 'logoutLink';
        
        // Attach logout event listener
        loginSignUpLink.addEventListener('click', function() {
            // Clear the stored login flag
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username'); // Clear the username if it was stored
            // Redirect to login.html
            window.location.href = 'login.html';
        });
    }

    // Event listener for the search button
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    searchButton.addEventListener('click', async () => {
        const ticker = searchInput.value.toUpperCase();
        const stockData = await fetchStockData(ticker);
        if (stockData) {
            updateHomePage(stockData);
        } else {
            alert('Failed to fetch stock data.');
        }
    });

    // Initially hide the home page container as it should be empty
    document.getElementById('home-page-container').style.display = 'none';
    
});

// Function to fetch stock data from Finnhub API
async function fetchStockData(ticker) {
    try {
        const companyResponse = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`);
        const companyData = await companyResponse.json();
        const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`);
        const quoteData = await quoteResponse.json();
        return { companyData, quoteData };
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return null;
    }
}

// Helper function to format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Helper function to format currency
function formatCurrency(num) {
    return '$' + formatNumber(num.toFixed(2));
}

// Function to update the home page with stock data
function updateHomePage(stockData) {
    const { companyData, quoteData } = stockData;

    // Hide the search container
    document.querySelector('.search-container').style.display = 'none';
    // Calculate price change direction
    // Calculate price change direction
    const change = quoteData.d;
    const changePercent = quoteData.dp;
    const priceChangeDirection = change >= 0 ? '▲' : '▼'; // Unicode arrows

    // Format the change string with the arrow
    //const changeString = `${priceChangeDirection} ${formatCurrency(Math.abs(change))} (${changePercent.toFixed(2)}%)`;
    const changeColorClass = change >= 0 ? 'price-up' : 'price-down';


    // Determine market status
    const marketStatus = new Date().getHours() >= 9 && new Date().getHours() < 16 ? 'Open' : 'Closed';

    // Font Awesome icons
    const priceChangeDirectionIcon = change >= 0 ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>';
	

    // Format the change string with the icon
    const changeString = `${priceChangeDirectionIcon} ${formatCurrency(Math.abs(change))} (${changePercent.toFixed(2)}%)`;
    
    currentTicker = companyData.ticker;
    currentPrice = quoteData.c;
	
	// If user is logged in, add buy section
    if (isLoggedIn) {
        const stockDetailsHtml = `
            <div id="stock-details-container">
                <div class ="buysell">
                    <div class="company-detail">
                        <h1 id="stock-name">${companyData.ticker}</h1>
                        <p id="stock-exchange">${companyData.name}</p>
                        <p id="stock-market">${companyData.exchange}</p>
                         <div id="stock-buy-section">
                         	<div class="quantity-input-group">
						        <label for="stock-quantity">Quantity:</label>
						        <input type="number" id="stock-quantity" placeholder="0">
						    </div>

                            <button id="stock-buy-button">Buy</button>
                         </div>
                    </div>
                    <div class="company-pricing">
                        <p id="stock-current-price">${formatCurrency(quoteData.c)}</p>
                        <p id="stock-change" class="${changeColorClass}">${changeString}</p>
                        <p id="stock-date-time">${new Date().toLocaleString()}</p>
                        
                        ${marketStatus === 'Close' ? `<p id="last-timestamp">${new Date().toLocaleString()}</p>` : ''}
                    </div>
                </div>
                <p id="market-status">Market is ${marketStatus}</p>
                <h3>Summary</h3>
                <div class="company-summary" id="stock-summary">
                    <p class="price">High Price: ${formatCurrency(quoteData.h)}</p>
                    <p class = "price">Low Price: ${formatCurrency(quoteData.l)}</p>
                    <p class = "price">Open Price: ${formatCurrency(quoteData.o)}</p>
                    <p class = "price">Close Price: ${formatCurrency(quoteData.pc)}</p>
                </div>
                <div class="company-info" id="stock-company-info">
                    <h3>Company Information</h3>
                </div>

                <div class="info-stock">
	                <p><span class="info-title">IPO Date:</span> ${companyData.ipo}</p>
	                <p><span class="info-title">Market Cap ($M):</span> ${formatNumber(companyData.marketCapitalization)}</p>
	                <p><span class="info-title">Share Outstanding:</span> ${formatNumber(companyData.shareOutstanding)}</p>
	                <p><span class="info-title">Website:</span> <a href="${companyData.weburl}" target="_blank">${companyData.weburl}</a></p>
	                <p><span class="info-title">Phone:</span> ${companyData.phone}</p>
	            </div>
            </div>
    
	    `;

        // Update the home page container with the stock details
        const homePageContainer = document.getElementById('stock-details-container');
        homePageContainer.innerHTML = stockDetailsHtml;
        homePageContainer.style.display = 'block'; // Make sure the container is shown
        
        const buyButton = document.getElementById('stock-buy-button');
        if (buyButton) {
            buyButton.addEventListener('click', handleBuy);
        }
    }
    
    else {
		// Construct the HTML for the stock details
	    const stockDetailsHtml = `
	        <div class="stock-content">
	            <h2 class="stock-ticker">${companyData.ticker}</h2>
	            <h3 class="company-name">${companyData.name}</h3>
	            <p class="exchange">${companyData.exchange}</p>
	            <p class="summary-title">Summary</p>
	            <div class="horizontal-line"></div>
	            <p>High Price: ${formatCurrency(quoteData.h)}</p>
	            <p>Low Price: ${formatCurrency(quoteData.l)}</p>
	            <p>Open Price: ${formatCurrency(quoteData.o)}</p>
	            <p>Close Price: ${formatCurrency(quoteData.pc)}</p>
	            <div class="horizontal-line"></div>
	            <p class="company-info-title">Company Information</p>
	            <div class="info">
	                <p><span class="info-title">IPO Date:</span> ${companyData.ipo}</p>
	                <p><span class="info-title">Market Cap ($M):</span> ${formatNumber(companyData.marketCapitalization)}</p>
	                <p><span class="info-title">Share Outstanding:</span> ${formatNumber(companyData.shareOutstanding)}</p>
	                <p><span class="info-title">Website:</span> <a href="${companyData.weburl}" target="_blank">${companyData.weburl}</a></p>
	                <p><span class="info-title">Phone:</span> ${companyData.phone}</p>
	            </div>
	        </div>
	    `;
	
	    // Update the home page container with the stock details
	    const homePageContainer = document.getElementById('home-page-container');
	    homePageContainer.innerHTML = stockDetailsHtml;
	    homePageContainer.style.display = 'block'; // Make sure the container is shown
		
	}
    
}

// Handle buy function
// Handle buy function
function handleBuy() {
    const quantityInput = document.getElementById('stock-quantity');
    const quantity = quantityInput ? quantityInput.value : 0;
    const username = localStorage.getItem('username'); // Get username from local storage
	
    if (!username) {
        alert('You must be logged in to place a trade.');
        return;
    }

    if (quantity <= 0 || !currentTicker || currentPrice === null) {
        alert('FAILED: Purchase not possible.');
        return;
    }
    
    // Save the price in localStorage with the ticker as the key
    localStorage.setItem(currentTicker, currentPrice);
    
	
    const tradeData = {
        'username': username,
        'ticker': currentTicker,
        'quantity': quantity,
        'price': currentPrice,
        'tradeType': 'buy'
    };
     
    console.log('Trade data sent to the server:', tradeData);

    fetch('/vedantj_CSCI201_Assignment4/TradeServlet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tradeData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Bought " + quantity + " shares of " + currentTicker + " for $" + currentPrice);
            // Update UI or redirect as needed
        } else {
            alert('Trade failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Trade failed:', error);
    });
}




// API key for Finnhub
const apiKey = 'cnsigjpr01qtn496opt0cnsigjpr01qtn496optg';


