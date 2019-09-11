// Allows us to use our .env file locally
require( 'dotenv' ).config();

// Dependencies
const express = require( 'express' );
const next = require( 'next' );
const passport = require( 'passport');
const Strategy = require( 'passport-twitter' ).Strategy;
const connect = require( 'connect-ensure-login' );
const expressReactViews = require( 'express-react-views' )
const expressSession = require( 'express-session' );

// Default Setup
const dev = process.env.NODE_ENV !== 'production';
const app = next( { dev } );
const handler = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare()
    .then( () => {
        const server = express();
        var trustProxy = false;
        if (process.env.DYNO) {
            // Apps on heroku are behind a trusted proxy
            trustProxy = true;
        }

        // Configure view engine to render our React components.
        server.set( 'views', __dirname + '/pages' );
        server.set( 'view engine', 'js' );
        server.engine( 'js', expressReactViews.createEngine() );
        server.use( expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

        // Configure the Twitter strategy for use by Passport.
        //
        // OAuth 1.0-based strategies require a `verify` function which receives the
        // credentials (`token` and `tokenSecret`) for accessing the Twitter API on the
        // user's behalf, along with the user's profile.  The function must invoke `cb`
        // with a user object, which will be set at `req.user` in route handlers after
        // authentication.
        passport.use(
            new Strategy(
                {
                    consumerKey: process.env.TWITTER_CONSUMER_KEY,
                    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
                    callbackURL: '/auth/twitter/callback',
                    proxy: trustProxy
                },
                function( token, tokenSecret, profile, callback ) {
                    // In this example, the user's Twitter profile is supplied as the user
                    // record.  In a production-quality application, the Twitter profile should
                    // be associated with a user record in the application's database, which
                    // allows for account linking and authentication with other identity
                    // providers.
                    return callback( null, profile );
                }
            )
        );

        // Configure Passport authenticated session persistence.
        //
        // In order to restore authentication state across HTTP requests, Passport needs
        // to serialize users into and deserialize users out of the session.  In a
        // production-quality application, this would typically be as simple as
        // supplying the user ID when serializing, and querying the user record by ID
        // from the database when deserializing.  However, due to the fact that this
        // example does not have a database, the complete Twitter profile is serialized
        // and deserialized.
        passport.serializeUser( function( user, callback ) {
            callback( null, user );
        } );

        passport.deserializeUser( function( obj, callback ) {
            callback( null, obj );
        } );

        // Initialize Passport and restore authentication state, if any, from the session.
        server.use( passport.initialize() );
        server.use( passport.session() );

        // Define routes.
        server.get( '/', function( request, response ) {
            response.render( 'index', { user: request.user } );
        });

        server.get( '/login', function( request, response ) {
            console.log( 'Headers:' );
            console.log( JSON.stringify( request.user ) );
            response.render( 'login' );
        });

        server.get( '/login/twitter', passport.authenticate( 'twitter' ) );

        server.get( '/auth/twitter/callback', passport.authenticate( 'twitter', { failureRedirect: '/login' } ), 
            function( request, response ) {
                response.redirect('/');
            }
        );

        server.get( '/profile', connect.ensureLoggedIn(), function( request, response ) {
            response.render( 'profile', { user: req.user } );
        } );

        server.get( '/logout', function( request, response ) {
            req.session.destroy(function( error ) {
                response.redirect( '/' );
            } );
        } );

        server.get( '/api/test', ( request, response ) => {
            var data = {
                message: `You've got mail!`,
                success: true,
            };

            response.end( JSON.stringify( data) );
        } );

        // Catch all endpoint needs to near the bottom to handle any
        // pages we don't support
        server.get( "*", ( request, response ) => {
            return handler( request, response );
        } );

        server.listen( port, error => {
            if ( error ) throw error;

            console.log( `> Ready on http://localhost:${port}` );
        } );
    } )
    .catch( exception => {
        console.error( exception.stack );
        process.exit( 1 );
    } );
