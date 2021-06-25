window.onscroll = function() {updateNavBar()};
window.addEventListener("resize", updateNavBar)

function updateNavBar() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100 || window.innerWidth < 1080) {
        document.getElementById("navHome").style.paddingTop = "10px";
        document.getElementById("navHome").style.color = "black";
        document.getElementById("navHome").style.paddingBottom = "10px";
        document.getElementById("navHome").style.boxShadow = "0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19)";
        document.getElementById("navHome").style.backgroundColor = "#0d0d0d";
    } else {
        document.getElementById("navHome").style.paddingTop = "20px";
        document.getElementById("navHome").style.paddingBottom = "20px";
        document.getElementById("navHome").style.backgroundColor = "transparent";
        document.getElementById("navHome").style.boxShadow = "";
    }
}

updateNavBar();