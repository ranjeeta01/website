NottsDotNet.ViewModels.EventsSummaryViewModel = function(limit, fetchPastEvents) {
	var self = this;

	self.delegate = {
		initialFetchCompleted: function() { }
	};

	self.events = ko.observableArray();

	self.hasNoUpcomingEvents = ko.observable(false);
    
    self.pastEvents = ko.observableArray();

	var _fetchEvents = function() {
		$.ajax({
			type: "GET",
			url: "https://dotnetnotts-api.azurewebsites.net/api/events/next"
		})
		.done(function(response) {
			if (!response.results || response.results.length == 0) {
				self.hasNoUpcomingEvents(true);
				self.delegate.initialFetchCompleted();
			} else {
				var upcomingEvents = _.first(response.results, limit);
            	fixUpEventImages(upcomingEvents);
				self.events(upcomingEvents);
				self.delegate.initialFetchCompleted();
			}
			if (fetchPastEvents) _fetchPastEvents();
		});
	};
    
    var _fetchPastEvents = function () {
        $.ajax({
			type: "GET",
			url: "https://dotnetnotts-api.azurewebsites.net/api/events"
		}).done(function(response) {
            var pastEvents = response.results.sort(function (a,b) { 
                if (a.time < b.time) return 1;
                if (b.time < a.time) return -1;
                return 0;
            });
            
            fixUpEventImages(pastEvents);
            
            self.pastEvents(response.results);
        });
    };

	(function init() {
		_fetchEvents();
	})();
    
    function fixUpEventImages(events) {
        _.forEach(events, function (e) {
            var desc = stripHtml(e.description);
            var avatar = "assets/img/speakers/";
            var twitterHandle = undefined;
            e.avatar = "assets/img/dotnetnotts-avatar-circle.png";
            var parts = desc.split("Twitter @");

            if (parts.length > 1) {
                twitterHandle = parts[1].split(" ")[0];           
            }
            
            if (twitterHandle) {
                e.avatar = avatar + twitterHandle.replace(/\s+/, "")  + ".png";
            }

			e.avatar = e.avatar.toLowerCase();
        });
    }
    
    function stripHtml(html) {
       var tmp = document.createElement("DIV");
       tmp.innerHTML = html;
       return tmp.textContent || tmp.innerText || "";
    }
}