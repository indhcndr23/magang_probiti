<?php

namespace Config;

use Illuminate\Database\Capsule\Manager as Capsule;

/**
 * 
 */
class Eloquent
{
    protected static $capsule;

    function __construct()
    {

        if (self::$capsule) {
            return self::$capsule;
        }

        $capsule = new Capsule;
        $db_config = config('Database');
        // // DBDriver
        $capsule->addConnection([
            'driver'    =>  'mysql', // $db_config->default['DBDriver'],
            'host'      => $db_config->default['hostname'],
            'database'  => $db_config->default['database'],
            'username'  => $db_config->default['username'],
            'password'  => $db_config->default['password'],
            'charset'  =>  $db_config->default['charset'],
            'collation' => $db_config->default['DBCollat'],
            'prefix'    => $db_config->default['DBPrefix'],
            'port'      => $db_config->default['port'] ?? 3306,
        ]);

        $capsule->setAsGlobal();

        $capsule->bootEloquent();

        self::$capsule = $capsule;

        return self::$capsule;
    }

    public static function getInstance()
    {
        if (!self::$capsule) {
            new self();
        }
        return self::$capsule;
    }
}
