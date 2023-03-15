console.log("++++++++++++++++ copart extension is starting... ++++++++++++++++++++++++");

var find_vin_code = setInterval(function () {
    if (!$("#kbb_price_div").length && $("#vinDiv > span").length) {
        myMain();
    }
}, 1000);

var pricing = {};
var cor_vin = '';
var cor_mileage = '';
var cor_year = '';
var cor_zipcode = "97220";
var carpart_name = '';
const car_part_url = "https://car-part.com/cgi-bin/search.cgi/";
var data_1 = {
    userPart: "Hood",
    userDate: "2015",
    userDate2: "2015",
    userVIN: "3GCUKREC1FG310598",
    userModel: "Select Make/Model",
    userLocation: "USA",
    userPreference: "zip",
    userZip: "97220",
    userPage: 1,
    userInterchange: "None",
    userSearch: "int"
};
var data_2 = {
    userPart: "Grille",
    userDate: "2015",
    userDate2: "2015",
    userVIN: "3GCUKREC1FG310598",
    userLocation: "USA",
    userPreference: "zip",
    userZip: "97220",
    userPage: 1,
    userInterchange: "None",
    userSearch: "exact",
    vinSearch: 0,
    dbModel: "15.28.34.34",
    userInterchange: '',
    dummyVar: ''
};
var data_3 = {
    domain: "carparts.com",
    q: "",
    vehicle: {
        model: "",
        make: "",
        year: ""
    }
};

async function myMain(evt) {
    clearInterval(find_vin_code);
    console.log("++++++++++++++++ copart extension is working... ++++++++++++++++++++++++");
    /***********************************    get info    *********************************************/

    cor_vin = $("#vinDiv > span").text().trim();
    cor_mileage = $("span.odometer-value").parent().parent().attr('lot-data-if');
    cor_year = $("#lotDescriptionModal .vehicle-desc > .details > span").text();
    cor_zipcode = "97220";

    /***********************************    start show price    *********************************************/

    var lot_detail = document.getElementsByClassName("lot-details-information");
    var priceDiv = document.createElement('div');
    priceDiv.setAttribute('id', 'kbb_price_div');
    priceDiv.setAttribute('class', 'kbb_price_div_class');

    lot_detail[0].parentNode.insertBefore(priceDiv, lot_detail[0]);

    var historyDiv = document.createElement('div');
    historyDiv.setAttribute('id', 'history_div');
    historyDiv.setAttribute('class', 'history_div_class');

    $(historyDiv).insertAfter(priceDiv);

    historyDiv.innerHTML = `<h3 class="panel-heading">Trade History</h3>
        <div id="trade_history_div" class="panel-content">
            <div class="sale-table-head">
                <b class="py-2">Auction Date</b>
                <b class="py-2">Auction</b>
                <b class="py-2">Price</b>
                <b class="py-2">Status</b>
            </div>
            <div class="sale-table-content"></div>
        </div>`;
    
    if(validateVin(cor_vin)) {
        showTradeHistory();
    } else {
        console.log("Incorrect VIN!")
    }

    var salvage_detail = document.getElementById("bid-information-id");
    var salvageDiv = document.createElement("div");
    salvageDiv.setAttribute("id", "salvage_price_div");
    salvageDiv.setAttribute("class", "salvage_price_div_class panel");

    salvage_detail.insertBefore(salvageDiv, salvage_detail.firstChild);

    var carpartDiv = document.createElement("div");
    carpartDiv.setAttribute("class", "carpart_price_div_class panel");

    $(carpartDiv).insertAfter(salvage_detail.firstChild);

    carpartDiv.innerHTML = `<h3 class="panel-heading">Parts
            <span class="bold right" id="total_carpart_price">$0</span>
            <span class="bold right" id="labor_total"> Labor Total : </span>
        </h3>
        <div id="carpart_price_div"></div>`;

    var feeDiv = document.createElement("div");
    feeDiv.setAttribute("id", "fee_price_div");
    feeDiv.setAttribute("class", "fee_price_div_class panel");

    $(feeDiv).insertAfter(salvage_detail.firstChild);

    var salvage_percent_str = '';
    for (var i = 50; i <= 100; i++) {
        if (i == 65) {
            salvage_percent_str += '<option value="' + (i / 100) + '" selected>' + i + ' %</option>';
        } else {
            salvage_percent_str += '<option value="' + (i / 100) + '">' + i + ' %</option>';
        }
    }

    var car_values = await getInfosByVin(cor_vin, cor_mileage, cor_zipcode);
    if (car_values && car_values.data && car_values.data.ymmt) {
        data_3.vehicle.make = car_values.data.ymmt.make.name;
        data_3.vehicle.model = car_values.data.ymmt.model.name;
        data_3.vehicle.year = car_values.data.ymmt.year;

        pricing = car_values.data.ymmt.pricing;
        price = car_values.data.ymmt.pricing.tradein.good;
        priceDiv_content = `<div class="panel-heading">
                <h3 id="kbb_price_panel">
                    KBB 
                    <select id="price_type">
                        <option value="tradein" selected>Trade IN</option>
                        <option value="privateparty">Private Party</option>
                    </select> 
                    Condition
                    <span class="bold right one-click-select" id="lot-price">$${price}</span>
                    <select id="price_list">
                        <option value="excellent">Excellent</option>
                        <option value="verygood">Very Good</option>
                        <option value="good" selected>Good</option>
                        <option value="fair">Fair</option>
                    </select>
                </h3>
            </div>`;
        priceDiv.innerHTML = priceDiv_content;

        salvageDiv_content = `<div class="panel-heading">
            <h3 id="salvage_price_panel">KBB Price
                <span id="current_kbb_price">$` + price + `</span> 
                <select id="salvage_percent">` + salvage_percent_str + `</select> 
                <span class="bold right one-click-select" id="salvage-price">$` + (parseInt(price) * 0.65).toFixed(2) + `</span>
            </h3>
        </div>`;
        salvageDiv.innerHTML = salvageDiv_content;

    } else {
        priceDiv_content = '<div class="panel-heading">' +
            '<h3>KBB Clean Trade-In<span class="bold right one-click-select" id="lot-price">undefined</span></h3>' +
            '</div>' +
            '<div id="valuation-section" class="" style="display: none">' +
            '</div>';
        priceDiv.innerHTML = priceDiv_content;

        salvageDiv_content = `<div class="panel-heading">
            <h3 id="salvage_price_panel">KBB Price
                <span id="current_kbb_price">undefined</span> 
                <select id="salvage_percent">` + salvage_percent_str + `</select> 
                <span class="bold right one-click-select" id="salvage-price">undefined</span>
            </h3>
        </div>`;
        salvageDiv.innerHTML = salvageDiv_content;
    }

    var current_bid_price = $("span.bid-price").text().trim();
    if (!current_bid_price) {
        current_bid_price = 0;
    } else {
        current_bid_price = current_bid_price.substring(1, current_bid_price.length - 4).replaceAll(",", "");
        current_bid_price = parseFloat(current_bid_price);
    }

    feeDiv.innerHTML = `<div class="panel-heading">
            <h3 id="fee_price_panel">Bid: 
                <input type="number" min="0" name="bid_price" id="bid_price" value="` + current_bid_price + `" />
                <span class="bold right one-click-select" id="auction_fee_price">$` + getAuctionFee(current_bid_price) + `</span>
                <span class="bold right one-click-select" id="auction_fee"> Auction Fees: </span>
            </h3>
        </div>`;

    $("#price_list").on("change", function () {
        _type = $("#price_type").val();
        _current = $(this).val();
        $("#lot-price").text("$" + pricing[_type][_current]);
        $("#current_kbb_price").text("$" + pricing[_type][_current]);
        _solvage_percent = $("#salvage_percent").val();
        $("#salvage-price").text("$" + (parseInt(pricing[_type][_current]) * parseFloat(_solvage_percent)).toFixed(2));
    });

    $("#price_type").on("change", function () {
        _type = $(this).val();
        _current = $("#price_list").val();
        $("#lot-price").text("$" + pricing[_type][_current]);
        $("#current_kbb_price").text("$" + pricing[_type][_current]);
        _solvage_percent = $("#salvage_percent").val();
        $("#salvage-price").text("$" + (parseInt(pricing[_type][_current]) * parseFloat(_solvage_percent)).toFixed(2));
    });

    $("#salvage_percent").on("change", function () {
        _type = $("#price_type").val();
        _current = $("#price_list").val();
        _solvage_percent = $(this).val();
        $("#salvage-price").text("$" + (parseInt(pricing[_type][_current]) * parseFloat(_solvage_percent)).toFixed(2));
    });

    $("#bid_price").on("keyup", function () {
        _price = parseFloat($(this).val());
        $("#auction_fee_price").text("$" + getAuctionFee(_price));
    });

    /***********************************    end show price    *********************************************/

    /***********************************    start select sub item    *********************************************/

    var targetDiv = document.getElementById("engineSoundModal");

    var car_map_div = document.createElement("div");
    car_map_div.setAttribute("id", "car_map_div");
    car_map_div.setAttribute("class", "car_map_div_class");
    car_map_div.innerHTML = makeMap();

    var car_map_loading = document.createElement("div");
    car_map_loading.setAttribute("id", "car_map_loading");
    var loading_img = document.createElement("img");
    loading_img.setAttribute("src", chrome.runtime.getURL('images/loading.gif'));
    car_map_loading.append(loading_img);
    car_map_div.append(car_map_loading);
    $(car_map_loading).hide();

    targetDiv.parentNode.insertBefore(car_map_div, targetDiv.nextSibling);

    /***********************************    end select sub item    *********************************************/

    /***********************************    start table sub item    *********************************************/

    var parentTableDiv = document.getElementById("car_map_div");
    var car_part_Table = document.createElement('div');
    car_part_Table.setAttribute('id', 'car_part_table');
    car_part_Table.setAttribute('class', 'table table-responsive table table-striped m-0 car_part_table_class');
    // parentTableDiv.parentNode.insertBefore(car_part_Table, parentTableDiv);
    parentTableDiv.parentNode.insertBefore(car_part_Table, parentTableDiv.nextSibling);

    /***********************************    end table sub item    *********************************************/

    removeDuplicateClass();
}

