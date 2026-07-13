<?php

namespace KirbyAuthor;

use Kirby\Cms\App;
use Kirby\Http\Response;

// Serve file content directly via /media-proxy/{uuid-or-filename}
// Bypasses Kirby's media hashing for headless/static build use cases
App::plugin('author/media-proxy', [
    'routes' => [
        [
            'pattern' => 'media-proxy/(:all)',
            'method'  => 'GET',
            'action'  => function ($path) {
                $kirby = App::instance();
                $file = null;

                // Try by UUID first (file://xxx-xxx-xxx format encoded)
                if (str_starts_with($path, 'file-')) {
                    $uuid = 'file://' . str_replace('file-', '', $path, 1);
                    try {
                        $file = $kirby->file($uuid);
                    } catch (\Throwable $e) {}
                }

                // Fallback: filename lookup on site files
                if (!$file) {
                    $file = $kirby->site()->file($path);
                }

                // Fallback: search all pages
                if (!$file) {
                    foreach ($kirby->site()->index() as $page) {
                        if ($f = $page->file($path)) {
                            $file = $f;
                            break;
                        }
                    }
                }

                if (!$file) {
                    return new Response('File not found: ' . $path, 'text/plain', 404);
                }

                $root = $file->root();
                if (!file_exists($root)) {
                    return new Response('File missing on disk', 'text/plain', 404);
                }

                return Response::file($root);
            }
        ]
    ]
]);