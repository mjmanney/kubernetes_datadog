# Datadog APM Monitoring with Express.js & Docker
### Hack Day - October 2018
### tags: datadog, apm, tracing, docker, containers, node.js, express.js, mongodb, mongoose

The goal of this project is to go through the steps of creating a web service, connect it to a database, and monitor the app with Datadog's APM.  First we will configure a working setup on `localhost` and then we will deploy a containerized project. 

## Environment

- Docker: a tool designed to make it easier to create, deploy, and run applications by using containers. Containers allow a developer to package up an application with all of the parts it needs, such as libraries and other dependencies, and ship it all out as one package.
  - https://www.docker.com/get-started

- Node.js: an asynchronous event driven JavaScript runtime, Node is designed to build scalable network applications. 
  - https://nodejs.org/en/about/

- NPM: the package manager for JavaScript and the world’s largest software registry.
  - https://www.npmjs.com/ 

- MongoDB - NoSQL Database that stores data in flexible, JSON-like documents, meaning fields can vary from document to document and data structure can be changed over time.
  - https://www.mongodb.com/what-is-mongodb

### Create the Hack App

Begin by navigating to your workspace.  Don't create a project folder just yet.

Using NPM, install the Express Generator package utility which provides a command-line tool you can use to scaffold your Express.js app.  Express is a Node.js application framework that lets you easily build web applications.

`npm install express-generator -g`

Now we have the `express` command-line tool available to us.  The usage is as follows:

`Usage: express [options] [dir]`

Run the following command:

`express --view=pug hack-app`

With this short command we have the skeleton for our web app!

~~~
.
├── app.js
├── bin
│   └── www
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes
│   ├── index.js
│   └── users.js
└── views
    ├── error.pug
    ├── index.pug
    └── layout.pug
~~~

Here we set the view engine to `Pug` and the name of our app to `hack-app`.  You can read more about the Pug template engine here: https://pugjs.org/api/getting-started.html.  Essentially this is a way for us to dynamically render our HTML front-end views.  

Now cd into your app and run `npm install`.  This installs the dependencies that express-generator has kindly provided us in `package.json`.  This includes packages like `express` itself, `body parser`, and other commonly used packages in a node app.

~~~
cd hack-app
npm install
~~~

Once the dependencies finish installing we can start our app with:
`npm start` 

Open a browser to `http://localhost:3000/` and yahtzee! We have our web application. 

Note: When making changes to your app you will have to restart the server with `Ctrl + C` and `npm start`.  Instead of doing this you can use the `nodemon` package which will automatically detect changes to your code and update the browser!  

Install with `npm install nodemon --save`
And run your app with `nodemon app.js`

### Express.js app structure 

In a short time we just used `express-generator` to flesh out our app, use `npm` to install dependencies and visit our app on local host.  Let's take a second to look at what we have so far.

`app.js` - We import express and create a new app with `express()` and establish our middleware and routes

`package.json` - Stores the dependencies for our application.  When we use `npm install <package> --save` this will automatically update.  Running `npm install` while in the directory of this file will automatically install and update any of the dependencies listed here.

`bin/www` - Here we start our app, attach some callbacks to server start and define a few enviroment variables.

`routes/` - We can create the root for routes with the `express.Router()` and then export them to be used in `app.js`

`views/` - Stores our views for `Pug`.  These pass variables that our app uses to the front-end, so we have a way around static HTML.

`public/` - This is where we can store any of our static HTML, JS, or CSS files.

### Setup our Database - MongoDB

Using `homebrew` install MongoDB locally.  

??? `brew get mongo` ???? 

Run `brew update`  to update MongoDB.  Now, create a database directory which is where Mongo data files are stored.

`mkdir -p /data/db`

Finally ensure that this dir has the right permissions by running

`sudo chown -R id -un /data/db`

Kick off mongo db by running the Mongo daemon:

`mongod`

In another terminal run the Mongo shell:

`mongo` 

You should be prompted with a welcome message and some information about the mongo server.  You can exit out of the mongo shell with `quit()` and stop the mongo daemon with `ctrl-c`.

Let's quickly flesh out a database to use with our app.

`show dbs` will tell us all of our available databases.

Create database:
`use hackdb`

Note that your db will not appear with `show dbs` until it is populated.

