Check In
========

Check In is a small [Sinatra](http://www.sinatrarb.com/) app that was developed for [Echo Conference](http://www.echoconference.com). It's a simple mobile web app that can be used to check in people at an event.  With the ability to be used by multiple people at once and by anyone with an iOS or Android device, it's a great replacement for paper lists and highlighters.

Development
-----------

You're welcome to deploy the app as-is, though you'll at least want to alter the [More](https://github.com/molawson/checkin/blob/master/views/more.erb) page, since it currently contains the schedule and maps for Echo Conference.

I'd also welcome any ideas for improvement.  Feel free to fork this repository and send me a pull request.

If you're going to be doing local development, you will need to make sure that you set a few environment variables when you start the app.  Depending on what you're using to run the app (i.e. a plain ruby process, the [shotgun](https://github.com/rtomayko/shotgun) gem, etc.), you can start the app like this:

    ADMIN_USERNAME=admin ADMIN_PASSWORD=password DATABASE_URL=postgres://db_username:db_password@localhost/db_name ruby application.rb

Usage
-----

The easiest way to use Check In for your own event is to deploy it to [Heroku](http://www.heroku.com).  The best part is that most events won't need anything above their **free** plan. With a few, simple commands, you can be up and running in a couple of minutes.

### Deploy to Heroku

The following instructions assume that you've setup an account with Heroku, installed the necessary gem(s), and have at least a little familiarity with git and the command line.  If you need more help with getting setup on Heroku, take a look at their [Dev Center](http://devcenter.heroku.com/).

Open up your favorite command line interface, and in the directory of your choice, run these commands:

    git clone git@github.com:molawson/checkin.git
    cd checkin
    heroku create --stack bamboo-ree-1.8.7
    git push heroku master

You need to add 2 config variables to your app on Heroku for authentication.

    heroku config:add ADMIN_USERNAME=your_username ADMIN_PASSWORD=your_password

### Import Guests

To launch the app from the command line, you can just type `heroku open`.

When visiting your deployed version of the app from a desktop browser, you'll be redirected to the Import page.  There, you'll find instructions for uploading a CSV file of your guest list, which will be used to populate the database.  

After you've successfully imported your guests into the database, take a look at your app in the web browser on your iOS or Android device. You should be all setup and ready to use the app.

If, at any point, you need to reset your database, Heroku makes that pretty simple, as well.  Unless you've changed something in your configuration, you can type the command exactly as it reads below.

    heroku db:reset DATABASE

Notes
-----

Because the app uses touch events rather than clicks for interaction, you'll only be able to access the full app from a mobile browser.

The app currently will not work with Ruby 1.9.2, so please make sure you're running on 1.8.7 (if you've followed the instructions for Heroku above, you're all set there).  If you need to install multiple rubies on your development machine, I've found [RVM](https://rvm.beginrescueend.com/) to be pretty awesome. That being said, I am planning on adding 1.9.2 support soon.

If you have any questions, feel free to message me on Github.