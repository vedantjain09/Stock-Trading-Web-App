const apiKey = 'cnsigjpr01qtn496opt0cnsigjpr01qtn496optg';



document.addEventListener('DOMContentLoaded', function() {
  const username = localStorage.getItem('username');
  if (!username) {
    alert('You must be logged in to view your portfolio.');
    window.location.href = 'login.html';
    return;
  }

  fetchPortfolio(username);
  
});


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


function fetchPortfolio(username) {
  fetch('/vedantj_CSCI201_Assignment4/PortfolioServlet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username })
  })
  .then(response => response.json())
  .then(data => {
    if (!data.error) {
      updateBalance(data.balance);
      // Check if the stocks array is empty or all quantities are zero
      if (!data.stocks || data.stocks.length === 0 || data.stocks.every(stock => stock.quantity === 0)) {
        alert("You have no stocks in your portfolio.");
        document.getElementById('accountValue').textContent = "50000.00";
      } else {
        displayPortfolio(data.stocks);
      }
    } else {
      alert('Error: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error fetching portfolio:', error);
  });
}

function updateBalance(balance) {
  document.getElementById('cashBalance').textContent = balance.toFixed(2);
}


async function displayPortfolio(stocks) {
  const stockList = document.getElementById('stock-positions');
  stockList.innerHTML = ''; // Clear existing items

  let totalStockValue = 0;

  for (const stock of stocks) {
    if (stock.quantity > 0) {
      const stockData = await fetchStockData(stock.ticker);
      if (stockData) {
		// Get the saved purchase price from localStorage
        const purchasePrice = localStorage.getItem(stock.ticker) || stockData.quoteData.c; // Fallback to current price if not found
        const marketValue = stock.quantity * stockData.quoteData.c;
        totalStockValue += marketValue;  // Accumulate total value of stocks

        const changeColor = stockData.quoteData.dp > 0 ? 'green' : stockData.quoteData.dp < 0 ? 'red' : 'black';
        const changeSymbol = stockData.quoteData.dp > 0 ? '▲' : stockData.quoteData.dp < 0 ? '▼' : '';

        const stockItem = document.createElement('div');
        stockItem.classList.add('stock-item');
        stockItem.innerHTML = `
        	
        	<div class="stock-name">
        		<h3>${stock.ticker} - ${stockData.companyData.name}</h3>
        	</div>
        	
        	<div class="stock-info">
	            <p>Quantity: <span>${stock.quantity}</span></p>
	            <p class="${changeColor}">Change: ${changeSymbol} ${stockData.quoteData.dp.toFixed(2)}%</p>
	            <p>Avg. Cost / Share: <span>$${parseFloat(purchasePrice).toFixed(2)}</span></p>
	            <p>Current Price: <span>$${stockData.quoteData.c.toFixed(2)}</span></p>
	            <p>Total Cost: <span>$${marketValue.toFixed(2)}</span></p>
	            <p>Market Value: <span>$${marketValue.toFixed(2)}</span></p>
	          </div>
	          
	          <div class="trade-inputs">
	            <div class="quantity-row">
	              <label for="quantity-${stock.ticker}">Quantity:</label>
	              <input type="number" min="1" id="quantity-${stock.ticker}" placeholder="" class="quantity-input">
	           </div>
	            <div class="radio-options">
	              <label><input type="radio" name="action-${stock.ticker}" value="buy"> BUY</label>
	              <label><input type="radio" name="action-${stock.ticker}" value="sell"> SELL</label>
	            </div>
	            <button id="stock-buy-button" onclick="validateAndSubmitTrade('${stock.quantity}', '${stock.ticker}', document.querySelector('input[name=action-${stock.ticker}]:checked'), document.getElementById('quantity-${stock.ticker}'))">Submit</button>
	            
	          </div>
        `;
        
        

        stockList.appendChild(stockItem);
    
      }
    }
  }

  // Calculate and update the net account balance
  const currentBalance = parseFloat(document.getElementById('cashBalance').textContent);
  
  const netAccountBalance = currentBalance + totalStockValue;
  document.getElementById('accountValue').textContent = netAccountBalance.toFixed(2);
}


function validateAndSubmitTrade(stockQuantity, ticker, tradeTypeInput, quantityInput) {
  const quantity = parseInt(quantityInput.value);
  const tradeType = tradeTypeInput ? tradeTypeInput.value : null;

  // Check if the quantity is valid and if a trade type is selected
  if (isNaN(quantity) || quantity <= 0) {
    alert('FAILED, transaction not possible.');
    return;
  }

  if (!tradeType) {
    alert('Please select Buy or Sell.');
    return;
  }

  // Call the submitTrade function with valid inputs
  submitTrade(stockQuantity, ticker, tradeType, quantity.toString());
}


async function submitTrade(stockQuantity, ticker, tradeType, quantityStr) {
  
  const quantity = parseInt(quantityStr);
  console.log("reached");
  

  // Check if the quantity is valid and if a trade type is selected
  if (quantity <= 0 || !tradeType) {
    alert('FAILED, transaction not possible');
    return;
  }
  
  if (isNaN(quantity) || quantity <= 0) {
	
    alert('Please enter a valid quantity.');
    return;
  }

  // Get the current price of the stock
  const stockData = await fetchStockData(ticker);
  if (!stockData) {
    alert('Failed to get stock data.');
    return;
  }
  
  // Validate user's action
  if (!tradeType) {
    alert('Please select Buy or Sell.');
    return;
  }

  

  // Additional checks for BUY or SELL
  if (tradeType === 'buy') {
    // Check if user has enough balance for the purchase
    const totalCost = stockData.quoteData.c * quantity;
    const currentBalance = parseFloat(document.getElementById('cashBalance').textContent);
    if (totalCost > currentBalance) {
      alert('Not enough balance to buy the stock.');
      return;
    }
  } else if (tradeType === 'sell') {
    // Check if user has enough quantity of stock to sell
    // Assume there is a function that gets the current quantity of stock owned by the user
    const currentStockQuantity = stockQuantity; // You will need to implement this
    if (quantity > currentStockQuantity) {
      alert('Not enough stock quantity to sell.');
      return;
    }
  }
  
  const tradeData = {
    username: localStorage.getItem('username'), // Replace with actual username if not using localStorage
    ticker,
    quantity,
    tradeType,
    price: stockData.quoteData.c // Current price from fetched stock data
  };

  // Send trade data to the server
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
      alert(`Successfully ${tradeType} ${quantity} shares of ${ticker}.`);
      fetchPortfolio(localStorage.getItem('username')); // Refresh the portfolio to reflect the trade
    } else {
      alert(`Trade failed: ${data.message}`);
    }
  })
  .catch(error => {
    console.error('Error during trade:', error);
  });
}


