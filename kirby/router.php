<?php
// Suppress PHP 8.5 deprecation notices (e.g. imagedestroy)
// Kirby's Whoops handler converts them to exceptions, breaking media generation
error_reporting(E_ALL & ~E_DEPRECATED);

// Map file extensions to MIME types (PHP 8.5 mime_content_type returns text/plain for CSS)
$mimeTypes = [
    'css'  => 'text/css',
    'js'   => 'application/javascript',
    'json' => 'application/json',
    'svg'  => 'image/svg+xml',
    'png'  => 'image/png',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif'  => 'image/gif',
    'webp' => 'image/webp',
    'avif' => 'image/avif',
    'ico'  => 'image/x-icon',
    'woff' => 'font/woff',
    'woff2'=> 'font/woff2',
    'ttf'  => 'font/ttf',
];

// Custom router for PHP built-in server
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$debugLog = __DIR__ . '/router-debug.log';
file_put_contents($debugLog, date('c') . " $uri\n", FILE_APPEND);

// Serve media files directly from the filesystem
if (preg_match('#^/media/(.+)#', $uri, $matches)) {
    $file = __DIR__ . '/media/' . $matches[1];
    file_put_contents($debugLog, "  media match: $file exists=" . (file_exists($file) ? 'yes' : 'no') . "\n", FILE_APPEND);
    if (file_exists($file) && is_file($file)) {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $mime = $mimeTypes[$ext] ?? mime_content_type($file);
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($file));
        readfile($file);
        return true;
    }
}

// Let Kirby handle everything else.
// PHP built-in server sets SCRIPT_NAME/PHP_SELF to the request URI when the
// router is inside docroot, breaking Kirby's URL/path detection. Reset them.
$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/index.php';
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php' . $uri;
require __DIR__ . '/index.php';