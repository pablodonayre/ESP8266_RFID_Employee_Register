1. Boundscript Code (Google Spreadsheet: Astro_Asistencia)

    - Put the code found inside boundscript Directory of Github repository, inside eu_db project
    - Publish the project as follows:
        * Ejecutar la aplicación como: Yo
        * Quién tiene acceso a la aplicación: Cualquier persona, incluso de forma anónima
    - Verify if "El nuevo tiempo de ejecución de Apps Script con tecnología de Chrome V8 (alfa)." it is enabled in "Ejecutar" tab. If it is enabled disable it, because it cause a problem when 'standalone' try to connect and get data.


2. Spreadsheet structure
    ```
    sheet 1: Configuracion
        row 1:
            col A = identificacion
            col B = nombre

    sheet 2: Data
        row 1:
            col A = fecha
            col B = nombre
            col D = api_key
        
        row 2 :
            col D = Ab123456789!
    ```
    