async function showTradeHistory() {
    var sale_table_content = '';
    await $.ajax({
        type: 'GET',
        url: cors_url + "http://ec2-44-208-136-46.compute-1.amazonaws.com:5000/autohelperbot",
        contentType: "application/json",
        data: {
            vin: cor_vin
        },
        success: async function (response) {
            console.log(response.data);
            if (response.data.status) {
                response.data.result.forEach(function (obj) {
                    sale_table_content += `
                        <a href="${obj.href}" target="_blank">
                            <span class="py-2">${obj.date}</span>
                            <span class="py-2"><img loading="lazy" src="https://autohelperbot.com${obj.image}" alt="${obj.alt}" width="65px" height="25px"></span>
                            <span class="py-2">${obj.price}</span>
                            <span class="py-2">${obj.status.replaceAll('Open lot', '').trim()}</span>
                        </a>
                    `;
                });
                $(".sale-table-content").html(sale_table_content);
            } else {
                if (response.data.result == "Error") {
                    console.log("Autohelperbot-API Server Error!")
                } else {
                    await showTradeHistory();
                }
            }
        },
        error: function (xhr) {
            console.log("Carparts Server error.");
        }
    });
}

function getAuctionFee(bid) {
    var live_bid_fee = getLiveBidFee(bid);
    var gate_fee = 79;
    var secured_fee = getSecuredFee(bid);
    return (live_bid_fee + gate_fee + secured_fee).toFixed(2);
}

function getLiveBidFee(bid) {
    if (bid < 100) {
        return 0;
    } else if (bid > 99 && bid < 500) {
        return 39;
    } else if (bid > 499 && bid < 1000) {
        return 49;
    } else if (bid > 999 && bid < 1500) {
        return 69;
    } else if (bid > 1499 && bid < 2000) {
        return 79;
    } else if (bid > 1999 && bid < 4000) {
        return 89;
    } else if (bid > 3999 && bid < 6000) {
        return 99;
    } else if (bid > 5999 && bid < 8000) {
        return 119;
    } else {
        return 129;
    }
}

function getSecuredFee(bid) {
    if (bid < 100) {
        return 1;
    } else if (bid > 99 && bid < 200) {
        return 25;
    } else if (bid > 199 && bid < 300) {
        return 50;
    } else if (bid > 299 && bid < 400) {
        return 75;
    } else if (bid > 399 && bid < 500) {
        return 110;
    } else if (bid > 499 && bid < 550) {
        return 125;
    } else if (bid > 549 && bid < 600) {
        return 130;
    } else if (bid > 599 && bid < 700) {
        return 140;
    } else if (bid > 699 && bid < 800) {
        return 155;
    } else if (bid > 799 && bid < 900) {
        return 170;
    } else if (bid > 899 && bid < 1000) {
        return 185;
    } else if (bid > 999 && bid < 1200) {
        return 200;
    } else if (bid > 1199 && bid < 1300) {
        return 225;
    } else if (bid > 1299 && bid < 1400) {
        return 240;
    } else if (bid > 1399 && bid < 1500) {
        return 250;
    } else if (bid > 1499 && bid < 1600) {
        return 260;
    } else if (bid > 1599 && bid < 1700) {
        return 275;
    } else if (bid > 1699 && bid < 1800) {
        return 285;
    } else if (bid > 1799 && bid < 2000) {
        return 300;
    } else if (bid > 1999 && bid < 2400) {
        return 325;
    } else if (bid > 2399 && bid < 2500) {
        return 335;
    } else if (bid > 2499 && bid < 3000) {
        return 350;
    } else if (bid > 2999 && bid < 3500) {
        return 400;
    } else if (bid > 3499 && bid < 4000) {
        return 450;
    } else if (bid > 3999 && bid < 4500) {
        return 575;
    } else if (bid > 4499 && bid < 5000) {
        return 600;
    } else if (bid > 4999 && bid < 6000) {
        return 625;
    } else if (bid > 5999 && bid < 7500) {
        return 650;
    } else if (bid > 7499 && bid < 10000) {
        return 675;
    } else if (bid > 9999 && bid < 15000) {
        return 700;
    } else {
        return bid * 0.055;
    }
}

