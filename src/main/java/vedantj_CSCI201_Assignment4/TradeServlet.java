package vedantj_CSCI201_Assignment4;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/TradeServlet")
public class TradeServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    //String tradeType;
    
	 // JDBC Driver and Database URL
	static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";  
    static final String DB_URL = "jdbc:mysql://localhost/JoesStocksDB";
    
    // Database credentials
    static final String USER = "root";
    static final String PASS = "agent2003";

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
    	response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        Trade trade = new Gson().fromJson(request.getReader(), Trade.class);
        
        String username = trade.getUsername();
        String ticker = trade.getTicker();
        int quantity = trade.getQuantity();
        double price = trade.getPrice();
        String tradeType = trade.getType();
        //String tradeType = quantity > 0 ? "buy" : "sell";
        

        
        Gson gson = new Gson();

        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
        	Class.forName(JDBC_DRIVER);
            conn = DriverManager.getConnection(DB_URL, USER, PASS);
            //conn = DriverManager.getConnection("jdbc:mysql://localhost/JoesStocksDB", "root", "agent2003");
            
            
            // Start transaction
            conn.setAutoCommit(false);
            
            // Retrieve user balance and ID
            String userQuery = "SELECT user_id, balance FROM Users WHERE username = ?";
            pstmt = conn.prepareStatement(userQuery);
            pstmt.setString(1, username);
            rs = pstmt.executeQuery();

            int userId = -1;
            double balance = 0.0;
            if (rs.next()) {
                userId = rs.getInt("user_id");
                balance = rs.getDouble("balance");
            }

            if (userId != -1) {
                double tradeAmount = quantity * price;
                // Check for sufficient funds if buying
                if ("buy".equals(tradeType)) {
                	if (tradeAmount > balance) {
                        throw new SQLException("Insufficient funds to complete purchase.");
                    }
                	
                	balance -= tradeAmount;
                	
                	String balanceUpdateQuery = "UPDATE Users SET balance = ? WHERE user_id = ?";
                    pstmt = conn.prepareStatement(balanceUpdateQuery);
                    pstmt.setDouble(1, balance);
                    pstmt.setInt(2, userId);
                    pstmt.executeUpdate();

                    // Record trade in Portfolio
                    //String tradeAction = "buy".equals(tradeType) ? "Bought" : "Sold";
                    String tradeQuery = "INSERT INTO Portfolio (user_id, ticker, numStock, price) VALUES (?, ?, ?, ?)";
                    pstmt = conn.prepareStatement(tradeQuery);
                    pstmt.setInt(1, userId);
                    pstmt.setString(2, ticker);
                    pstmt.setInt(3, quantity);
                    pstmt.setDouble(4, price);
                    pstmt.executeUpdate();
                	
                	
                	
                	
                }
                
//                else if ("sell".equals(tradeType)) {
//                    // Verify the user owns enough of the stock to sell
//                    String checkStockQuery = "SELECT id, numStock FROM Portfolio WHERE user_id = ? AND ticker = ? ORDER BY id ASC";
//                    pstmt = conn.prepareStatement(checkStockQuery);
//                    pstmt.setInt(1, userId);
//                    pstmt.setString(2, ticker);
//                    rs = pstmt.executeQuery();
//
//                    List<Integer> rowIdsToUpdate = new ArrayList<>();
//                    int totalStocksToZero = quantity;
//
//                    while (rs.next() && totalStocksToZero > 0) {
//                        int rowId = rs.getInt("id");
//                        int stockInRow = rs.getInt("numStock");
//                        if (stockInRow > 0) {
//                            rowIdsToUpdate.add(rowId);
//                            totalStocksToZero--;
//                        }
//                    }
//
//                    // Close the ResultSet
//                    rs.close();
//
//                    // Check if we found enough stock entries to zero out
//                    if (totalStocksToZero > 0) {
//                        throw new SQLException("Not enough stock available to sell.");
//                    }
//
//                    // Update the selected rows to set their stock count to zero
//                    for (int rowId : rowIdsToUpdate) {
//                        String zeroStockQuery = "UPDATE Portfolio SET numStock = 0 WHERE id = ?";
//                        pstmt = conn.prepareStatement(zeroStockQuery);
//                        pstmt.setInt(1, rowId);
//                        pstmt.executeUpdate();
//                    }
//
//                    // Update user balance to reflect the sale
//                    balance += quantity * price;  // Assuming 'price' is the sell price per unit
//                    String updateBalanceQuery = "UPDATE Users SET balance = ? WHERE user_id = ?";
//                    pstmt = conn.prepareStatement(updateBalanceQuery);
//                    pstmt.setDouble(1, balance);
//                    pstmt.setInt(2, userId);
//                    pstmt.executeUpdate();
//                }

                
                else if ("sell".equals(tradeType)) {
                    // Check if the user owns enough stock to sell
                    String checkStockQuery = "SELECT SUM(numStock) AS stockQuantity FROM Portfolio WHERE user_id = ? AND ticker = ?";
                    pstmt = conn.prepareStatement(checkStockQuery);
                    pstmt.setInt(1, userId);
                    pstmt.setString(2, ticker);
                    rs = pstmt.executeQuery();

                    int stockQuantity = 0;
                    if (rs.next()) {
                        stockQuantity = rs.getInt("stockQuantity");
                    }
                    rs.close(); // Close ResultSet

                    if (quantity > stockQuantity) {
                        throw new SQLException("Not enough stock to sell.");
                    }

                    // Update balance for selling
                    balance += tradeAmount;
                    
                    String balanceUpdateQuery = "UPDATE Users SET balance = ? WHERE user_id = ?";
                    pstmt = conn.prepareStatement(balanceUpdateQuery);
                    pstmt.setDouble(1, balance);
                    pstmt.setInt(2, userId);
                    pstmt.executeUpdate();
                    
                 // Calculate the total number of stocks to sell
                    // Deduct the sold stock quantity from Portfolio
                    String updatePortfolioQuery = "UPDATE Portfolio SET numStock = numStock - ? WHERE user_id = ? AND ticker = ?";
                    pstmt = conn.prepareStatement(updatePortfolioQuery);
                    pstmt.setInt(1, quantity);
                    pstmt.setInt(2, userId);
                    pstmt.setString(3, ticker);
                    pstmt.executeUpdate();
                }
                
                
                	
                // Adjust balance
                //balance += "sell".equals(tradeType) ? tradeAmount : -tradeAmount;

                // Update user's balance
//                String balanceUpdateQuery = "UPDATE Users SET balance = ? WHERE user_id = ?";
//                pstmt = conn.prepareStatement(balanceUpdateQuery);
//                pstmt.setDouble(1, balance);
//                pstmt.setInt(2, userId);
//                pstmt.executeUpdate();

                // Record trade in Portfolio
                String tradeAction = "buy".equals(tradeType) ? "Bought" : "Sold";
//                String tradeQuery = "INSERT INTO Portfolio (user_id, ticker, numStock, price) VALUES (?, ?, ?, ?)";
//                pstmt = conn.prepareStatement(tradeQuery);
//                pstmt.setInt(1, userId);
//                pstmt.setString(2, ticker);
//                pstmt.setInt(3, quantity);
//                pstmt.setDouble(4, price);
//                //pstmt.setString(5, tradeAction);
//                
//                pstmt.executeUpdate();
                
                // Commit transaction
                conn.commit();
                
                // Trade was successful
                JsonObject jsonResponse = new JsonObject();
                jsonResponse.addProperty("status", "success");
                jsonResponse.addProperty("message", tradeAction + " " + quantity + " shares of " + ticker + " at " + price + " each.");
                jsonResponse.addProperty("newBalance", balance);
                out.print(gson.toJson(jsonResponse));
            } else {
                // User not found
                throw new SQLException("User not found.");
            }
        } catch (SQLException e) {
            // Rollback transaction in case of error
            if (conn != null) try { conn.rollback(); } catch (SQLException se) { /* ignored */ }
            
            // Handle SQL exceptions
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("status", "error");
            jsonResponse.addProperty("message", "SQL Error: " + e.getMessage());
            out.print(gson.toJson(jsonResponse));
        } catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
            // Clean up
            try { if (rs != null) rs.close(); } catch (Exception e) { /* ignored */ }
            try { if (pstmt != null) pstmt.close(); } catch (Exception e) { /* ignored */ }
            try { if (conn != null) conn.close(); } catch (Exception e) { /* ignored */ }
        }
        
        out.flush();
        out.close();
    }
}
