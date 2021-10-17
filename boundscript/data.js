function usersStorage() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Configuracion");

    // My own function (library)
    var users = getRowsData(sheet);
    Logger.log(users);
    return users;
}

function getUserData(id) {
    // Adquire toda la data de la hoja de usuarios
    var users = usersStorage();
    var result = { 'status': false, "msg": "Usuario no valido" };
    // Logger.log(id)

    for (var i = 0; i < users.length; i++) {
        Logger.log(users[i]['identificacion'])
        Logger.log(id)
        if (users[i]['identificacion'] == id) {
            result = { 'status': true, "msg": "Usuario valido", 'name': users[i]['nombre'] };
            break;
        }
    }
    // Logger.log(result);
    return result;
}