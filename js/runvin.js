console.log("++++++++++++++++ Start Finding VIN for Runvin... ++++++++++++++++++++++++");

var FIND_VIN_COUNTER = 0;
const MAX_FIND_SIZE = 10;

const mmr_refresh = "https://gapiprod.awsmlogic.manheim.com/oauth/refresh";
const mmr_url = "https://gapiprod.awsmlogic.manheim.com/gateway";
const mmr_accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NjkxNjEwOTIsImlzcyI6IkdBUEkiLCJ0b2tlbl90eXBlIjoic3RhbmRhcmQiLCJ1c2VybmFtZSI6InZlaGl4NDExIiwiZnVsbF9uYW1lIjoiQm9nZGFuIEthcm1hbiJ9.2yVC0tTSSb5XquK9WrtdDtIz7b9kyCPWlVSeuZogIao";
const mmr_token = "3rh5z2nq8uyj6cn3uwvex5ad";

// chrome.storage.sync.get(['mmr'], function(result) {
//     console.log('Value currently is ' + result.mmr);
//     if(result && result.mmr) {
//         // alert("MMR Exist")
//         mmr_accessToken = result.mmr.accessToken;
//         mmr_token = result.mmr.jwtToken
//         console.log(mmr_token, mmr_accessToken)
//     } else {
//         // alert("MMR NOT Exist, Please visit https://gapiprod.awsmlogic.manheim.com/oauth/refresh")
//         // chrome.tabs.create({ url: mmr_refresh, active:true });
//         // let queryOptions = { active: true, lastFocusedWindow: true };
//         // `tab` will either be a `tabs.Tab` instance or `undefined`.
//         // let tab = chrome.tabs.query({url: [mmr_refresh]});
//         // console.log('tab', tab)
//         // chrome.runtime.sendMessage({
//         //     from: "openMMRAuth",
//         //     data: mmr_refresh
//         // }, (response) => {
//         //     showTableforCarPart(response.data, area_key);
//         // });
//     }
// });

var find_vin = setInterval(function () {
    if (FIND_VIN_COUNTER < MAX_FIND_SIZE) {
        callFindingVIN();
    }
}, 1000);