function removeDuplicateClass() {
    if ($(".kbb_price_div_class").length > 1)
        $(".kbb_price_div_class")[1].remove();
    if ($(".history_div_class").length > 1)
        $(".history_div_class")[1].remove();
    if ($(".salvage_price_div_class").length > 1)
        $(".salvage_price_div_class")[1].remove();
    if ($(".fee_price_div_class").length > 1)
        $(".fee_price_div_class")[1].remove();
    if ($(".car_map_div_class").length > 1)
        $(".car_map_div_class")[1].remove();
    if ($(".car_part_table_class").length > 1)
        $(".car_part_table_class")[1].remove();
    if ($(".carpart_price_div_class").length > 1)
        $(".carpart_price_div_class")[1].remove();
}

function getSelectedCarPartItem(key) {
    var item = {
        carpart: '',
        autohelper: {
            key: '',
            title: ''
        }
    };
    switch (key) {
        case "hood":
            item.carpart = "Hood";
            item.autohelper.title = "Hood";
            item.autohelper.key = "hood";
            break;
        case "bkwin": //checking
            item.carpart = "Back Glass";
            item.autohelper.title = "Back Glass";
            item.autohelper.key = "glass";
            break;
        case "drmrrh":
            item.carpart = "Mirror, Door";
            item.autohelper.title = "Right Door Mirror";
            item.autohelper.key = "right_door_mirror";
            break;
        case "drmrlh":
            item.carpart = "Mirror, Door";
            item.autohelper.title = "Left Door Mirror";
            item.autohelper.key = "left_door_mirror";
            break;
        case "fndrlh":
            item.carpart = "Fender";
            item.autohelper.title = "Left Fender";
            item.autohelper.key = "left_fender";
            break;
        case "fndrrh":
            item.carpart = "Fender";
            item.autohelper.title = "Right Fender";
            item.autohelper.key = "right_fender";
            break;
        case "frtbmp":
            item.carpart = "Front Bumper Cover";
            item.autohelper.title = "Bumper Cover";
            item.autohelper.key = "front_bumper";
            break;
        case "frdrlh": //checking
            item.carpart = "Front Door";
            item.autohelper.title = "Left Front Door";
            item.autohelper.key = "";
            break;
        case "frdrrh": //checking
            item.carpart = "Front Door";
            item.autohelper.title = "Right Front Door";
            item.autohelper.key = "";
            break;
        case "frdrglrh":
            item.carpart = "Front Door Glass";
            item.autohelper.title = "Right Front Door Glass";
            item.autohelper.key = "right_front_door_glass"
            break;
        case "frdrgllh":
            item.carpart = "Front Door Glass";
            item.autohelper.title = "Left Front Door Glass";
            item.autohelper.key = "left_front_door_glass"
            break;
        case "frdrharh":
            item.carpart = "Front Door Handle, Outside";
            item.autohelper.title = "Exterior Door Handle";
            item.autohelper.key = "right_exterior_front_door_handle";
            break;
        case "frdrhalh":
            item.carpart = "Front Door Handle, Outside";
            item.autohelper.title = "Exterior Door Handle";
            item.autohelper.key = "left_exterior_front_door_handle";
            break;
        case "grl":
            item.carpart = "Grille";
            item.autohelper.title = "Grille Assembly";
            item.autohelper.key = "grille";
            break;
        case "hdltlh":
            item.carpart = "Headlight Assembly";
            item.autohelper.title = "Headlight";
            item.autohelper.key = "left_headlight"
            break;
        case "hdltrh":
            item.carpart = "Headlight Assembly";
            item.autohelper.title = "Headlight";
            item.autohelper.key = "right_headlight"
            break;
        case "tlltrhin":
            item.carpart = "Tail Light";
            item.autohelper.title = "Tail Light";
            item.autohelper.key = "right_inside_taillight";
            break;
        case "tlltlhin":
            item.carpart = "Tail Light";
            item.autohelper.title = "Tail Light";
            item.autohelper.key = "left_inside_taillight";
            break;
        case "tlltrhou":
            item.carpart = "Tail Light";
            item.autohelper.title = "Tail Light";
            item.autohelper.key = "right_outside_taillight";
            break;
        case "tlltlhou":
            item.carpart = "Tail Light";
            item.autohelper.title = "Tail Light";
            item.autohelper.key = "left_outside_taillight";
            break;
        case "prklmprh":
            item.carpart = "Park/Fog Lamp Front";
            item.autohelper.title = "Parking Light";
            item.autohelper.key = "right_parking_light";
            break;
        case "prklmplh":
            item.carpart = "Park/Fog Lamp Front";
            item.autohelper.title = "Parking Light";
            item.autohelper.key = "leht_parking_light";
            break;
        case "qtrpanlh": //checking
            item.carpart = "Quarter Panel";
            item.autohelper.title = "Left Left Quarter Panel";
            item.autohelper.key = "right_quarter";
            break;
        case "qtrpanrh": //checking
            item.carpart = "Quarter Panel";
            item.autohelper.title = "Right Quarter Panel";
            item.autohelper.key = "left_quarter";
            break;
        case "rrbmp":
            item.carpart = "Rear Bumper Cover";
            item.autohelper.title = "Rear Bumper Cover";
            item.autohelper.key = "rear bumper";
            break;
        case "rrdrlh": //checking
            item.carpart = "Back Door (above rear bumper)";
            item.autohelper.title = "Left Back Door (above rear bumper)";
            item.autohelper.key = "left door";
            break;
        case "rrdrrh": //checking
            item.carpart = "Back Door (above rear bumper)";
            item.autohelper.title = "Right Back Door (above rear bumper)";
            item.autohelper.key = "right door";
            break;
        case "rrdrgllh": //checking
            item.carpart = "Back Door Glass";
            item.autohelper.title = "Left Back Door Glass";
            item.autohelper.key = "door glase";
            break;
        case "rrdrglrh": //checking
            item.carpart = "Back Door Glass";
            item.autohelper.title = "Right Back Door Glass";
            item.autohelper.key = "door glass";
            break;
        case "rrdrhalh":
            item.carpart = "Back Door Handle, Outside";
            item.autohelper.title = "Left Interior Door Handle";
            item.autohelper.key = "left interior door handle";
            break;
        case "rrdrharh":
            item.carpart = "Back Door Handle, Outside";
            item.autohelper.title = "Right Interior Door Handle";
            item.autohelper.key = "right interior door handle";
            break;
        case "roof": //checking
            item.carpart = "Roof";
            item.autohelper.title = "Roof";
            item.autohelper.key = "roof";
            break;
        case "rrspoil": //checking
            item.carpart = "Spoiler, Rear";
            item.autohelper.title = "Spoiler, Rear";
            item.autohelper.key = "spoiler";
            break;
        case "trnkld": //checking
            item.carpart = "Tailgate/Trunk Lid";
            item.autohelper.title = "Tailgate/Trunk Lid";
            item.autohelper.key = "trunk_lock_actuator"
            break;
        case "ventglrerlh":
            item.carpart = "Rear Door Vent Glass";
            item.autohelper.title = "Left Rear Door Vent Glass";
            item.autohelper.key = "left_vent_door_glass"
            break;
        case "ventglrerlh":
            item.carpart = "Rear Door Vent Glass";
            item.autohelper.title = "Right Rear Door Vent Glass";
            item.autohelper.key = "right_vent_door_glass"
            break;
        case "wndshd": //checking
            item.carpart = "Windshield";
            item.autohelper.title = "Windshield";
            item.autohelper.key = "wind glass";
            break;
        case "snrf": //checking
            item.carpart = "Sun Roof / T-Top";
            item.autohelper.title = "Sun Shade";
            item.autohelper.key = "sun";
            break;
        case "wipear":
            item.carpart = "Wiper Linkage";
            item.autohelper.title = "Wiper Blade";
            item.autohelper.key = "wiper";
            break;
            // case "whl":
            //     item.carpart = "Wheel";
            //     item.autohelper = "Wheel";
            //     break;
        default:
            item.carpart = '';
            item.autohelper.title = '';
            item.autohelper.key = '';
            break;
    }
    return item;
}

