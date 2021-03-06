const express = require('express');
const axios = require('axios');
const fs = require("fs");
const app = express();
const port = 3000;

const latestPreVersion = 'pre-0.4';

app.get('/', (req, res) => {
  var back = {
    "Status": "OK",
    "Runtime-Mode": "Development",
    "Application-Author": "G_RCraft",
    "Application-Description":"G_Rcraft Public API.",
    "version": "1.0",
    "Application-Owner": "G_Rcraft"
  };
  res.send(back)
});

app.get('/version/latest/pre', (req, res) => {

  var response = {
    status: 200,
    versions: [
      {
        version: latestPreVersion,
        gameVersion: "1.17",
        changelog: "https://discord.com/channels/877241869522858014/877251064976527450/882920389137805324"
      },
      {
        version: latestPreVersion,
        gameVersion: "1.8",
        changelog: "https://discord.com/channels/877241869522858014/877251064976527450/882920389137805324"
      },
    ]
  }

  res.send(response);

});

app.get('/mods', (req, res) => {
  setTimeout(function() {
    res.send(
      {
        mods: [
          {
            title: "Coming soon!",
            author: ":)",
            description: "You will see some amazing mods here soon!",
            url: "http://foo.bar"
          }
        ]
      }
    ).end();
  }, 1000);
});

app.get('/version/download/:gameVersion/:version', (req, res) => {
  res.send(
    {
      url: `https://github.com/GersomR-afk/G_Rcraft_API/releases/download/${req.params.version}/${req.params.version}-${req.params.gameVersion}.zip`
    }
  )
});

app.get('/hat/:username', (req, res) => {
  var username = req.params.username;
  var uuid = "";
  // Get the UUID from the Mojang API
  axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
  .then(function (response) {

    // handle success
    if(response.status == 200) {
      uuid = response.data.id;
      console.log(`Checking UUID of: ${uuid}`);
      // API stuff happening here
      var path = `${__dirname}/assets/hats/${uuid}.png`;
      if(fs.existsSync(path)) {
        console.log(path);
        res.sendFile(path);
        res.status(200);
      }else {
        console.log("Couldn't find matching cape, cancelling request.");
        res.status(404);
        res.end();
      }
    }else {
      res.status(response.status);
      res.end();
    }

  });
});

app.get('/cape/:username', (req,res) => {
  var pref = req.query.pref;
  // Support for older versions.
  if(pref == null) {
    pref = "G_RCRAFT";
  }
  var username = req.params.username;
  var uuid = "";
  // Get the UUID from the Mojang API
  axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
  .then(function (response) {
    // handle success
    if(response.status == 200) {
      uuid = response.data.id;
      console.log(`Checking UUID of: ${uuid}`);
      // API stuff happening here
      var path = `${__dirname}/assets/capes/${uuid}.png`;
      if(fs.existsSync(path) && pref == "G_RCRAFT") {
        res.sendFile(path);
      }else {
        if(pref == "MOJANG") {
          axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
          .then(function(response) {
            if(response.status == 200) {
              var textures = JSON.parse(Buffer.from(response.data.properties[0].value, 'base64').toString('utf-8'));
              try {
                var cape = textures.textures.CAPE.url;
                res.redirect(cape).end(301);
              }catch(e) {
                console.log("No cape found.");
                res.status(404);
              }
            }
          });
        }else if(pref == "OPTIFINE") {
          var url = "http://s.optifine.net/capes/" + username + ".png";
          res.redirect(url).end(301);
        }else {
          console.log("Couldn't find matching cape, checking with Mojang.");
          axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
          .then(function(response) {
            if(response.status == 200) {
              var textures = JSON.parse(Buffer.from(response.data.properties[0].value, 'base64').toString('utf-8'));
              try {
                var cape = textures.textures.CAPE.url;
              }catch(e) {
                console.log("Couldn't find matching cape, redirecting to Optifine instead.");
                var url = "http://s.optifine.net/capes/" + username + ".png";
                res.redirect(url).end(301);
              }
              if(cape != null) {
                console.log("Cape found! Redirecting...");
                res.redirect(cape).end(301);
              }else {
                console.log("Couldn't find matching cape, redirecting to Optifine instead.");
                var url = "http://s.optifine.net/capes/" + username + ".png";
                res.redirect(url).end(301);
              }
            }
          });
        }
      }
    }else {
      res.status(response.status);
      res.end();
    }
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });
});

app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));