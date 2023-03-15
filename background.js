chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.from === "sendCopartReq") {
    (async () => {
      fetch("https://copart-cors.herokuapp.com/https://car-part.com/cgi-bin/search.cgi/", {
        method: "POST",
        crossDomain: false,
        headers: new Headers({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "X-Requested-With, Content-Type",
        }),
        body: request.data,
      })
        .then(async function (result) {
          console.log(" fetch car-part data success", result);
          let apiData = await result.text();
          sendResponse({ data: apiData });
        })
        .catch(function (error) {
          console.log(" fail fetch test ", error);
        });
    })();
    return true;
  }
  if (request.from === "sendCarpartsDetail") {
    (async () => {
      var url = new URL("https://api.usautoparts.io/v1/search");
      Object.keys(request.data).forEach(key => {
          if(key == 'vehicle') {
              Object.keys(request.data[key]).forEach(vkey => url.searchParams.append(`${key}[${vkey}]`, request.data[key][vkey]))
          } else {
              url.searchParams.append(key, request.data[key])
          }
      });
      fetch(url, {
        method: "GET",
        crossDomain: false,
        headers: new Headers({
          'apikey': 'anzhbnJvaXVz'
        }),
      })
      .then(async function (result) {
        console.log(" fetch carparts data success", result);
        let apiData = await result.text();
        sendResponse({ data: apiData });
      })
      .catch(function (error) {
        console.log(" fail fetch test ", error);
      });
    })();
    return true;
  }
  if (request.from === "sendCarpartsBatch") {
    (async () => {
        fetch("https://api.usautoparts.io/v1/inventory/byIdBatch", {
            method: "POST",
            crossDomain: false,
            headers: new Headers({
                'apikey': 'anzhbnJvaXVz',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(request.data),
        })
        .then(async function (result) {
            console.log(" fetch carparts batch success", result);
            let apiData = await result.text();
            sendResponse({ data: apiData });
        })
        .catch(function (error) {
            console.log(" fail fetch test ", error);
        });
    })();
    return true;
  }
  if (request.from === "sendCarpartsDeliveryDates") {
    var url = new URL("https://api.usautoparts.io/v1/shipping-options/getEstimatedDeliveryDates");
    Object.keys(request.data).forEach(key => {
        if(key == 'methods') {
            request.data[key].forEach((el) => {
                url.searchParams.append(`${key}[]`, el)
            });
        } else {
            url.searchParams.append(key, request.data[key])
        }
    });
    (async () => {
      fetch(url, {
        method: "GET",
        crossDomain: false,
        headers: new Headers({
          'apikey': 'anzhbnJvaXVz'
        }),
      })
        .then(async function (result) {
          console.log(" fetch carparts deliverydate success", result);
          let apiData = await result.text();
          sendResponse({ data: apiData });
        })
        .catch(function (error) {
          console.log(" fail fetch test ", error);
        });
    })();
    return true;
  }
  if (request.from === "openMMRAuth") {
    chrome.tabs.create({ url: request.data, active: false }, function(tab) {
      console.log(tab)
      chrome.tabs.executeScript(tab.id, {
        code: `
          if(document.getElementsByTagName("pre").length > 0) {
            var m_content = document.getElementsByTagName("pre")[0].innerText
            alert(m_content)
          } else {
            alert("Please Signin to http://mmr.manheim.com/")
          }
        `
      });
      chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(){
        
      })
    });
    return true;
  }
  return true;
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
      id: '',
      title: 'RunVin',
      contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tabs) => {
  console.log('context menu clicked');
  
  var selectedText = info.selectionText;

  if (selectedText.length === 17) {
      // var vin_reg = new RegExp("^[A-HJ-NPR-Z\\d]{8}[\\dX][A-HJ-NPR-Z\\d]{2}\\d{6}$");
      if(validateVin(selectedText)) {
          chrome.tabs.sendMessage(tabs.id, {status: "clickedVin", vin: selectedText}, 
          (response) => {
              console.log(response);
          });
      } else {
          chrome.tabs.sendMessage(tabs.id, "errorVin", 
          (response) => {
              console.log(response);
          });
      }
  } else {
      chrome.tabs.sendMessage(tabs.id, "noVin", 
      (response) => {
          console.log(response);
      });
  }
});

function validateVin(vin) {
  return validate(vin);

  function transliterate(c) {
    return '0123456789.ABCDEFGH..JKLMN.P.R..STUVWXYZ'.indexOf(c) % 10;
  }

  function get_check_digit(vin) {
    var map = '0123456789X';
    var weights = '8765432X098765432';
    var sum = 0;
    for (var i = 0; i < 17; ++i)
      sum += transliterate(vin[i]) * map.indexOf(weights[i]);
    return map[sum % 11];
  }

  function validate(vin) {
      if (vin.length !== 17) return false;
      return get_check_digit(vin) === vin[8];
    }
}