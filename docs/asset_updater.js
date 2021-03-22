var fs = require("fs");

const result = {};

fs.readdir("./assets/cb", function (error, filelist) {
    result.cb = filelist;
    fs.readdir("./assets/cb_costume", function (error, filelist) {
        result.cb_costume = filelist;
        fs.readdir("./assets/stand", function (error, filelist) {
            result.stand = filelist;
            fs.readdir("./assets/stand_costume", function (error, filelist) {
                result.stand_costume = filelist;
                console.log(result);
                fs.writeFile(
                    "./asset.json",
                    JSON.stringify(result, null, 3),
                    function (data) {
                        console.log(data);
                        process.exit(0);
                    }
                );
            });
        });
    });
});
