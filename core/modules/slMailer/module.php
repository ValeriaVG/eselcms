<?php
class slMailer extends slModule{
  public function __construct(){
    
    require_once SL_CORE."vendor/swiftmailer/swiftmailer/lib/classes/Swift.php";
  }
}
