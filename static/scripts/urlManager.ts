var currentCharts = [];

function addButtonListeners (url) {
    $("#open" + url.label).click(() => {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(url.domain + "/" + url.label).select();
        document.execCommand("copy");
        $temp.remove();
    });

    $("#delete" + url.label).click(() => {
        $.ajax({
            url: "/api/url/" + url.domain + "/" + url.label,
            method: "DELETE",
            data: {}
        }).done((data) => {
            if (data.message == "Ok") {
                document.location.reload();
            }
        });
    });

    $("#showDetailedStats" + url.label).click(() => {
        showDetailedStats(url);
    });

}

function showDetailedStats(url) {
    showChart(url, Object.keys(url.statistics.clicks), Object.values(url.statistics.clicks));
    $("#currentDetailedStats").text(window.location.origin + "/" + url.label);
    $("#totalClicks").text(url.statistics.totalClicks);
}

function showChart(url, labels, data) {

    if (currentCharts != []) {
        currentCharts.forEach(chart => chart.destroy());
        currentCharts = [];
    }

    //@ts-ignore
    currentCharts.push(new Chart(document.getElementById('clickChart').getContext('2d'), {
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
    }));

    //@ts-ignore
    currentCharts.push(new Chart(document.getElementById('osChart').getContext('2d'), {
        type: 'doughnut',
        responsive: true, scaleFontColor: "#FFFFFF",
        data: {
            datasets: [{
                label: 'Operation Systems',
                data: [
                    url.statistics.operationSystem.windows,
                    url.statistics.operationSystem.macos,
                    url.statistics.operationSystem.linux,
                    url.statistics.operationSystem.android,
                    url.statistics.operationSystem.ios,
                    url.statistics.operationSystem.other
                ],
                backgroundColor: [
                    'rgb(169,27,57)',
                    'rgb(255,245,51)',
                    'rgb(24,142,206)',
                    'rgb(3,77,16)',
                    'rgb(183,102,34)',
                    'rgb(94,94,94)'
                ],
            }],
            labels: [
                "Windows",
                "MacOS",
                "Linux",
                "Android",
                "iOS",
                "Other"
            ]
        },
        options: {
            scales: {
                y: {
                    suggestedMin: 5,
                    suggestedMax: 25
                }
            }
        }
    }));

    //@ts-ignore
    currentCharts.push(new Chart(document.getElementById('platformChart').getContext('2d'), {
        type: 'doughnut',
        responsive: true, scaleFontColor: "#FFFFFF",
        data: {
            datasets: [{
                label: 'Operation Systems',
                data: [
                    url.statistics.platforms.desktop,
                    url.statistics.platforms.mobile,
                    url.statistics.platforms.other,
                ],
                backgroundColor: [
                    'rgb(169,27,57)',
                    'rgb(255,245,51)',
                    'rgb(24,142,206)',
                ],
            }],
            labels: [
                "Desktop",
                "Mobile",
                "Others",
            ]
        },
        options: {
            scales: {
                y: {
                    suggestedMin: 5,
                    suggestedMax: 25
                }
            }
        }
    }));
}
