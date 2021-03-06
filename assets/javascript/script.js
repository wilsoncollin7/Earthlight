$(document).ready(function() {
  const apiKey = "&appid=51d8d29d59553ece714298da2f3009a6"

  $("#search-button").on("click", function() {
    event.preventDefault();
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("")

    searchWeather(searchValue);
  });

  $(".history").on("click", "a", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var a = $("<a>").addClass("dropdown-item").attr("href", "#").text(text);
    $(".history").prepend(a);
  }

  var today = new Date();  
  var day = today.getDay(); 
  const daylist = ["Sunday","Monday","Tuesday","Wednesday ","Thursday","Friday","Saturday"];

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + apiKey,
      dataType: "json",
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("weatherHistory", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").html("")

        // create html content for current weather
        var icon = data.weather[0].icon
        var img = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + icon + "@2x.png")
        var cityName = $("<h2>").text(data.name + " ");
        var todayDay = $("<h2>").text(daylist[day]);
        // cityName.append(img)
        var temp = $("<h5>").text("Temperature: " + (data.main.temp * 1.8 - 459.67).toFixed() + " F")
        var humid = $("<h5>").text("Humidity: " + data.main.humidity + "%")
        var windSpeed = $("<h5>").text("Wind Speed: " + data.wind.speed + " MPH")

        var carBody = $("<div>").addClass("card-body today")

        carBody.append(cityName, todayDay, img, temp, humid, windSpeed)

        $("#today").append(carBody)

        // merge and add to page
        
        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
        getMap(data.coord.lat, data.coord.lon);
      }
    });
  }

  function getMap(lat, lon) {
    let map;
    let myMapType;
    const script = $("<script>").attr("src", "https://maps.googleapis.com/maps/api/js?key=AIzaSyDwjr75wpVbrqdqfwE_Gb41DcE3T8s04wM&callback=initMap&libraries=&v=weekly&map_ids=e9ec3bf73070e70b");
    script.defer = true;
    $("#head").append(script);

    window.initMap = function() {
      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: lat, lng: lon },
        zoom: 8,
        mapId: 'e9ec3bf73070e70b',
        mapTypeId: google.maps.MapTypeId.TERRAIN
      });
  
      myMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
          return "https://tile.openweathermap.org/map/precipitation/" + zoom + "/" + coord.x + "/" + coord.y + ".png?appid=51d8d29d59553ece714298da2f3009a6";
        },
        tileSize: new google.maps.Size(256, 256),
        maxZoom: 9,
        minZoom: 0,
        name: 'mymaptype'
      });
      map.overlayMapTypes.insertAt(0, myMapType);
    };
  };
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + apiKey,
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("")
        var time = 0
        var foreDay = today.getDay();
        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            foreDay++
            time ++
            if(foreDay === daylist.length) {
              foreDay = 0
            }
            var icon = data.list[i].weather[0].icon
            var img = $("<img>").addClass("weatherIcon").attr("src", "http://openweathermap.org/img/wn/" + icon + "@2x.png")
            var day = $("<div>").addClass("card forecard mr-4 p-2 shadow")
            var dayName = $("<h5>").text(daylist[foreDay])
            var date = $("<h5>").text(moment().add(time, 'days').format('l'))
            var temp = $("<h5>"). text(((data.list[i].main.temp) * 1.8 - 459.67).toFixed() + " F");
            var humid = $("<h5>").text(data.list[i].main.humidity + "%");
            
            day.append(dayName, date, img, temp, humid);

            $("#forecast").append(day)
            
            // merge together and put on page
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + apiKey,
      dataType: "json",
      success: function(data) {
        var uv = $("<h5>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        
        $(".today").append(uv.append(btn));

        if (data.value > 7) {
          $(".btn-sm").addClass("hot")
        } else{
          $(".btn-sm").addClass("cold")
        }
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("weatherHistory")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
