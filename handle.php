<!-- <?php
    // new filename
    $filename = 'pic_'.date('YmdHis').'.jpeg';

    $url = '';
    if(move_uploaded_file($_FILES['webcam']['tmp_name'], 'upload/'.$filename) ){
        $url = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/upload/' . $filename;
    }

    // Return image url
    echo $url;
?> -->

<?php

function makeRandomName($max=16) {
    $i = 1; 
    $possible_keys = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $keys_length = strlen($possible_keys);
    $str = "";
    $str.= $possible_keys[mt_rand(10,$keys_length-1)];
    while($i<$max) {
        $rand = mt_rand(0,$keys_length-1);
        $str.= $possible_keys[$rand];
        $i++;
    }
    return $str;
}

$action = $_POST['action'];

if ($action === 'upload-file') {
    $file = $_FILES['file'];

    $split_filename = explode('.', $file['name'], 2);
    $file_detail = '.'.$split_filename[1];
    $newname = makeRandomName();
    $file_name = $file['tmp_name'];
    $target_dir = 'images/';
    $target_file = $target_dir.basename($newname.$file_detail);
    $output = move_uploaded_file($file_name, $target_file);

    //TODO: handle split image and merge from here...

    $start_time = time();

    $command = escapeshellcmd('python3 cropface_1.py -i '.$target_file);
    $output = shell_exec($command);

    $finish_time = time();

    // check file and remove file from folder
    $error_message = '-python file is not running-<br>';
    if (file_exists($target_file)) {
        unlink($target_file);
    }
    else {
        $error_message.='-target uploaded file not found-<br>';
    }
    if ($output != null) {
        echo json_encode([
            'code' => 200,
            'src' => $output,
            'name' => $newname,
            'detail'=> $file_detail,
            'time' => $finish_time - $start_time,
            'message' => 'Process runs successfully!'
        ]);
    }
    else {
        echo json_encode([
            'code' => 400,
            'message' => $error_message
        ]);
    }
    die;
}

echo json_encode([
    'code' => 400,
    'message' => 'Oops, something went wrong',
]);
die;

?>

