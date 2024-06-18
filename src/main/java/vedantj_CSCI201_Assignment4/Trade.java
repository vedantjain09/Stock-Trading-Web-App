package vedantj_CSCI201_Assignment4;

public class Trade {
	private String username;
    private String ticker;
    private int quantity;
    private double price;
    String tradeType;
    // Other variables if necessary

    // Constructor
    public Trade(String username, String ticker, int quantity, double price, String tradeType) {
        this.ticker = ticker;
        this.quantity = quantity;
        this.price = price;
        this.tradeType = tradeType;
        // Initialize other variables if necessary
    }

    // Getters
    
    public String getUsername() {
    	return username;
    }
    
    public String getTicker() {
        return ticker;
    }

    public int getQuantity() {
        return quantity;
    }

    public double getPrice() {
        return price;
    }
    
    public String getType() {
        return tradeType;
    }
    // Other getters if you added more variables
    
    // Setters
    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    // Other setters if you added more variables
}
