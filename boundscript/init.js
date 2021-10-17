function prueba() {
    var curDate = Utilities.formatDate(new Date(), "GMT-5", "dd MMMM yyyy hh:mm:ss");
    console.log(curDate)
}

function doGet(e) {
    return handleResponse(e);
}

function handleResponse(e) {
    var device_status = false;

    // verificando si recibe el api_key
    if (!e.parameter.api_key) {
        return ContentService
            .createTextOutput(JSON.stringify({ "status": false, "msg": "API key no especificada" }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // verificando si recibe el numero_identificacion
    if (!e.parameter.numero_identificacion) {
        return ContentService
            .createTextOutput(JSON.stringify({ "status": false, "msg": "Usuario no especificado" }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");

    var db_api_key = sheet.getRange(2, 4).getValues()[0][0];
    Logger.log(db_api_key)

    if (db_api_key == e.parameter.api_key) {
        device_status = true;
    }

    if (device_status) {
        // shortly after my original solution Google announced the LockService[1]
        // this prevents concurrent access overwritting data
        // [1] http://googleappsdeveloper.blogspot.co.uk/2011/10/concurrency-and-google-apps-script.html
        // we want a public lock, one that locks for all invocations
        var lock = LockService.getPublicLock();
        lock.waitLock(30000);  // wait 30 seconds before conceding defeat.        

        try {
            // next set where we write the data - you could write to multiple/alternate destinations

            // we'll assume header is in row 1 but you can override with header_row in GET/POST data
            var headRow = e.parameter.header_row || 1;
            var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

            var row = [];
            var nextRow = sheet.getLastRow() + 1; // get next row

            // loop through the header columns
            var user = getUserData(e.parameter.numero_identificacion);
            if (user.status == false) {
                return ContentService
                    .createTextOutput(JSON.stringify({ "status": false, "msg": user.msg }))
                    .setMimeType(ContentService.MimeType.JSON);
            }

            for (i in headers) {
                if (headers[i] == "fecha") {
                    var curDate = Utilities.formatDate(new Date(), "GMT-5", "dd MMMM yyyy hh:mm:ss");
                    row.push(curDate);
                }
                if (headers[i] == "nombre") {
                    row.push(user.name);
                }
            }
            Logger.log(row);

            // more efficient to set values as [][] array than individually [Sheet.getRange(row, column, numRows, numColumns)]
            sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

            // return json success results
            return ContentService
                .createTextOutput(JSON.stringify({ "status": true, "msg": "Asistencia registrada", "name": user.name }))
                .setMimeType(ContentService.MimeType.JSON);
        } catch (e) {
            // if error return this
            return ContentService
                .createTextOutput(JSON.stringify({ "status": false, "msg": e }))
                .setMimeType(ContentService.MimeType.JSON);
        } finally { //release lock
            lock.releaseLock();
        }
    } else {
        return ContentService
            .createTextOutput(JSON.stringify({ "status": false, "msg": "API key no valida" }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}