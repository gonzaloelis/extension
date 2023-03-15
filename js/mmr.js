console.log("++++++++++++++++ MMR Auth Information... ++++++++++++++++++++++++");

var mmr_auth = setInterval(function () {
    if ($("#main-frame-error").length) {
        alert("Please Signin to http://mmr.manheim.com/")
        getMMR()
    } else if($("body pre").length) {
        var m_content = document.getElementsByTagName("pre")[0].innerText
        chrome.storage.sync.set({mmr: JSON.parse(m_content)}, async function() {
            alert("Saved MMR authentication successfully.")
            getMMR()
        })
    }
}, 1000);

function getMMR() {
    clearInterval(mmr_auth)
}