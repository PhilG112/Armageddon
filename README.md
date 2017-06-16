# Armageddon
Final project for General Assemly Wdi21 Sydney

## What is this?
Armageddon is an interactive data visualization using D3.js. It plots out meteorites based on their geolocation on an interactive map of the world. The data set used can be found on NASA's website [here](https://data.nasa.gov/Space-Science/Meteorite-Landings/gh4g-9sfh).

### Built With
- ASP.NET Core
- Entityframework
- C#
- D3.js
- Microsoft SQL server
- CSS3
- HTML5
- Hosted on Microsoft Azure
- Visual Studio
- ES6

### Run it on your machine
- Have Visual Studio
- Restore database back up in database folder (Microsoft SQL Server)
- Set your connection string in `appsettings.json` (you have to create this file yourself as mine has been omitted from this repo)
- If all else fails view it live [here](http://armageddon-ga.azurewebsites.net/)

### Bugs
- Orthographic map does not show meteorites correctly based on the roation of the globe.
- Meteories continue to load if clear meteorites button is clicked (have to wait until all meteories are loaded)
- Styling of controls are not finished