function callFindingVIN() {
    var textContent = document.getElementsByTagName('body')[0].textContent;
    textContent = textContent.match(/\b(\w|')+\b/gim);
    if(textContent == null || textContent.length == 0) return;

    var possibleVins = [];
    textContent.forEach(function (word) {
        if (word.length === 17) {
            possibleVins.push(word);
        }
    });
    if(possibleVins == null || possibleVins.length == 0) return;

    var validVins = [];
    possibleVins.forEach(function (vin) {
        if(validateVin(vin)) {
            validVins.push(vin);
        }
    });

    if(validVins.length > 0 ) clearInterval(find_vin);
    else return;
    
    FIND_VIN_COUNTER++;
    console.log("validVins", FIND_VIN_COUNTER, validVins);
    validVins.forEach(function (vin) {
        replaceStringWithInlineElement(vin);
    });
}

function replaceStringWithInlineElement(vin) {
    /* get all contents of whatever element contains the vin (including textNodes) */
    var elementsThatContainVin = $('*:contains(' + vin + ')').contents();

    /* loop through all node elements (including textNodes) */
    elementsThatContainVin.each(function (i, item) {

        /* only proceed with element replacement if it is a textNode (nodeType === 3) */
        if (item.nodeType === 3) {

            /* if $(item).text() contains a string, play it safe and return */
            if (stringContainsUrl($(item).text())) {
                return;
            }

            if ($(item).text().indexOf(vin) > -1 && !$(item).closest('span').hasClass('fb_vin_replaced')) {
                var initialItemText = $(item).text(),
                    newElement = $('<span>'),
                    replacedItemText = initialItemText.replace(vin, getVinReplacedElement(vin));

                newElement.html(replacedItemText).css({
                    'margin': '0px',
                    'padding': '0px'
                });
                $(item).replaceWith(newElement);
            }
        }
    });
}

function stringContainsUrl(string) {
    return new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(string);
}


function getVinReplacedElement(vin) {
    return `<span class="fb_vin_replaced" style="background:none; display:inline; color:inherit; position:relative; white-space:nowrap; margin:0; padding:0;">
                <a class="click_vin_text_runvin" style="cursor:pointer; position:relative; z-index:2; color:#0c71c3;" data-vin="${vin.trim()}">
                    ${vin.trim()}
                </a>
                <span class="runvin_icon mouseenter_toggle_fastbook_options" data-vin="${vin.trim()}" style="position:relative; display:inline;">
                    <img height="15" width="15" style="position:relative;display:inline;margin-left:4px;margin-bottom:2px;vertical-align:middle;" src="${chrome.runtime.getURL('images/runvin_logo.png')}" />
                </span>
            </span>`;
}

chrome.runtime.onMessage.addListener((req, snd, res) => {
    if (req.status == "clickedVin") {
        showRunVin(req.vin);
        res("Found Vin");
    } else if (req == "errorVin") {
        alert("Not a VIN");
        res("Incorrect Vin");
    } else if (req == "noVin") {
        alert("Selection must have 17 characters");
        res("Error Vin");
    }
});

async function showRunVin(_vin) {
    if ($("#runvin-panel").length) {
        $("#r-vin").text(_vin);
        $("#r-search").click();
        $("#runvin-panel").show();
        return;
    }

    var runvinPanel = document.createElement('div');
    runvinPanel.setAttribute('id', 'runvin-panel');

    $('body').append(runvinPanel);

    await chrome.storage.sync.get(['runvin'], function(result) {
        console.log('Value currently is ' + result.runvin);
        if(result && result.runvin) {
            runvinPanel.innerHTML = `
                <button id="r-close"><img src="${chrome.runtime.getURL('images/btn_exit.png')}" /></button>
                <h2>RunVin</h2>
                <div class="run-search-group">
                    <input type="text" id="r-vin" value="${_vin}"/>
                    <input type="number" id="r-mile" />
                    <button id="r-search">SEARCH</button>
                    <p id="vin-error">VIN is not valid</p>
                </div>
                <div>
                    <table class="run-table">
                        <thead>
                            <th></th>
                            <th>Wholesale</th>
                            <th>Retail</th>
                        </thead>
                        <tbody>
                            <tr class="rt-kbb">
                                <td><strong>KBB</strong></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr class="rt-kbb-excellent">
                                <td>Excellent</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr class="rt-kbb-good">
                                <td>Good</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr class="rt-kbb-verygood">
                                <td>Very Good</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr class="rt-kbb-fair">
                                <td>Fair</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr class="rt-mmr">
                                <td><strong>MMR</strong></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr class="rt-mmr-above">
                                <td>Above</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr class="rt-mmr-average">
                                <td>Average</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr class="rt-mmr-below">
                                <td>Below</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            runvinPanel.innerHTML = `
                <button id="r-close"><img src="${chrome.runtime.getURL('images/btn_exit.png')}" /></button>
                <h2>RunVin</h2>
                <div class="run-login-group">
                    <div>
                        <p>Username</p>
                        <input type="text" name="username" id="rv-username" />
                    </div>
                    <div>
                        <p>Password</p>
                        <input type="password" name="password" id="rv-password" />
                    </div>
                    <label id="rv-login-err"></label>
                    <div>
                        <button id="rv-login">LOGIN</button>
                    </div>
                </div>`;
        }
    });


    $("#runvin-panel").show();
}

function initTable() {
    $(".run-table tbody td:not(:first-child)").text('');
}

function getMMRValues(_vin, _mile) {
    var _query = {
        requests:[
            {
                href: `https://api.manheim.com/valuations/vin/${_vin}?country=US&odometer=${_mile}&include=retail,historical,forecast`,
                bearer_token: mmr_accessToken
            }
        ]
    };

    $.ajax({
        type: 'GET',
        url: cors_url + "https://mmr.manheim.com/oauth/init",
        success: function(res){
            console.log(res);
        },
        error: function(err){
            console.log(err);
        }
    });

    return $.ajax({
        type: 'POST',
        url: cors_url + mmr_url,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + mmr_token
        },
        data: JSON.stringify(_query)
    });
};

$('body').on('click', '.click_vin_text_runvin', function () {
    showRunVin($(this).text().trim());
});

$('body').on('click', '.runvin_icon', function () {
    showRunVin($('.click_vin_text_runvin')[0].text.trim());
});

$('body').on('keyup', '#r-vin', async function () {
    if (validateVin($(this).val())) {
        $("#vin-error").hide();
    } else {
        $("#vin-error").show();
    }
});

$('body').on('click', '#r-search', async function () {
    r_vin = $("#r-vin").val();
    r_mile = $("#r-mile").val();

    if (!r_vin) {
        alert("Please input Vin code.");
        return;
    }
    if (!validateVin(r_vin)) {
        alert("Not a VIN. Please check Vin again.");
        return;
    }
    initTable();

    var kbb_values = await getInfosByVin(r_vin, r_mile, "97220");

    if (kbb_values && kbb_values.data && kbb_values.data.ymmt) {
        pricing = kbb_values.data.ymmt.pricing;
        $(".rt-kbb td:nth-child(2)").text("$ " + pricing.tradein.fair)
        $(".rt-kbb td:nth-child(3)").text("$ " + pricing.privateparty.excellent)

        $(".rt-kbb-excellent td:nth-child(2)").text("$ " + pricing.tradein.excellent)
        $(".rt-kbb-good td:nth-child(2)").text("$ " + pricing.tradein.good)
        $(".rt-kbb-verygood td:nth-child(2)").text("$ " + pricing.tradein.verygood)
        $(".rt-kbb-fair td:nth-child(2)").text("$ " + pricing.tradein.fair)

        $(".rt-kbb-excellent td:nth-child(3)").text("$ " + pricing.privateparty.excellent)
        $(".rt-kbb-good td:nth-child(3)").text("$ " + pricing.privateparty.good)
        $(".rt-kbb-verygood td:nth-child(3)").text("$ " + pricing.privateparty.verygood)
        $(".rt-kbb-fair td:nth-child(3)").text("$ " + pricing.privateparty.fair)
    }

    var mmr_values = await getMMRValues(r_vin, r_mile);

    if (mmr_values && mmr_values.responses && mmr_values.responses.length > 0 && 
        mmr_values.responses[0].body && mmr_values.responses[0].body.items && mmr_values.responses[0].body.items.length > 0) {
        pricing = mmr_values.responses[0].body.items[0];
        $(".rt-mmr td:nth-child(2)").text("$ " + pricing.adjustedPricing.wholesale.average)
        $(".rt-mmr td:nth-child(3)").text("$ " + pricing.adjustedPricing.retail.average)

        $(".rt-mmr-above td:nth-child(2)").text("$ " + pricing.wholesale.above)
        $(".rt-mmr-average td:nth-child(2)").text("$ " + pricing.wholesale.average)
        $(".rt-mmr-below td:nth-child(2)").text("$ " + pricing.wholesale.below)

        $(".rt-mmr-above td:nth-child(3)").text("$ " + pricing.retail.above)
        $(".rt-mmr-average td:nth-child(3)").text("$ " + pricing.retail.above)
        $(".rt-mmr-below td:nth-child(3)").text("$ " + pricing.retail.above)
    }
});

$('body').on('click', '#r-close', function () {
    $("#runvin-panel").hide();
});

$('body').on('click', '#rv-login', function () {
    $.ajax({
        type: 'POST',
        url: cors_url + "http://runvin.com/wp-json/wp/v2/rae/user/login",
        contentType: "application/x-www-form-urlencoded",
        data: "username="+$("#rv-username").val()+"&password="+$("#rv-password").val(),
        success: async function (response) {
            console.log(response.user);
            if(response.status == 200 && response.user && response.user.data) {
                $("#rv-login-err").text('');
                chrome.storage.sync.set({runvin: response.user.data.user_email}, async function() {
                    console.log('Value is set to runvin:', response.user.data.user_email);
                    var dataContent = `
                        <button id="r-close"><img src="${chrome.runtime.getURL('images/btn_exit.png')}" /></button>
                        <h2>RunVin</h2>
                        <div class="run-search-group">
                            <input type="text" id="r-vin" value="${$('.click_vin_text_runvin')[0].text.trim()}"/>
                            <input type="number" id="r-mile" />
                            <button id="r-search">SEARCH</button>
                            <p id="vin-error">VIN is not valid</p>
                        </div>
                        <div>
                            <table class="run-table">
                                <thead>
                                    <th></th>
                                    <th>Wholesale</th>
                                    <th>Retail</th>
                                </thead>
                                <tbody>
                                    <tr class="rt-kbb">
                                        <td><strong>KBB</strong></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr class="rt-kbb-excellent">
                                        <td>Excellent</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr class="rt-kbb-good">
                                        <td>Good</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr class="rt-kbb-verygood">
                                        <td>Very Good</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr class="rt-kbb-fair">
                                        <td>Fair</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr class="rt-mmr">
                                        <td><strong>MMR</strong></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr class="rt-mmr-above">
                                        <td>Above</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr class="rt-mmr-average">
                                        <td>Average</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr class="rt-mmr-below">
                                        <td>Below</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                    await $("#runvin-panel").empty().append(dataContent);
                    $("#r-search").click();
                });                  
            } else {
                $("#rv-login-err").text(response.message);
            }
        },
        error: function (xhr) {
            console.log("Runvin Login Error.");
            $("#rv-login-err").text(xhr.responseJSON.message);
        }
    });
});