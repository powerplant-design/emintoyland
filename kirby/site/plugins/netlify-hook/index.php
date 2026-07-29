<?php

namespace Kirby\PowerPlant;

use Kirby\Cms\App;

/**
 * Triggers a Netlify deploy hook URL whenever content
 * changes in the Panel (page/file create, update, delete,
 * sort, hide, change slug, change status, change template).
 *
 * Configure the hook URL in site/config/config.php:
 *
 *   'powerplant.deployHook' => 'https://api.netlify.com/build_hooks/XXXX'
 *
 * Requests are sent non-blocking so Panel saves stay fast.
 */
App::plugin('powerplant/netlify-hook', [
    'hooks' => [
        'page.create:after'   => fn () => DeployHook::trigger(),
        'page.update:after'   => fn () => DeployHook::trigger(),
        'page.delete:after'   => fn () => DeployHook::trigger(),
        'page.sort:after'     => fn () => DeployHook::trigger(),
        'page.hide:after'     => fn () => DeployHook::trigger(),
        'page.changeSlug:after'     => fn () => DeployHook::trigger(),
        'page.changeStatus:after'   => fn () => DeployHook::trigger(),
        'page.changeTemplate:after' => fn () => DeployHook::trigger(),
        'page.changeTitle:after'   => fn () => DeployHook::trigger(),

        'file.create:after'   => fn () => DeployHook::trigger(),
        'file.update:after'   => fn () => DeployHook::trigger(),
        'file.delete:after'   => fn () => DeployHook::trigger(),
        'file.changeName:after' => fn () => DeployHook::trigger(),
        'file.replace:after'  => fn () => DeployHook::trigger(),

        'site.update:after'   => fn () => DeployHook::trigger(),
    ],
]);

class DeployHook
{
    public static function trigger(): void
    {
        $hook = App::instance()->option('powerplant.deployHook');

        if (!$hook || !is_string($hook)) {
            return;
        }

        $payload = json_encode(['trigger' => 'panel-save']);

        $ch = curl_init($hook);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
            CURLOPT_CONNECTTIMEOUT => 2,
        ]);
        curl_exec($ch);
        curl_close($ch);
    }
}