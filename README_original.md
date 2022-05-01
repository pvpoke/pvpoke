# PvPoke

[PvPoke.com](https://pvpoke.com) is a resource for Pokemon GO PvP that includes a battle simulator, rankings, and team building. The project’s goal is to provide tools and insights to help players build their teams, and foster the game’s community spirit by making all of the underlying code public. I hope this project can inspire new tools or benefit the existing ones that continue to enhance our enjoyment of the game.

This started as a passion project that went from “I wonder what this would look like quick” to “uh oh, people are going to actually see this.” Just so you know what you’re getting into.

## Installation

To begin, you’ll need:

1. Apache (the server, not the attack helicopter)
2. PHP (let’s say 5.6.3 or higher, I’m really not doing anything fancy here so you can probably go lower but I’m not sure PHP is something you want to play limbo with)

If you’re starting from scratch, recommend installing your flavor of [XAMPP](https://www.apachefriends.org/index.html) or [MAMP](https://www.mamp.info/en/). Make sure to install the Apache and PHP modules. Once installed:

1. Place the files within PvPoke’s `src` directory somewhere in your `htdocs` folder, preferably in its own subdirectory
2. Run XAMPP or MAMP (from the control panel or through the “start” executable)
3. In your browser, navigate to `localhost/{subdirectory}` and the site should run

If you are running the site in a subdirectory, you’ll need to edit the `modules/config.php` file and change the `$WEB_ROOT` variable declaration to:

`$WEB_ROOT = '/{subdirectory}/';`

Because we’re flexible like that.

If you haven’t already, you may need to change your Apache settings to allow .htaccess to modify incoming requests. If you’re using XAMPP, find the `apache/conf/httpd.config` file and change:

```
<Directory />
    AllowOverride None
    Require all denied
</Directory>
```

To the following:

```
<Directory />
    AllowOverride All
    Require all denied
</Directory>
```

You can also set this specifically for the project directory. You may need to restart the server afterward.

## Site Structure

It was about 10 minutes into development when I realized this project would be great in Angular, but that was unfortunately 5 minutes past the point I was willing to backtrack. So allow me to show you the result.

Here’s a rundown on how most of the pages operate:

1. Main PHP file generates base HTML. These PHP files contain HTML only, and have no inherent functionality. They import any necessary Javascript files. These are our views, so to speak.
2. `GameMaster.js` loads the `data/gamemaster.json` file, which contains all Pokemon and move data. This is our model.
3. Once the data is loaded, `GameMaster.js` calls an interface object from one of several script files in the `/js/interface` directory to initialize. This object does things like populate dropdowns with data, create event listeners, etc. These are kind of extensions of the view.
4. Once the interface receives a certain interaction, it’ll call on an object like `Battle.js` or `TeamRanker.js` to receive user input, process it along with the model data, and return results to be displayed by the interface. These files are like the controller.

It’s something just close enough to MVC that I get to pat myself on the back, but Javascript and encapsulation go together like spaghetti and other, worse spaghetti. If you’ve heard of spaghetti code, this is more like lasagna code—it’s got structure but might fall apart when you fork it.

## Generating Rankings

Rankings can be generated locally using the following steps:

1. In your browser, visit the `ranker.php` page.
2. Open the developer console. This is where you’ll see output.
3. Run the simulations. This may take a few minutes. The `ranker.php` page will generate rankings for every league and category, and save the JSON results to the `/data` directory.
4. If you want to generate overall rankings, visit the `rankersandbox.php` page.
5. For each league, click the Simulate button. This will load previously generated JSON, process it, and save overall rankings to the `/data/overall` directory.

Feel free to copy the `Ranker.js` or `RankerOverall.js` files and experiment with your own modifications or algorithms.

## Contributing

I’m excited to work and collaborate with everyone who wants to be a part of this project, big or small. After all, I’m just a Pokemon fan probably like many of you. In this section, I want to be clear about the vision and scope I have in mind for this project to properly set expectations about contributing code, what may or may not be accepted, etc.

### Time Commitment

My work on this project is strictly volunteer, and I have a limited number of hours I can dedicate to it during the week. This may mean some delays related to pull requests, issues reports, etc. I appreciate your understanding and patience! As necessary, I may look to partner with someone or multiple someones to help with any backlog.

You’re welcome to dedicate as much or as little time toward the project as you like, and contribute often or even just once. And if you have to step away for any reason, we’ll send the Beedrill swarm after thanking you for your contributions. It’s only fair.

### Development Cycle

This project operates on a two-week development cycle. I guess they’d be called “sprints” but sometimes an easy jog is nice, too. This development cycle looks like:

1. Identify and distribute tasks.
2. Develop, calling out any roadblocks along the way
3. Pull, merge, and review on staging site
4. Deploy on production site
5. Gather user and contributor feedback for next cycle

Some tasks may supersede this development cycle, such as fixes for critical issues or data and ranking updates for newly released Pokemon, moves, or mechanics. Some tasks, such as new tools or features, may also take longer than a single cycle. In this case, we’ll do our best to segment that task into individual milestones that can be completed in a two-week period.

### Examples

Here are examples of some things that would be appealing code contributions and readily fit within the development cycle:

* **Bug fixes.** Check out our active [issue tracker](https://github.com/pvpoke/pvpoke/issues) or if there’s an issue you’ve identified and have ideas for how to solve, let us know!
* **Data entry.** The Game Master file isn’t complete yet, so we’d greatly appreciate help adding game data.
* **Performance improvements.** The tool functions have more loops than a Knot Tying Convention, and if you can help them process more efficiently, you are better off doing that than going to the convention. I still tie my shoes in bunny ears.
* **Algorithm improvements.** Help us make our battle and ranking algorithms more accurate and representative of gameplay.
* **Minor code refactoring.** “It just works,” but maybe it could work just a bit better. Just kidding, the code’s perfect. But if you’d like to move things around in a way that makes more sense, go for it and share with us what you think.
* **Additions to existing features.** Maybe the battle simulator could use more options, or there is some more info that would be neat in the rankings. Additions to the tools we have are always welcome, though bear in mind that less is sometimes more.
* **New features that utilize existing data or interfaces.** Can you teach an old dog new tricks? New tools or features that build on top of the existing foundation would make for excellent contributions.

Meanwhile, here are some example items that would be out of scope or don’t align with the project vision at this time. If user or contributor feedback suggests otherwise we can certainly revisit them, but for now I’d like to steer clear of things like:

* **Third-party libraries, frameworks, or dependencies.** Some things are necessary, like seatbelts and salt on rice, but the simpler, the better. Weigh any functionality or performance benefit with the effort it would take to implement and maintain.
* **Platform or technology overhauls.** Could the site run better as a PolitodeJS 0.5.3 virtual machine webapp? How should I know, I’m the one throwing out technobabble. Anyway, let’s stick to what we’ve got and if something would provide a serious improvement, we can see.
* **User accounts.** This is a can of Wormadam that I’m not looking to open at this time. Before considering this, I would want a convincing set of features that wouldn’t be possible without it.
* **Non-responsive tools or pages.** Pokemon GO is a mobile game, so everything on the site should be built for mobile.

I appreciate your understanding if a request is rejected. A rejection doesn’t mean that your code or idea is bad, just that it might not fit the current project. I will likely be taking things slow at the start. If you have any thoughts or ideas, I’d be happy to discuss them prior to development so we can work out what might fit best!

And of course, you can always fork the project and develop whatever you’d like. Thanks for reading!

-Empoleon_Dynamite
