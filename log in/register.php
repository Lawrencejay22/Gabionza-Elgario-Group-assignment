<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $connect = mysqli_connect("localhost", "root", "", "bsit_db");
    if (!$connect) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $email = htmlspecialchars(trim($_POST['email']));
    $password = htmlspecialchars(trim($_POST['password']));
    // Check if passwords match
    if ($password !== $confirm) {
        echo "Passwords do not match.";
        exit();
    }

    // Check if email already exists
    $stmt = mysqli_prepare($connect, "SELECT id FROM users WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        echo "Email already registered.";
        exit();
    }
    mysqli_stmt_close($stmt);

    // Hash the password
    $hashed = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = mysqli_prepare($connect, "INSERT INTO users (email, password) VALUES (?, ?)");
    mysqli_stmt_bind_param($stmt, "ss", $email, $hashed);
    if (mysqli_stmt_execute($stmt)) {
        // Registration successful, redirect to login form with flag
        header("Location: bsit.html");
        exit();
    } else {
        echo "Registration failed.";
    }

    mysqli_stmt_close($stmt);
    mysqli_close($connect);
} else {
    echo "Invalid request method.";
}
?>
?>?
