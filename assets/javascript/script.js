$(document).ready(function() {
  var apiKey = "&appid=51d8d29d59553ece714298da2f3009a6"

  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("")

    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + apiKey,
      dataType: "json",
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").html("")

        // create html content for current weather
        var icon = data.weather.icon
        
        var cityName = $("<h2>").text(data.name + " " + "(" + moment().calendar("M, D, YYYY") + ")" + " " + $("<img>").attr("src", "http://openweathermap.org/img/wn/10d@2x.png"))
        var temp = $("<h5>").text("Temperature: " + (data.main.temp * 1.8 - 459.67).toFixed(2))
        var humid = $("<h5>").text("Humidity: " + data.main.humidity + "%")
        var windSpeed = $("<h5>").text("Wind Speed: " + data.wind.speed + " MPH")

        var carBody = $("<div>").addClass("card-body today")

        carBody.append(cityName, temp, humid, windSpeed)

        $("#today").append(carBody)

        // merge and add to page
        
        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + apiKey,
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("")
        var header = $("<h2>").text("5-Day Forecast:")
        $("#forecast").append(header)
        var time = 0
        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            time ++
            var day = $("<div>").addClass("card forecard bg-primary mr-4 p-2").attr("style", "width:10rem; float:left; color:white;")
            var date = $("<h5>").text(moment().add(time, 'days').calendar("M, D, YYYY"))
            var icon = data.list[i].weather.icon
            var iconPic = $("<img>").attr("src", "http://openweathermap.org/img/wn/10d@2x.png")
            var temp = $("<h5>"). text(((data.list[i].main.temp) * 1.8 - 459.67).toFixed(2));
            var humid = $("<h5>").text(data.list[i].main.humidity + "%");
            
            day.append(date, temp, humid);

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

        if (data.value > 6) {
          $(".btn-sm").addClass("btn-danger")
          console.log("red")
        } else{
          $(".btn-sm").addClass("btn-primary")
        }
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