async function showTableforCarPart(result, area_key) {
    var dom_nodes = $($.parseHTML(result));
    if (dom_nodes.find('font > table').length > 2) {
        $('#car_part_table').append(dom_nodes.find('font > table')[1]);
        $('#car_part_table').show();
        $("#car_map_loading").hide();
    } else {
        var _dbmodel = dom_nodes.find('input[name="dbModel"]').val();
        var dummyVarmodel = dom_nodes.find('input[name=dummyVar]');

        if (_dbmodel && dummyVarmodel.length > 0) {
            for (var i = dummyVarmodel.length - 1; i >= 0; i--) {
                var _side = dom_nodes.find('label[for=' + $(dummyVarmodel[i]).attr('id') + ']').text().trim().slice(-2);
                console.log(_side);
                if (area_key.slice(-2) == _side.toLowerCase()) {
                    data_2.dummyVar = $(dummyVarmodel[i]).val();
                    data_2.userInterchange = $(dummyVarmodel[i]).val();
                    break;
                }
            }

            data_2.userDate = cor_year;
            data_2.userDate2 = cor_year;
            data_2.userVIN = cor_vin;
            data_2.userZip = cor_zipcode;
            data_2.userPart = data_1.userPart;
            data_2.dbModel = _dbmodel;
            await getCarPartList(data_2, area_key);
        } else {
            $("#car_map_loading").hide();
        }
    }
}

function showCarParts(result) {
    if ($("#carparts-table").length < 1) {
        var carpartsDiv = document.createElement("div");
        carpartsDiv.setAttribute("id", "carparts-table");
        carpartsDiv.setAttribute("class", "carparts_div_class");

        $(carpartsDiv).insertAfter($(".lot-information"));
    }
    // $("#carparts-table").hide();
    var car_content = '';
    if (result) {
        car_content = `<div class="panel"><h3 class="panel-heading">${carpart_name}</h3>
            <div class="carparts-list">`;
        for (const [key, item] of Object.entries(result)) {
            _img_url = item.image.replace('d_noimage.jpg', 'd_noimage.jpg,h_210,w_210,c_pad,f_auto,q_auto,dpr_auto,e_sharpen');
            var _item_content = `<div class="carparts-group col-md-6 col-lg-6 col-xs-6">
                <div class="c-image"><img src=${_img_url} ></div>
                <div class="c-brand"><span>${item.brand}</span><br/><span>${item.skuTitle}</span></div>
                <div class="c-sku">Part Number: <b>${item.sku}</b></div>`;
            if (Number(item.stock) > 0) {
                _item_content += `<div class="c-price">$${item.price}</div>
                <div class="c-gound">Get it by <b>${item.ground}</b></div></div>`;
            } else {
                _item_content += `<div class="c-price">$---.--</div>
                    <div class="c-gound"><b>Sold Out</b></div></div>`;
            }
            car_content += _item_content;
        }
        car_content += `</div></div>`;
    } else {
        car_content = `<div class="panel"><h3 class="panel-heading">${carpart_name}</h3>
            <div class="carparts-list" > <h5 style="padding: 0 10px;">No Result</h5> </div></div>`;
    }
    $("#carparts-table").html(car_content);
}

function getEstimatedDeliveryDates(send_data) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            from: "sendCarpartsDeliveryDates",
            data: send_data
        }, (response3) => {
            var result_3 = JSON.parse(response3.data);
            console.log("Result 333", result_3);
            resolve(result_3);
        });
    });
}

function getCarPartList(data, area_key) {
    console.log("111111111111111111111111111111111111111111111111111111111");
    chrome.runtime.sendMessage({
        from: "sendCopartReq",
        data: builFormData(data)
    }, (response) => {
        showTableforCarPart(response.data, area_key);
    });
    console.log("22222222222222222222222222222222222222222222222222222222");
    chrome.runtime.sendMessage({
        from: "sendCarpartsDetail",
        data: data_3
    }, (response1) => {
        var total_result = {};
        var result_1 = JSON.parse(response1.data);
        console.log("Result 111", result_1);
        if (result_1.data.products && result_1.data.products.productIds) {
            console.log("send Data 222", result_1.data.products.productIds);
            chrome.runtime.sendMessage({
                from: "sendCarpartsBatch",
                data: {
                    items: result_1.data.products.productIds
                }
            }, async (response2) => {
                var result_2 = JSON.parse(response2.data);
                console.log("Result 222", result_2);
                let _date = new Date();
                _date = _date.toISOString();

                var promises = [];

                result_2.data.forEach((obj) => {
                    console.log("**********************************************************************");
                    console.log(obj);
                    let detail = result_1.data.products.items.find(item => item.id == obj.productId);
                    var _total = {
                        productId: detail.id,
                        sku: detail.sku,
                        skuTitle: detail.skuTitle,
                        brand: detail.brand,
                        stock: obj.stock,
                        image: detail.productImageUrl,
                        price: detail.pricing.regularPrice
                    };
                    total_result[detail.sku] = _total;
                    console.log(detail);
                    var _send = {
                        'zip': 89119,
                        'buffereta': 0,
                        'methods': ['Ground'],
                        'exp': _date,
                        'sku': detail.sku,
                        'brand': detail.brand,
                        'qty': obj.stock > 0 ? obj.stock : 1
                    };
                    console.log(_send);
                    total_result[detail.sku] = _total;
                    promises.push(getEstimatedDeliveryDates(_send));
                });

                await Promise.all(promises).then((values) => {
                    values.forEach(val => total_result[val.data.sku]['ground'] = val.data.shippingOptions.Ground.split('T')[0]);
                }).catch(err => {
                    console.log("fail to get playlog and resource!", err);
                });

                console.log(total_result);
                showCarParts(total_result);
            });
        } else {
            showCarParts(null);
        }
    });
}

function builFormData(dataObject) {
    let formDataString = "";
    Object.entries(dataObject).forEach(([key, value]) => {
        formDataString += `${key}=${dataObject[key]}&`;
    });
    return formDataString;
}

