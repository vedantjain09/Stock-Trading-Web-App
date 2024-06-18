package vedantj_CSCI201_Assignment4;

import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/RegisterServlet")
public class RegisterServlet extends HttpServlet {
	
    private static final long serialVersionUID = 1L;

    // JDBC Driver and Database URL
    static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";  
    static final String DB_URL = "jdbc:mysql://localhost/JoesStocksDB";
    
    // Database credentials
    static final String USER = "root";
    static final String PASS = "agent2003";
    
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter pw = response.getWriter();
        //Gson gson = new Gson();
        
        User user = new Gson().fromJson(request.getReader(), User.class);

//        String username = request.getParameter("username");
//        String password = request.getParameter("password");
//        String email = request.getParameter("email");
//        double balance = 50000; // Set initial balance to 50000
        
        String username = user.getUsername();
        String password = user.getPassword();
        String email = user.getEmail();
        int balance = 50000;
        
        Gson gson = new Gson();
        
        //System.out.println(username);

        // Ensure username and password are not null or empty
        if (username == null || username.isEmpty() ||
            password == null || password.isEmpty() ||
            email == null || email.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            String error = "Username, password, and email cannot be empty";
            pw.write(gson.toJson(error));
        } else {
            int userId = registerUser(username, password, email, balance);
            if (userId == -1) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                String error = "Username already taken";
                pw.write(gson.toJson(error));
            } else if (userId == -2) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                String error = "Email is already registered";
                pw.write(gson.toJson(error));
            } else if (userId > 0) {
                response.setStatus(HttpServletResponse.SC_OK);
                pw.write(gson.toJson("User registered successfully"));
//                pw.write(gson.toJson("User registered successfully with ID: " + userId));
                	
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                String error = "An error occurred during registration";
                pw.write(gson.toJson(error));
            }
        }
        pw.flush();
    }

    public int registerUser(String username, String password, String email, double balance) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            Class.forName(JDBC_DRIVER);
            conn = DriverManager.getConnection(DB_URL, USER, PASS);

            // Check if username is taken
            String sql = "SELECT * FROM Users WHERE username = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, username);
            rs = pstmt.executeQuery();
            if (rs.next()) {
                return -1; // Username taken
            }
            rs.close();
            pstmt.close();

            // Check if email is taken
            sql = "SELECT * FROM Users WHERE email = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, email);
            rs = pstmt.executeQuery();
            if (rs.next()) {
                return -2; // Email taken
            }
            rs.close();
            pstmt.close();

            // Insert new user
            sql = "INSERT INTO Users (username, password, email, balance) VALUES (?, ?, ?, ?)";
            pstmt = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS);
            pstmt.setString(1, username);
            pstmt.setString(2, password); // Should be hashed
            pstmt.setString(3, email);
            pstmt.setDouble(4, balance);
            pstmt.executeUpdate();
            rs = pstmt.getGeneratedKeys();
            if (rs.next()) {
                return rs.getInt(1); // Return generated user ID
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            return 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return 0;
        } finally {
            try {
                if (rs != null) rs.close();
                if (pstmt != null) pstmt.close();
                if (conn != null) conn.close();
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
        return 0;
    }
}

