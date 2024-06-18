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

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/PortfolioServlet")
public class PortfolioServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";  
    static final String DB_URL = "jdbc:mysql://localhost/JoesStocksDB";
    
    // Database credentials
    static final String USER = "root";
    static final String PASS = "agent2003";

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String username = new Gson().fromJson(request.getReader(), JsonObject.class).get("username").getAsString();
        PrintWriter out = response.getWriter();
        JsonObject jsonResponse = new JsonObject();

        try {
            Class.forName(JDBC_DRIVER);
            try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASS)) {
                // Get the user_id from the Users table
                int userId = -1;
                String sqlUserId = "SELECT user_id FROM Users WHERE username = ?";
                try (PreparedStatement pstmtUserId = conn.prepareStatement(sqlUserId)) {
                    pstmtUserId.setString(1, username);
                    try (ResultSet rsUserId = pstmtUserId.executeQuery()) {
                        if (rsUserId.next()) {
                            userId = rsUserId.getInt("user_id");
                        } else {
                            // Handle case where user is not found, possibly throw an exception or return error
                            jsonResponse.addProperty("error", "User not found");
                            out.print(jsonResponse.toString());
                            return;
                        }
                    }
                }
                
                // Query for fetching stocks and quantities using user_id
                List<JsonObject> stocks = new ArrayList<>();
                if (userId != -1) {
                    String sqlStocks = "SELECT ticker, SUM(numStock) as total_quantity FROM Portfolio WHERE user_id = ? GROUP BY ticker";
                    try (PreparedStatement pstmtStocks = conn.prepareStatement(sqlStocks)) {
                        pstmtStocks.setInt(1, userId);
                        try (ResultSet rsStocks = pstmtStocks.executeQuery()) {
                            while (rsStocks.next()) {
                                JsonObject stockInfo = new JsonObject();
                                stockInfo.addProperty("ticker", rsStocks.getString("ticker"));
                                stockInfo.addProperty("quantity", rsStocks.getInt("total_quantity"));
                                stocks.add(stockInfo);
                            }
                        }
                    }
                }
                
                jsonResponse.add("stocks", new Gson().toJsonTree(stocks));

                // Fetch user balance
                String sqlBalance = "SELECT balance FROM Users WHERE user_id = ?";
                try (PreparedStatement pstmtBalance = conn.prepareStatement(sqlBalance)) {
                    pstmtBalance.setInt(1, userId);
                    try (ResultSet rsBalance = pstmtBalance.executeQuery()) {
                        if (rsBalance.next()) {
                            jsonResponse.addProperty("balance", rsBalance.getDouble("balance"));
                        }
                    }
                }

                out.print(jsonResponse.toString());
            }
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
            jsonResponse.addProperty("error", "Database error: " + e.getMessage());
            out.print(jsonResponse.toString());
        }
        out.flush();
    }
}