function makeMap() {
    var car_map = `<div id="car_map">
                        <img height="225" width="358" src="` + chrome.runtime.getURL('images/alltogm.png') + `" usemap="#allm99c2cd" border="0">
                        <map name="allm99c2cd">
                            <area href="javascript:void(0);" coords="40,209,40,209,159,102,49,98,4,107,3,208" shape="polygon" alt="Front-Left">
                            <area href="javascript:void(0);" coords="275,215,275,215,173,107,71,219" shape="polygon" alt="Front">
                            <area href="javascript:void(0);" coords="136,79,136,79,125,26,3,36,2,94" shape="polygon" alt="Left Side">
                            <area href="javascript:void(0);" coords="173,62,173,62,134,56,132,4,223,7,216,50" shape="polygon" alt="back">
                            <area href="javascript:void(0);" coords="206,75,206,75,241,20,351,27,350,87" shape="polygon" alt="Right Side">
                            <area href="javascript:void(0);" coords="318,203,318,204,191,104,242,90,350,99,352,176" shape="polygon" alt="Front-Right">
                        </map>
                    </div>
                    <div id="car_part">
                        <a id="back-map-btn" href="javascript:void(0);">back</a>
                        <a href="javascript:void(0);" title="Roll Over Car" id="sub-img-group">
                            <img id="map-img" border="0" name="Roll Over Car" usemap="#carpartmap">
                            <img id="sub-itme-img" src="` + chrome.runtime.getURL('images/hood.jpg') + `" style="display: none;">
                        </a>
                        <map name="carpartmap">
                        </map>
                    </div>`;
    return car_map;
}

