<?php
// Custom router for PHP built-in server
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$debugLog = __DIR__ . '/router-debug.log';
file_put_contents($debugLog, date('c') . " $uri\n", FILE_APPEND);

// Serve media files directly from the filesystem
if (preg_match('#^/media/(.+)#', $uri, $matches)) {
    $file = __DIR__ . '/media/' . $matches[1];
    file_put_contents($debugLog, "  media match: $file exists=" . (file_exists($file) ? 'yes' : 'no') . "\n", FILE_APPEND);
    if (file_exists($file) && is_file($file)) {
        $mime = mime_content_type($file);
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($file));
        readfile($file);
        return true;
    }
}

// Let Kirby handle everything else
require __DIR__ . '/index.php';