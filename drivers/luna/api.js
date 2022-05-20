const fetch = require('node-fetch');
const util = require('util');

const { URLSearchParams } = require('url');

const baseUrl = 'https://intl.fusionsolar.huawei.com/thirdData';
let token;
class LunaApi {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    async initializeSession() {

        const accountUrl = `${baseUrl}/login`;
        const requestBody = JSON.stringify({
            "userName": this.username,
            "systemCode": this.password
        });
        const apiData = await this.apiRequest(accountUrl, 'POST', requestBody);
        return apiData;


    }

    async apiRequest(url, methodContent, requestBody) {

        const apiResponse = await fetch(url, {
            method: methodContent,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: requestBody,
        });

        const apiData = await apiResponse;
        const bodyData = await apiData.text();

        token = apiData.headers.get('xsrf-token');
        console.log(bodyData);
        if (apiData.statusText === 'OK' && bodyData.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    async getSystems() {

        const systemsUrl = `${baseUrl}/getStationList`;

        const response = await fetch(systemsUrl, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                "XSRF-TOKEN": token,
            }
        });
        const apiData = await response.json();
        return apiData.data;

    }

    async getBasicStats(stationCode) {
        const systemsUrl = `${baseUrl}/getStationRealKpi`;

        let bodyData = JSON.stringify({
            "stationCodes": stationCode
        });
        const response = await fetch(systemsUrl, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                "XSRF-TOKEN": token,
            },
            body: bodyData
        });

        const apiData = await response.json();
        console.log("apiData");
        console.log(util.inspect(apiData.data, false, null, true /* enable colors */))
        if (apiData.data !== null) {
            return apiData.data[0].dataItemMap;
        } else {
            return null;
        }
    }

    async getDevList(stationCode) {

        const systemsUrl = `${baseUrl}/getDevList`;
        let battery = "";
        let inverter = "";
        let powerSensor = "";

        let bodyData = JSON.stringify({
            "stationCodes": stationCode
        });
        const response = await fetch(systemsUrl, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                "XSRF-TOKEN": token,
            },
            body: bodyData
        });

        const apiData = await response.json();

        for (let index = 0; index < apiData.data.length; index++) {

            if (apiData.data[index]["devName"] !== null && apiData.data[index]["devName"].includes('Battery')) {
                battery = apiData.data[index];
            }

            if (apiData.data[index]["devName"] !== null && apiData.data[index]["devName"].includes('meter')) {
                powerSensor = apiData.data[index];
            }

            if (apiData.data[index]["invType"] !== null && apiData.data[index]["invType"].includes("SUN2000-")) {
                inverter = apiData.data[index];
            }
        }
        return { battery, inverter, powerSensor };

    }
    async getDevRealKpi(devIds, devTypeId, server) {

        const systemsUrl = `https://${server}.fusionsolar.huawei.com:31942/thirdData/getDevRealKpi`;
        let bodyData = JSON.stringify({
            "devIds": devIds,
            "devTypeId": devTypeId
        });
        const response = await fetch(systemsUrl, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                "XSRF-TOKEN": token,
            },
            body: bodyData
        });

        const apiData = await response.json();
        console.log("getDevRealKpi");
        console.log(apiData);
        if (apiData.errorCode !== "undefined") {
            if (apiData.data !== 'undefined') {
                return apiData.data[0].dataItemMap;;
            } else {
                return null;
            }
        } else {
            return null;
        }



    }
}

module.exports = { LunaApi };
