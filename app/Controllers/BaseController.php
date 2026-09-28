<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Eloquent;
use Psr\Log\LoggerInterface;


abstract class BaseController extends Controller
{
    protected $auth;

    protected string $feature;

    protected function render(string $view, $data = [], array $extra = [])
    {
        $default = [
            'applicationName' => 'SIJARING',
            'featureName' => $this->feature,
            'menus' => $this->getMenu()
        ];

        $module = $this->module ?? $this->getModuleName();

        if (!empty($data)) {
            $data = ['data' => $data];
        }

        return view("Modules\\{$module}\\Views\\{$view}", array_merge($default, $extra, $data));
    }

    protected function getModuleName(): string
    {
        $class = static::class;

        $parts = explode('\\', $class);

        return $parts[1] ?? '';
    }

    /**
     * @return void
     */
    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);

        $this->auth = service('auth');

        Eloquent::getInstance();
    }

    private function getMenu(): array {
        if (ENVIRONMENT === 'development') {
            return [];
        }

        return service('slo')->layananInternal();
    }
}
