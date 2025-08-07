<?php
session_start();
include("connect.php");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BSIT Forms</title>
    <link rel="stylesheet" href="style.css">
    <link rel="shortcut icon" href="1600w-pUhZOkMnsk8.webp" type="image/x-icon">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
</head>
<body>
   <!-- ...existing code... -->
<div id="signin-form-container">
    <form action="login_process.php" method="post">
        <h1>Sign in</h1>

        <label for="email">Email:</label>
        <input type="text" id="email" name="email" placeholder="Enter your email" required><br><br>

        <label for="password">Password:</label>
        <input type="password" id="password" name="password" placeholder="Enter your password" required><br><br>

        <input type="submit" value="Login">
        <br>
        <div class="links">
            <p>Don't have an account yet?</p>
            <button class="form-switch-btn" data-target="register-form-container">Register</button>
        </div>
        <br>
        <footer>
            <p>&copy; 2023 BSIT Program. All rights reserved.</p>
        </footer>
    </form>
</div>

<div id="register-form-container" style="display: none;">
   <form action="register.php" method="post">
    <h1 class="title">Register</h1>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" placeholder="Enter your email" required>
    <br><br>
    <label for="create_password">Create password:</label>
    <input type="password" id="create_password" name="create_password" placeholder="create new password" required>
    <br><br>
    <label for="confirm_password">Confirm password</label>
    <input type="password" id="confirm_password" name="confirm_password" placeholder="confirm your password" required>
    <br><br>
    <input type="submit" value="Register">
    <br>
    <div class="links">
        <p>Already have an account?</p>
        <button class="form-switch-btn" data-target="signin-form-container">Sign in</button>
    </div>
    <br>
    <footer>
        <p>&copy; 2023 BSIT Program. All rights reserved.</p>
    </footer>
</form>
</div>
<script src="script.js"></script>
<!-- Message Modal Overlay -->
<div id="message-modal-overlay" class="hidden">
  <div class="modal-content opacity-0 scale-95">
    <h2 id="message-modal-title"></h2>
    <p id="message-modal-body"></p>
    <button id="message-modal-close-btn">Close</button>
  </div>
</div>
<!-- ...existing code... -->
</body>
</html>