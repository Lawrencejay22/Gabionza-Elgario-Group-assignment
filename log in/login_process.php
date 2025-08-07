<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $connect = mysqli_connect("localhost", "root", "", "bsit_db");
    if (!$connect) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $email = htmlspecialchars(trim($_POST['email']));
    $password = htmlspecialchars(trim($_POST['password']));

    // Check if email exists and verify password
    $stmt = mysqli_prepare($connect, "SELECT password FROM users WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        mysqli_stmt_bind_result($stmt, $hashed_password);
        mysqli_stmt_fetch($stmt);

        if (password_verify($password, $hashed_password)) {
            $_SESSION['email'] = $email;
            echo "<script>alert('Welcome, " . $_SESSION['email'] . "!'); window.location.href='bsit.html';</script>";
            exit();
        } else {
            echo "Invalid email or password.";
        }
    } else {
        echo "Invalid email or password.";
    }

    mysqli_stmt_close($stmt);
    mysqli_close($connect);
} else {
    echo "Invalid request method.";
}
?>