$('body').on('click', '#car_map area', function () {
    var direction = $(this).attr('alt');
    switch (direction) {
        case "Front-Left":
            $("#map-img").attr("width", "400");
            $("#map-img").attr("height", "230");
            $("#map-img").attr("src", chrome.runtime.getURL("images/frleft2.jpg"));
            $("#car_part map").html(`
                <area href="javascript:void(0);" coords="192,202,192,202,206,144,242,127,256,161,248,198,231,219,201,218" shape="polygon" title="" alt="Wheel" csover="4728301,4728302" csclick="47282F0" str="whl">
                <area href="javascript:void(0);" coords="362,71,362,71,358,61,370,52,373,66" shape="polygon" title="adsfadss" alt="Left Rear Door Handle" csover="4728304,4728305" csclick="4728303" str="rrdrhalh">
                <area href="javascript:void(0);" coords="319,92,319,92,317,79,329,70,329,86" shape="polygon" title="sdf" alt="Left Front Door Handle" csover="4728307,4728318" csclick="4728306" str="frdrhalh">
                <area href="javascript:void(0);" coords="330,53,330,53,312,13,337,13,365,45" shape="polygon" title="" alt="Left Rear Glass" csover="47283110,47283111" csclick="4728319" str="rrdrgllh">
                <area href="javascript:void(0);" coords="334,119,334,119,330,63,365,48,369,57,357,61,361,72,370,70,353,111" shape="polygon" title="" alt="Left Rear Door" csover="47283113,47283114" csclick="47283112" str="rrdrlh">
                <area href="javascript:void(0);" coords="275,53,275,53,286,20,310,12,325,60,304,68,296,57,295,57" shape="polygon" title="" alt="Left Front Door Glass" csover="47283116,47283117" csclick="47283115" str="frdrgllh">
                <area href="javascript:void(0);" coords="271,154,271,154,267,83,326,60,326,72,316,77,319,89,328,87,331,121" shape="polygon" title="" alt="Front Door Left" csover="47283219,47283220" csclick="47283218" str="frdrlh">
                <area href="javascript:void(0);" coords="365,127,365,127,356,108,370,76,383,86,377,114" shape="polygon" title="" alt="Wheel" csover="47283222" csclick="47283221" str="whl">
                <area href="javascript:void(0);" coords="378,69,378,69,370,41,338,13,343,9,375,31,391,34,396,69,391,82" shape="polygon" title="" alt="LH Quarter Panel" csover="47283224" csclick="47283223" str="qtrpanlh">
                <area href="javascript:void(0);" coords="221,70,221,70,257,71,276,20,182,16,133,48" shape="polygon" title="" alt="Windshield" csover="47283226,47283227" csclick="47283225" str="wndshd">
                <area href="javascript:void(0);" coords="121,62,121,62,172,76,213,75,168,59,125,54" shape="polygon" title="" alt="Wiper Arm" csover="47283329,47283330" csclick="47283328" str="wipear">
                <area href="javascript:void(0);" coords="196,158,196,158,136,172,76,167,74,154,66,154,61,166,10,154,8,140,8,173,84,209,146,212,186,199" shape="polygon" title="" alt="Front Bumper" csover="47283332,47283333" csclick="47283331" str="frtbmp">
                <area href="javascript:void(0);" coords="266,80,266,80,274,60,302,64,300,73" shape="polygon" title="" alt="Mirror- Door LH" csover="47283335,47283336" csclick="47283334" str="drmrlh">
                <area href="javascript:void(0);" coords="209,9,209,9,275,13,293,8,261,4" shape="polygon" title="" alt="Sun Roof" csover="47283438,47283439" csclick="47283337" str="snrf">
                <area href="javascript:void(0);" coords="129,163,129,163,138,141,162,136,181,134,174,154,152,163" shape="polygon" title="" alt="Park Lamp" csover="47283441,47283442" csclick="47283440" str="prklmplh">
                <area href="javascript:void(0);" coords="127,168,127,168,134,143,87,145,82,162" shape="polygon" title="" alt="Head Light" csover="47283444,47283445" csclick="47283443" str="hdltlh">
                <area href="javascript:void(0);" coords="60,159,60,159,67,145,20,131,18,144" shape="polygon" title="" alt="Grille" csover="47283447,47283448" csclick="47283446" str="grl">
                <area href="javascript:void(0);" coords="181,148,181,148,185,130,146,135,251,86,262,78,269,153,261,155,245,121,217,124,199,145" shape="polygon" title="" alt="Fender" csover="47283550,47283551" csclick="47283549" str="fndrlh">
                <area href="javascript:void(0);" coords="80,144,80,144,21,122,21,111,121,60,178,74,253,79,140,136" shape="polygon" title="" alt="Hood" csover="47283553,47283554" csclick="47283552" str="hood">`);
            break;
        case "Front":
            $("#map-img").attr("width", "300");
            $("#map-img").attr("height", "213");
            $("#map-img").attr("src", chrome.runtime.getURL("images/front2.jpg"));
            $("#car_part map").html(`
                <area href="javascript:void(0);" coords="211,121,211,122,217,100,223,101,221,118,286,110,289,140,279,157,147,169,27,159,19,121,23,111,94,122,90,99,96,99,105,122" shape="polygon" title="" alt="Front Bumper" csover="537261120,537261121" csclick="537261119" str="frtbmp">
                <area href="javascript:void(0);" coords="68,54,68,54,98,39,130,47,161,36,217,47" shape="polygon" title="" alt="Wiper Arm" csover="537261123,537262124" csclick="537261122" str="wipear">
                <area href="javascript:void(0);" coords="72,41,72,41,96,10,205,11,232,46,168,37" shape="polygon" title="" alt="Windshield" csover="537262126" csclick="537262125" str="wndshd" >
                <area href="javascript:void(0);" coords="57,56,57,56,43,52,47,38,68,42" shape="polygon" title="" alt="Right Door Mirror" csover="537262128,537262129" csclick="537262127" str="drmrrh">
                <area href="javascript:void(0);" coords="244,55,244,55,234,41,259,41,257,53" shape="polygon" title="" alt="Left Door Mirror" csover="537262131,537262132" csclick="537262130" str="drmrlh" >
                <area href="javascript:void(0);" coords="272,82,271,82,236,55,64,54,32,82,85,94,225,95" shape="polygon" title="" alt="Hood Panel" csover="537262134,537263135" csclick="537262133" str="hood">
                <area href="javascript:void(0);" coords="39,102,39,102,39,85,30,84,22,101" shape="polygon" title="" alt="Right Park Lamp" csover="537263137,537263138" csclick="537263136" str="prklmprh" >
                <area href="javascript:void(0);" coords="268,106,268,106,269,85,278,82,284,104" shape="polygon" title="" alt="Left Park Lamp" csover="537263140,537263141" csclick="537263139" str="prklmplh" >
                <area href="javascript:void(0);" coords="87,108,87,108,79,92,37,85,37,104" shape="polygon" title="" alt="Right Head Light" csover="537263143,537263144" csclick="537263142" str="hdltrh">
                <area href="javascript:void(0);" coords="98,97,98,97,109,116,158,117,208,115,214,98" shape="polygon" title="" alt="Grille" csover="537264146,537264147" csclick="537264145" str="grl">
                <area href="javascript:void(0);" coords="223,111,222,111,228,97,267,88,266,106" shape="polygon" title="" alt="Left Head Light" csover="537264149,537264150" csclick="537264148" str="hdltlh">`);
            break;
        case "Left Side":
            $("#map-img").attr("width", "400");
            $("#map-img").attr("height", "154");
            $("#map-img").attr("src", chrome.runtime.getURL("images/lftside.jpg"));
            $("#car_part map").html(`
                <area href="javascript:void(0);" coords="290,19,290,19,295,46,325,44" shape="polygon" alt="Vent Glass, Rear LH" csclick="4F0F3376" csover="4F089A14,4F0B7AD5" str="ventglrerlh">
                <area href="javascript:void(0);" coords="245,49,245,50,248,16,286,18,294,47" shape="polygon" csclick="4EA16192" csover="4E926530,4E9ABD21" alt="Door Glass-Rear LH" str="rrdrglrh">
                <area href="javascript:void(0);" coords="380,50,393,63" shape="rect" title="" alt="Outer Left Taillight" csover="56720F321,56720F322" csclick="56720F320" str="tlltrhou">
                <area href="javascript:void(0);" coords="13,89,13,89,16,73,31,75,27,93" shape="polygon" title="" alt="Left Front Headlight" csover="56720F324,56720F325" csclick="56720F323" str="hdltrh">
                <area href="javascript:void(0);" coords="328,28,328,28,347,39,384,39,368,32" shape="polygon" title="" alt="Spoiler" csover="56720F327,56720F328" csclick="56720F326" str="rrspoil">
                <area href="javascript:void(0);" coords="201,16,201,16,171,7,286,7,293,13" shape="polygon" title="" alt="Roof" csover="567210330,567210331" csclick="567210329" str="roof">
                <area href="javascript:void(0);" coords="356,101,356,101,350,78,390,69,388,89" shape="polygon" title="" alt="Rear Bumper" csover="567210333,567210334" csclick="567210332" str="rrbmp">
                <area href="javascript:void(0);" coords="331,100,22" shape="circle" title="" alt="Wheel" csover="567210336" csclick="567210335" str="whl">
                <area href="javascript:void(0);" coords="52,91,51,91,30,91,32,74,58,77" shape="polygon" title="" alt="Left Park Lamp" csover="567210338,567210339" csclick="567210337" str="prklmprh">
                <area href="javascript:void(0);" coords="63,128,63,128,67,96,25,97,7,89,11,123" shape="polygon" title="" alt="Front Bumper" csover="567211341,567211342" csclick="567211340" str="frtbmp">
                <area href="javascript:void(0);" coords="61,114,61,114,12,112" shape="polygon">
                <area href="javascript:void(0);" coords="146,51,146,51,118,41,164,14,192,21" shape="polygon" title="" alt="Windshield" csover="567211344,567213345" csclick="567211343" str="wndshd">
                <area href="javascript:void(0);" coords="44,72,44,72,12,68,47,52,106,41,138,53" shape="polygon" title="" alt="Hood" csover="567213347,567213348" csclick="567213346" str="hood">
                <area href="javascript:void(0);" coords="106,119,28" shape="circle" title="" alt="Wheel" csover="567213350,567213351" csclick="567213349" str="whl">
                <area href="javascript:void(0);" coords="151,56,151,57,173,40,182,43,184,53,162,60" shape="polygon" title="reermirr" alt="LH Door Mirror" csover="567213353,567213354" csclick="567213352" str="drmrrh">
                <area href="javascript:void(0);" coords="53,86,53,86,72,88,102,77,133,89,142,109,150,109,148,57,43,73,59,76" shape="polygon" title="" alt="Left Fender" csover="567213356,567213357" csclick="567213355" str="fndrrh">
                <area href="javascript:void(0);" coords="324,66,324,66,326,46,306,29,311,25,343,40,384,43,386,51,379,52,379,58,388,60,389,67,350,73" shape="polygon" title="" alt="LH Quarter Panel" csover="567214359,567214360" csclick="567214358" str="qtrpanrh">
                <area href="javascript:void(0);" coords="304,57,321,68" shape="rect" title="" alt="LH Rear Door Handle" csover="567214362,567214363" csclick="567214361" str="rrdrharh">
                <area href="javascript:void(0);" coords="246,114,246,114,249,53,321,48,321,56,301,59,302,70,318,73,298,112" shape="polygon" title="" alt="LH Rear Door" csover="567214365,567214366" csclick="567214364" str="rrdrrh">
                <area href="javascript:void(0);" coords="185,56,185,56,183,45,173,45,204,21,240,18,237,51" shape="polygon" title="" alt="LH Front Door Glass" csover="567215371,567215372" csclick="567215370" str="frdrglrh">
                <area href="javascript:void(0);" coords="154,120,154,120,152,62,246,51,244,57,221,61,224,73,245,76,246,110" shape="polygon" title="" alt="LH Front Door" csover="567215374,567215375" csclick="567215373" str="frdrrh">
                <area href="javascript:void(0);" coords="224,60,244,73" shape="rect" title="" alt="LH Front Door Handle" csover="567215377,567215378" csclick="567215376" str="frdrharh">`);
            break;
        case "back":
            $("#map-img").attr("width", "300");
            $("#map-img").attr("height", "206");
            $("#map-img").attr("src", chrome.runtime.getURL("images/back.jpg"));
            $("#car_part map").html(`
                <area href="javascript:void(0);" coords="254,101,254,101,248,122,54,121,46,103,9,104,10,116,5,135,16,168,149,175,278,167,291,126,287,103" shape="polygon" title="rerbump" alt="Rear Bumper" csover="599CBC471" csclick="599CBC470" str="rrbmp">
                <area href="javascript:void(0);" coords="256,99,256,99,261,83,283,82,289,101" shape="polygon" title="tailouer" alt="RH Tail Light (Outer)" csover="599CBC473" csclick="599CBC472" str="tlltrhou">
                <area href="javascript:void(0);" coords="193,102,193,102,194,82,258,83,253,101" shape="polygon" title="taillight Rh inn" alt="RH Tail Light (Inner)" csover="599CBD475" csclick="599CBD474" str="tlltrhin">
                <area href="javascript:void(0);" coords="51,99,51,99,45,82,111,84,110,106" shape="polygon" title="taillhin" alt="LH Tail Light (Inner)" csover="599CBD477" csclick="599CBD476" str="tlltlhin">
                <area href="javascript:void(0);" coords="11,99,11,99,16,82,42,83,49,100" shape="polygon" title="taillight" alt="LH Tail Light (outer)" csover="599CBD479" csclick="599CBD478" str="tlltlhou">
                <area href="javascript:void(0);" coords="35,56,35,56,52,44,148,40,250,49,260,58" shape="polygon" title="rrspol" alt="Rear Spoiler" csover="599CBD481" csclick="599CBD480" str="rrspoil">
                <area href="javascript:void(0);" coords="44,44,44,44,71,17,148,11,217,14,249,45,148,37" shape="polygon" title="bkwind" alt="Back Glass" csover="599CBD483" csclick="599CBD482" str="bkwin">
                <area href="javascript:void(0);" coords="50,103,50,103,112,108,114,80,42,79,35,58,264,59,255,76,189,79,188,105,249,101,246,119,54,117" shape="polygon" title="trnklid" alt="Trunk Lid" csover="599CBE485" csclick="599CBE484" str="trnkld">`);
            break;
        case "Right Side":
            $("#map-img").attr("width", "400");
            $("#map-img").attr("height", "154");
            $("#map-img").attr("src", chrome.runtime.getURL("images/rtside.jpg"));
            $("#car_part map").html(`
                <area href="javascript:void(0);" coords="78,47,78,47,113,17,102,51" shape="polygon" alt="Vent Glass, Rear RH" csclick="50149289" csover="500F5007,5011A068" str="ventglrerrh">
                <area href="javascript:void(0);" coords="105,49,105,49,114,18,148,17,152,53" shape="polygon" alt="Door Glass-Rear RH" csclick="50257A512" csover="501CDD610,502205011" str="rrdrglrh">
                <area href="javascript:void(0);" coords="8,49,22,63" shape="rect" title="dfsads" alt="Outer Right Taillight" csover="57D89C380,57D89C381" csclick="57D89C379" str="tlltrhou">
                <area href="javascript:void(0);" coords="11,65,11,65,11,59,18,58,19,48,13,48,16,39,58,37,90,22,99,25,76,45,75,65,52,69" shape="polygon" title="Risdjkdfas" alt="Right Quarter Panel" csover="57D89E383,57D89E384" csclick="57D89E382" str="qtrpanrh">
                <area href="javascript:void(0);" coords="370,94,370,94,369,77,381,79,384,94" shape="polygon" title="front headling" alt="RH Front Head Light" csover="57D89E386,57D89E387" csclick="57D89E385" str="hdltrh">
                <area href="javascript:void(0);" coords="198,18,198,18,109,17,125,7,224,10" shape="polygon" title="Roof" alt="Roof" csover="57D89E389,57D89E390" csclick="57D89E388" str="roof">
                <area href="javascript:void(0);" coords="11,39,10,40,43,28,68,30,53,38,25,39" shape="polygon" title="respolp" alt="Rear Spoiler" csover="57D89E392,57D89E393" csclick="57D89E391" str="rrspoil">
                <area href="javascript:void(0);" coords="71,102,24" shape="circle" title="backwheel" alt="Wheel" csover="57D89E395" csclick="57D89E394" str="whl">
                <area href="javascript:void(0);" coords="294,124,30" shape="circle" title="wheel" alt="Wheel" csover="57D89E397,57D89E398" csclick="57D89E396" str="whl">
                <area href="javascript:void(0);" coords="348,93,348,93,338,77,368,74,372,93" shape="polygon" title="parkland" alt="RH Park Lamp" csover="57D89E400,57D89F401" csclick="57D89E399" str="prklmprh">
                <area href="javascript:void(0);" coords="43,97,43,97,50,71,8,68,4,76,5,90" shape="polygon" title="rrbmp" alt="Rear Bumper" csover="57D89F403,57D89F404" csclick="57D89F402" str="rrbmp">
                <area href="javascript:void(0);" coords="0,92,0,93" shape="polygon">
                <area href="javascript:void(0);" coords="248,52,247,53,203,20,230,12,281,42" shape="polygon" title="" alt="Windshield" csover="57D89F409,57D89F410" csclick="57D89F408" str="wndshd">
                <area href="javascript:void(0);" coords="243,50,243,50,227,41,214,44,214,54,244,62" shape="polygon" title="dormir" alt="RH Door Mirror" csover="57D8A1412,57D8A1413" csclick="57D8A1411" str="drmrrh">
                <area href="javascript:void(0);" coords="154,53,154,53,151,16,190,20,225,48,211,53,213,59" shape="polygon" title="glassftr" alt="RH Front Door Glass" csover="57D8A1415,57D8A1416" csclick="57D8A1414" str="frdrglrh">
                <area href="javascript:void(0);" coords="73,55,92,70" shape="rect" title="backdrhan" alt="RH Rear Door Handle" csover="57D8A1418,57D8A1419" csclick="57D8A1417" str="rrdrharh">
                <area href="javascript:void(0);" coords="151,114,151,114,98,111,76,73,88,72,93,60,73,59,73,52,151,56" shape="polygon" title="backdr" alt="RH Rear Door" csover="57D8A1421,57D8A1422" csclick="57D8A1420" str="rrdrrh">
                <area href="javascript:void(0);" coords="338,132,338,132,331,96,365,98,390,93,396,91,390,128,362,133" shape="polygon" title="frbmp" alt="Front Bumper" csover="57D8A1424,57D8A1425" csclick="57D8A1423" str="frtbmp">
                <area href="javascript:void(0);" coords="152,63,173,76" shape="rect" title="drhan" alt="RH Front Door Handle" csover="57D8A1427,57D8A1428" csclick="57D8A1426" str="frdrharh">
                <area href="javascript:void(0);" coords="264,56,264,56,292,45,365,62,384,75,353,77" shape="polygon" title="hood" alt="Hood" csover="57D8A2430,57D8A2431" csclick="57D8A2429" str="hood">
                <area href="javascript:void(0);" coords="154,111,154,111,155,80,175,79,176,66,157,64,154,56,246,62,246,99,241,120" shape="polygon" title="frdr" alt="RH Front Door" csover="57D8A2433,57D8A2434" csclick="57D8A2432" str="frdrrh">
                <area href="javascript:void(0);" coords="241,122,241,122,245,93,244,53,353,79,332,82,344,95,322,94,298,82,276,86,258,105,252,123" shape="polygon" title="fender" alt="RH Fender" csover="57D8A2436,57D8A2437" csclick="57D8A2435" str="fndrrh">`);
            break;
        case "Front-Right":
            $("#map-img").attr("width", "400");
            $("#map-img").attr("height", "230");
            $("#map-img").attr("src", chrome.runtime.getURL("images/frright.jpg"));
            $("#car_part map").html(`
                <area href="javascript:void(0);" coords="37,72,37,72,26,69,30,46,40,62" shape="polygon" title="" alt="Right Rear Door Handle" csover="5591F9207,5591F9208" csclick="5591F9206" str="rrdrharh">
                <area href="javascript:void(0);" coords="76,89,76,89,64,89,69,71,81,76" shape="polygon" title="" alt="Right Front Door Handle" csover="5591FA210,5591FA211" csclick="5591FA209" str="frdrharh">
                <area href="javascript:void(0);" coords="62,122,62,122,41,112,26,71,36,71,37,59,27,53,31,48,69,63" shape="polygon" title="" alt="Right Rear Door" csover="5591FA213,5591FA214" csclick="5591FA212" str="rrdrrh">
                <area href="javascript:void(0);" coords="68,128,68,128,63,101,63,88,74,92,80,75,67,70,72,64,128,89,123,152" shape="polygon" title="" alt="Right Front Door" csover="5591FA216,5591FA217" csclick="5591FA215" str="frdrrh">
                <area href="javascript:void(0);" coords="19,106,19,106,21,70,43,116,54,124,49,134,29,131" shape="polygon" title="" alt="Wheel" csover="5591FC219" csclick="5591FC218" str="whl">
                <area href="javascript:void(0);" coords="138,167,138,167,145,134,168,132,194,159,202,204,183,222,156,210" shape="polygon" title="" alt="Wheel" csover="5591FC221,5591FC222" csclick="5591FC220" str="whl">
                <area href="javascript:void(0);" coords="120,18,120,18,95,5,151,2,202,10,143,16" shape="polygon" title="" alt="Sun Roof" csover="5591FC224,5591FC225" csclick="5591FC223" str="snrf">
                <area href="javascript:void(0);" coords="121,18,121,18,93,8" shape="polygon">
                <area href="javascript:void(0);" coords="13,69,13,70,3,62,10,36,26,35,40,23,44,29,27,46,22,68" shape="polygon" title="" alt="RH Quarter Panel" csover="5591FC227,5591FC228" csclick="5591FC226" str="qtrpanrh">
                <area href="javascript:void(0);" coords="30,43,30,43,67,11,87,14,73,61" shape="polygon" title="" alt="RH Rear Door Glass" csover="5591FC230,5591FC231" csclick="5591FC229" str="rrdrglrh">
                <area href="javascript:void(0);" coords="73,59,73,59,85,15,111,23,126,51,86,62,85,68" shape="polygon" title="" alt="RH Front Door Glass" csover="5591FC233,5591FD234" csclick="5591FC232" str="frdrglrh">
                <area href="javascript:void(0);" coords="128,85,127,85,94,78,91,62,123,55,130,77" shape="polygon" title="" alt="Mirror-Door RH" csover="5591FD236,5591FD237" csclick="5591FD235" str="drmrrh">
                <area href="javascript:void(0);" coords="141,70,141,70,261,49,213,13,119,20" shape="polygon" title="" alt="Windshield" csover="5591FD239,5591FD240" csclick="5591FD238" str="wndshd">
                <area href="javascript:void(0);" coords="148,72,148,72,263,52,273,62,244,73,162,77" shape="polygon" title="" alt="Wiper Arm" csover="5591FD242,5591FD243" csclick="5591FD241" str="wipear">
                <area href="javascript:void(0);" coords="157,80,157,80,259,138,318,143,374,119,374,106,278,65,246,75" shape="polygon" title="" alt="Hood" csover="5591FE245,5591FE246" csclick="5591FE244" str="hood">
                <area href="javascript:void(0);" coords="199,149,199,149,166,122,142,133,139,159,128,155,133,90,139,71,256,136,217,131,224,155" shape="polygon" title="" alt="RH Fender" csover="5591FE248" csclick="5591FE247" str="fndrrh">
                <area href="javascript:void(0);" coords="202,156,202,156,250,173,320,168,319,153,323,150,336,167,390,152,390,130,395,151,387,182,304,216,246,216,211,203" shape="polygon" title="" alt="Front Bumper" csover="5591FE250,5591FE251" csclick="5591FE249" str="frtbmp">
                <area href="javascript:void(0);" coords="257,141,257,141,219,135,227,161,249,166,269,164" shape="polygon" title="" alt="RH Park Lamp" csover="5591FE253,5591FE254" csclick="5591FE252" str="prklmprh">
                <area href="javascript:void(0);" coords="312,143,312,143,315,161,270,166,258,139" shape="polygon" title="" alt="RH Head Light" csover="5591FF256,5591FF257" csclick="5591FF255" str="hdltrh">
                <area href="javascript:void(0);" coords="335,162,335,162,321,143,375,123,381,146,360,154" shape="polygon" title="" alt="Grille" csover="5591FF259,5591FF260" csclick="5591FF258" str="grl">`);
            break;
        default:
            break;
    }
    if (direction) {
        $("#car_map").hide();
        $("#car_part").show();
    }
});

