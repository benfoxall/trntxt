# trntxt

[![Build Status](https://travis-ci.org/danielthepope/trntxt.svg)](https://travis-ci.org/danielthepope/trntxt) [![Dependency Status](https://dependencyci.com/github/danielthepope/trntxt/badge)](https://dependencyci.com/github/danielthepope/trntxt)

![trntxt icon](trntxtheader.png)

Pronounced "train text" and currently live at [trntxt.uk](http://trntxt.uk), this is a GPRS-friendly UK train times web service.

*(Also lives at [traintext.uk](http://traintext.uk), but that's not as cool)*

Uses the [National Rail 'Darwin' API](https://lite.realtime.nationalrail.co.uk/OpenLDBWS/) to get departure times.

## Usage
trntxt currently gives departure times for a given station, optionally filtered by a calling station.

Stations can be input using either their 3-letter codes or by their names (without spaces). For example, 'bristolparkway', 'bristolp' and 'bpw' will all give times for Bristol Parkway.

### Examples
* [/pad](http://trntxt.uk/pad): Departure board for London Paddington
* [/swindon](http://trntxt.uk/swindon): Departure board for Swindon
* [/bth/cardiffcentral](http://trntxt.uk/bth/cardiffcentral): List of trains from Bath Spa that call at Cardiff Central

## Contributing
Thanks for helping out! Please feel free to fork this repo, make your changes then make a pull request.

If you want to run this program locally, you will need to register for a National Rail API key [here](http://www.nationalrail.co.uk/46391.aspx).

Once you have a key, paste it into `./config/config.js`; this file is generated based on the template `./config/config.example.js` at build-time.

*config/config.js should look like this*
```javascript
module.exports = {
	apiKey: 'your-api-key-here'
};
```

Install the required packages using `npm install` in the command line. You also need to install the gulp command line interface globally, if you haven't already done so: `npm install -g gulp-cli`

To run the server, just type `gulp`. The server runs, then restarts if any of the JavaScript files are changed.

### To do
There are still a few things I'd like to do with trntxt. Check out the [issues page](https://github.com/danielthepope/trntxt/issues) for things to do. If you want to tackle a particular issue, let me know first in a comment or on Twitter - I might be working on it already!

## Acknowledgements
There are a number of people I'd like to thank for helping me out throughout the development of this project. The [contributors](https://github.com/danielthepope/trntxt/graphs/contributors) page doesn't tell the whole story, so here we go.

- [Tom Lane](https://github.com/tomlane), for giving a talk about Open Rail Data, planting the seed for this idea;
- [Rikki Tooley](https://github.com/rikkit), for first suggesting the idea of dynamically generated app icons;
- [Alex Birch](https://github.com/Birch-san), who helped me set up a much better way of managing the configuration files, and who submitted the first pull request to this project. However I completely mullered the PR so he didn't appear on the contributors page (sorry!);
- [Marcus Noble](https://github.com/AverageMarcus), for solving an issue I had raised just a couple of hours before;
- My brother Kieran (who doesn't own a GitHub profile - yet), who was my guinea pig for much of my Android testing;
- [Jamie Greef](https://github.com/madjam002), for his enthusiasm and for the quote "It just works";
- [Tom Wright](https://github.com/ThomWright), who helped me set up Mocha so I can prove Jamie's statement;
- And to [Jeff Schomay](https://github.com/jschomay), who although didn't contribute to the project directly, he organised the first Bristol Hack Nights, giving us developers a sociable space for us to work on our projects.
