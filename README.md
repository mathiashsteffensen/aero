# *Aero Web Framework*

A modern web framework, with all the batteries included you would expect.

The goal of this framework is to be exactly the opposite of most other NodeJS framework.
We don't aim to be one of the many hundreds of packages you need to connect to have a fully functioning web application.

An Aero application comes preconfigured with the following functionality

* A fast web server based on [Fastify](https://www.fastify.io/)
* Automatic controller loading to keep your routes file free from cluttered import statements
* A front-end build pipeline based on [ESBuild](https://esbuild.github.io/)
* [EJS](https://ejs.co/#promo) view templates, automatically rendered based on your controller action
* ORM for working with SQL databases
* Background processing framework to ensure your application scales
* Mailing functionality, including sending & previewing emails, and inlining CSS
* Authentication engine to get quickly setup with login functionality

### TODO

General improvements
* Better test coverage
* Add more intelligent reloading and server restarts, no reason to restart the whole server because a view changed
* Add better route parsing and constructing

Before release
* Add docs
* Ensure "new" generator truly generates everything needed