### Use Mongoose to build out a connection to our database

Mongoose makes connecting and building schemas, models, and other data structures for our database easy.

`npm install mongoose` 

Modify the existing apps structure to include a directory for our database
~~~

├── db
│   ├── models
│   │   ├──blog.js
│   └── mongo.js
~~~

`mongo.js` - will create and resuse the same connection to the mongo db.
`blog.js`  - this will hold an example of a data structure called a Schema which will model after a blog in this case.

`mongo.js`
~~~
const mongoose = require('mongoose')
      mongoose.promise = global.promise

// const server   = '127.0.0.1:27017'
// in the case of docker we can use the mongo service name that we specify 
const database = 'hackdb'

function Database() {
	this._connect = function() {
		mongoose.connect(`mongodb://mongodb/${database}`)
				.then(() => console.log('Connection succesful'))
				.catch(err => console.error('Unable to connect to DB. Msg: ' + err))
	}
}

module.exports = new Database()
~~~

First we use node's `require()` statement to import the mongoose package.
The database function is a `constructor` who has one function `_connect`.  This uses mongoose to attempt a connection at the specified url and if the `promise` to make a connection is fulfilled we will output that the connection is succesfully to the console.  Otherwise, on failure, we can log out an error message to help us determine what went wrong.

More on ES6's promises can be found here: 

`blog.js`

~~~
const mongoose = require('mongoose')

let blogSchema = new mongoose.Schema({
  blog: String,
  num: Number
})

module.exports = mongoose.model('Blog', blogSchema)
~~~

Again we important mongoose's package, this time creating a Schema. We can define the value's `Type` that we expect to be given for that `Schema`.

Now that we have this in place, lets set up our app so when we hit an endpoint, `/db` it will automatically insert a record into our database for us.  We define the creation of new endpoints in our `routes`.

~~~
├── routes
│   ├── db.js
│   ├── index.js
│   └── users.js

~~~

`db.js`

~~~
var express = require('express');
var router = express.Router();
var db = require('../db/mongo.js');


router.get('/', function(req, res, next){
	db._connect()

	let BlogModel = require('../db/models/blog')
	let msg = new BlogModel({
  		blog: 'My First Blog',
  		num: Math.random()
	})

	msg.save()
   	   .then(doc => {
        	console.log(doc)
   		})
   		.catch(err => {
     		console.error(err)
   		})

	res.send('db connection: ' + msg.blog)
	//res.render('db', {VARS})
})


module.exports = router
~~~

We import express to create a new `Router` as well as the connection we fleshed out in `db.js`.  You might notice the we are defining our route path as `/` and not `/db` like we want.  Don't worry, once we export our router we can mount this to the appropriate path in `app.js`.

We create a new entry based off the schema that we already defined, passing a `String` and `Number` to our values respectively. 

Lastly we `save()` our message and since this is a `promise`, we can chain our `then()` and `catch()` methods to handle the response of the `promise`.

That is it!  Save our code, restart our server and navigate to `https://localhost:3000/db` and check the mongod service and we should see our entry listed in the console! 

### Add the Datadog trace agent to the mix (MACOSX)

MACOSX needs to install the agent manually (requires GO)
Instructions here https://github.com/DataDog/datadog-trace-agent

Be sure to enable the option in the datadog config file:

~~~
apm enabled: 
    - true
~~~ 

For the purpose of this tutorial we are going to let Datadog automatically instrument our applications code.  This is super simple as it has prebuilt functionally with `express` and `mongodb`.  All we need to do is append 

`const tracer = require('dd-trace').init()`

To the top of `bin/www` as this needs to be imported before any other package.  Now, just to make sure we have traces to send, you can repeatedly hit refresh while at localhost:3000/db (spam that refresh button).  Open up the Datadog UI and go APM > Trace search and your traces will appear! 

Woof! 

### Containerizing is a lifestyle 

DOCKER NETWORK

https://docs.docker.com/compose/networking/

By default Compose sets up a single network for your app. Each container for a service joins the default network and is both reachable by other containers on that network, and discoverable by them at a hostname identical to the container name.

So this means that we dont have to create our own network from the instructions here which use docker run: https://docs.datadoghq.com/tracing/setup/docker/?tab=nodejs#docker-network





