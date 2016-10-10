<?php

class Esel
{
    /**
     * Twig Enviroment variable.
     *
     * @var Twig_Environment
     */
    private $twig = null;
    /**
     * Data that goes to template.
     *
     * @var array
     */
    private $data = array();

    /**
     * Loading vendor classes.
     */
    private function init()
    {
        require_once SL_CORE.'vendor/autoload.php';
        Twig_Autoloader::register();
        $loader = new Twig_Loader_Filesystem(array(SL_TEMPLATES, SL_PAGES, SL_TESTS.'tpl'));
        $this->twig = new Twig_Environment($loader, array('cache' => SL_TEMPLATES_CACHE, 'debug' => true));
        $this->twig->addExtension(new Twig_Extension_Debug());
        $this->twig->registerUndefinedFunctionCallback(function ($functionName) {
            $tmp = null;
            if (preg_match('/([^_]+)_(.*)/', $functionName, $tmp)) {
                $module = $this->loadModule($tmp[1]);

                return new Twig_SimpleFunction($functionName, $tmp[1].'::'.$tmp[2]);
            }

            return false;
        });
    }
    public function __construct()
    {
        $this->init();
    }
    /**
     * Shorthand for htmlspecialchars.
     *
     * @param int $var Variable to escape or Array
     *
     * @return string $var Sanitized data or Array of it
     */
    public static function clear($var)
    {
        if (is_array($var)) {
            $tmp = array();
            foreach ($var as $key => $value) {
                $tmp[self::clear($key)] = self::clear($value);
            }

            return $tmp;
        }

        return htmlspecialchars($var);
    }

    /**
     * Renders given template file.
     *
     * @param string $filename
     *
     * @return string $output
     */
    public function render($filename)
    {
        $output = $this->twig->render($filename, $this->data);

        return $output;
    }
    /**
     * Sets up corresponding header and redirects to sprecified url.
     *
     * @param int    $code
     * @param strong $uri
     */
    public static function respondWithCode($code, $uri = null)
    {
        switch ($code) {
        case 301:
          header('HTTP/1.1 301 Moved Permanently');
        break;
        case 404:
          header('HTTP/1.0 404 Not Found');
        break;
      }

        if (!empty($uri)) {
            header('Location: '.str_replace('//', '/', ('/'.$uri)));
            if (!@PHPUNIT_RUNNING === 1) {
                // @codeCoverageIgnoreStart
              exit();
              // @codeCoverageIgnoreEnd
            }
        }
    }
    /**
     * Basic SEO routing following page files structure.
     *
     * @param string $uri Requested uri
     *
     * @return string $template Template file
     */
    public function route($uri, $sendHeaders = true)
    {
        if (preg_match("/index(\/?)/", $uri)) {
            $rootUri = preg_replace('/(\/){2,}/i', '/', (preg_replace("/index(\/?)/", '', $uri).'/'));
            if ($sendHeaders) {
                self::respondWithCode(301, $rootUri);
            }
            $uri = $rootUri;
        }
        if (!preg_match('/\/$/', $uri) || (preg_match('/\/\//', $uri))) {
            $realUri = preg_replace('/(\/){2,}/i', '/', ($uri.'/'));
            if ($sendHeaders) {
                self::respondWithCode(301, $realUri);
            }
            $uri = $realUri;
        }
        $this->data['uri'] = $uri;
        if (empty($uri) || ($uri == '/')) {
            $uri = 'index';
        }

        if (is_dir(SL_PAGES.$uri)) {
            return $uri.'index.html';
        }
        $template = preg_replace("/(\/){1}$/", '', $uri).'.html';

        if (!file_exists(SL_PAGES.$template)) {
            if ($sendHeaders) {
                self::respondWithCode(404);
            }
            $template = '404.html';
        }

        return $template;
    }
    /**
     * Request processor.
     *
     * @return string $output
     */
    public function handleRequest()
    {
        $uri = '/';
        if (!empty($_GET['uri'])) {
            $uri = $this->clear($_GET['uri']);
        }

        $template = $this->route($uri);
        $output = $this->render($template);

        return $output;
    }
    /**
     * Initialize and access module object.
     *
     * @param EselModule $moduleName
     *
     * @return moduleName $module
     */
    public function module($moduleName)
    {
        $this->loadModule($moduleName);

        return new $moduleName($this);
    }
    /**
     * Including a module if it passes md5 sum verification.
     *
     * @param string $moduleName
     */
    public function loadModule($moduleName)
    {
        require_once SL_CORE.'/classes/EselModule.php';
        if (EselModule::isSafe($moduleName)) {
            require_once SL_MODULES.$moduleName.'/Module.php';
        }
    }
    /**
     * Adds data to the array that template gets.
     *
     * @param mixed $key
     * @param mixed $value
     */
    public function addData($key, $value)
    {
        $this->data[$key] = $value;
    }
    /**
     * Retuns array of data or it's element if key specified.
     *
     * @param mixed $key
     *
     * @return mixed $data
     */
    public function getData($key = null)
    {
        if ($key === null) {
            return $this->data;
        }

        return $this->data[$key];
    }
    /**
     * Idiorm wrapper.
     *
     * @param string $table Table name
     *
     * @return ORM cursor
     */
    public static function for_table($table)
    {
        if (!class_exists('ORM')) {
            require_once SL_CORE.'lib/idiorm.php';
        }
        ORM::configure(SL_DB_TYPE.':host='.SL_DB_HOST.';dbname='.SL_DB_NAME);
        ORM::configure('username', SL_DB_USER);
        ORM::configure('password', SL_DB_PASS);

        return ORM::for_table(SL_DB_PREFIX.$table);
    }
}
