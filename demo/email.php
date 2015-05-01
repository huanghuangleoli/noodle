<?php
date_default_timezone_set('america/los_angeles');
$to      = 'dinneract2015@gmail.com';
$subject = "signup " . date(DATE_RFC2822);
$message = "I'm a " . $_POST["type"] . " and my email is " . $_POST["email"];
$headers = 'From: noreply@dinneract.com' . "\r\n" .
   // 'Reply-To: webmaster@example.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

$status = mail($to, $subject, $message, $headers);

if($status){
	echo "success";
} else {
	$error = error_get_last();
	echo $error["message"];	
	//echo "failed";
}
?> 
