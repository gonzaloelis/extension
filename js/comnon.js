"use strict";
const cors_url = "http://ec2-44-208-136-46.compute-1.amazonaws.com:3303/";
const kbb_url = "https://www.kbb.com/owners-argo/api/";

async function getInfosByVin(vin, mileage, zipcode) {
    try {
        var query =  `query vinSLPPageCadsQuery {
                vehicleUrlByVin: vehicleUrlByVinCads(vin: "${vin}") {
                    url
                    make
                    makeId
                    model
                    modelId
                    year
                    vin
                }
            }`;
        const res1 = await getValues(kbb_url, query);
        query = `query vinLicenseVehicleDetailsCadsQuery {
                vinLicenseVehicleDetails: vinLicenseVehicleDetailsCads( vin: "${vin}" ) {
                    trims {
                        vehicleId
                        trimName
                        bodyStyle
                        __typename
                    }
                }
            }`;
        const res2 = await getValues(kbb_url, query);
        if (res1.data.vehicleUrlByVin && res2.data.vinLicenseVehicleDetails) {
            try {
                var options = '9023222|true|9023224|true|9023221|true|9023254|true';
                var key_array = res1.data.vehicleUrlByVin.url.split('/');
                var make = key_array[1];
                var model = key_array[2];
                var year = key_array[3];
                        // intent: "trade-in-sell"
                        // options: "${options}"
                query = `query ymmtPageQuery {
                    ymmt: ymmtPage(
                        vehicleClass: "UsedCar"
                        year: "${year}"
                        make: "${make}"
                        model: "${model}"
                        trim: "${res2.data.vinLicenseVehicleDetails.trims[0].trimName}"
                        vehicleId: "${res2.data.vinLicenseVehicleDetails.trims[0].vehicleId}"
                        mileage: "${mileage}"
                        zipcode: "${zipcode}"
                    ) {
                        redirectUrl
                        vehicleId
                        year
                        make { id name __typename }
                        model { id name __typename }
                        trim { id name __typename }
                        showCategoryStyleLink
                        generationInstanceId
                        typicalMileage
                        bodyStyle
                        luxuryType
                        sportType
                        intent
                        subCategory
                        size
                        consumerReviews { averageOverallRating totalReviewCount reviewsRoute __typename }
                        pricing
                        baseImageUrl
                        chromeStyleId
                        __typename
                    }
                }`;
                const car_val = await getValues(kbb_url, query)
                return car_val;
            } catch (err) {
                console.log('fail-2', err);
            }
        }
    } catch (err) {
        console.log('fail-1', err);
    }
}

function getValues(_url, _query) {
    return $.ajax({
        type: 'POST',
        url: cors_url + _url,
        contentType: "application/json",
        data: JSON.stringify({
            query: _query
        })
    });
};

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