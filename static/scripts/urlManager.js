var currentChart = null;

function addButtonListeners (url) {

    $("#shortLink" + url.shortUrl).text(window.location.origin + "/" + url.shortUrl);

    $("#open" + url.shortUrl).click(() => {
        window.open(url.longUrl);
    });

    $("#delete" + url.shortUrl).click(() => {
        $.ajax({
            url: "/api/deleteUrl",
            method: "POST",
            data: {
                shortUrl: url.shortUrl
            }
        }).done((data) => {
            if (data.message == "OK") {
                document.location.reload();
            }
        });
    });

    $("#showDetailedStats" + url.shortUrl).click(() => {
        showDetailedStats(url);
    });

}

function addExtensionButtonListeners (url) {

    $("#open" + url.shortUrl).click(() => {
        window.open(url.longUrl);
    });

    $("#delete" + url.shortUrl).click(() => {
        $.ajax({
            url: "/api/deleteUrl",
            method: "POST",
            data: {
                shortUrl: url.shortUrl
            }
        }).done((data) => {
            if (data.message == "OK") {
                document.location.reload();
            }
        });
    });

    $("#copy" + url.shortUrl).click(() => {
        var $temp = $("<input>");
        $("body").append($temp);

        $temp.val(url.longUrl).select();
        document.execCommand("copy");

        $temp.remove();
    });

    $("#stats" + url.shortUrl).click(() => {
        window.open("user/usercontrol");
    });

}

function showDetailedStats(url) {
    showChart(Object.keys(url.clickTime), Object.values(url.clickTime));
    $("#currentDetailedStats").text(window.location.origin + "/" + url.shortUrl);
    $("#totalClicks").text(url.clicks);
}

function showChart(labels, data) {

    if (currentChart != null) {
        currentChart.destroy();
        currentChart = null;
    }

    currentChart = new Chart(document.getElementById('chart').getContext('2d'), {
        type: 'line',
        data: {
            datasets: [{
                label: 'Clicks',
                data: data
            }],
            labels: labels
        },
        options: {
            scales: {
                y: {
                    suggestedMin: 10,
                    suggestedMax: 50
                }
            }
        }
    });
}