$('body').on('click', '#back-map-btn', function () {
    $("#car_map").show();
    $("#car_part").hide();
});

$('body').on('mouseover', '#car_part area', function () {
    var str = $(this).attr('str');
    $("#sub-itme-img").show();
    $("#sub-itme-img").attr('src', chrome.runtime.getURL('images/' + str + '.jpg'));
});

$('body').on('click', '#car_part area', async function () {
    $("#car_map_loading").show();
    var area_key = $(this).attr('str');
    var item = getSelectedCarPartItem(area_key);
    if (item == null) return;
    $("#car_part").attr('area', area_key);
    carpart_name = item.autohelper.title;
    $('#car_part_table').hide();
    $('#car_part_table').html('');

    data_1.userDate = cor_year;
    data_1.userDate2 = cor_year;
    data_1.userVIN = cor_vin;
    data_1.userZip = cor_zipcode;
    data_1.userPart = item.carpart;

    data_3.q = item.autohelper.key;

    await getCarPartList(data_1, area_key);
});

$('body').on('click', '#car_part_table tr:not(:first):not(:last)', function () {
    var area_key = $("#car_part").attr('area');
    var _total = Number($('#total_carpart_price').text().replace(/[^0-9\.]+/g, ""));
    var _price = Number($(this).find('td:nth-child(6)').text().replace(/[^0-9\.]+/g, ""));

    if ($(".carpart_price_list[key=" + area_key + "]").length) {
        var _current_price = Number($(".carpart_price_list[key=" + area_key + "] .carpart-price").text().replace(/[^0-9\.]+/g, ""));
        $(".carpart_price_list[key=" + area_key + "] .carpart-price").text(`$${_price}`);
        $('#total_carpart_price').text(`$${(_total + _price - _current_price).toFixed(2)}`)
    } else {
        $("#carpart_price_div").append(`<p class="carpart_price_list" key="${area_key}"><span>${carpart_name}</span><span class="carpart-price">$${_price}</span></p>`)
        $('#total_carpart_price').text(`$${(_total + _price).toFixed(2)}`)
    }

});