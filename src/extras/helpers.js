//Requires
const fs = require('fs');
const net = require('net');
const path = require('path');


//================================================================
/**
 * LionPanel in ASCII
 */
function LionPanelASCII() {
    //NOTE: precalculating the ascii art for efficiency
    // const figlet = require('figlet');
    // let ascii = figlet.textSync('LionPanel');
    // let b64 = Buffer.from(ascii).toString('base64');
    // console.log(b64);
    const preCalculated = `IF8gICAgXyAgX19fICBfIF8gIF9fXyAgX19fICBfIF8gIF9fXyAgX19fIA0KfCB8ICB8IHx8I
    C4gfHwgXCB8LyBfXz58IC4gfHwgfCB8fCAuIHx8IC4gXA0KfCB8XyB8IHx8IHwgfHwgICB8XF9fIFx8IHwgfHwgJyB8fCAg
    IHx8IHwgfA0KfF9fX3x8X3xgX19fJ3xfXF98PF9fXy9gX19fXGBfX18nfF98X3x8X19fLw0KICAgICAgICAgICAgICAgICA
    gICAgICAgICAgICAgICAgICAgICAgICAgIA==`;
    return Buffer.from(preCalculated, 'base64').toString('ascii');
}


//================================================================
/**
 * Check if the packages in package.json were installed
 */
function dependencyChecker() {
    try {
        let rawFile = fs.readFileSync('package.json');
        let parsedFile = JSON.parse(rawFile);
        let packages = Object.keys(parsedFile.dependencies)
        let missing = [];
        packages.forEach(package => {
            try {
                require.resolve(package);
            } catch (error) {
                missing.push(package);
            }
        });
        if(missing.length){
            console.log(`[LionPanel:PreCheck] Cannot start LionPanel due to missing dependencies.`);
            console.log(`[LionPanel:PreCheck] Make sure you executed 'npm i'.`);
            console.log(`[LionPanel:PreCheck] The following packages are missing: ` + missing.join(', '));
            if(!process.version.startsWith('v10.')){
                console.log(`[LionPanel:PreCheck] Note: LionPanel doesn't support NodeJS ${process.version}, please install NodeJS v10 LTS!`);
            }
            process.exit();
        }
    } catch (error) {
        console.log(`[LionPanel:PreCheck] Error reading or parsing package.json: ${error.message}`);
        process.exit();
    }
}


//================================================================
/**
 * Reads CFG Path and return the file contents, or throw error if:
 *  - the path is not valid (absolute or relative)
 *  - cannot read the file data
 * @param {string} cfgPath
 * @param {string} basePath
 */
function parseSchedule(schedule, filter) {
    if(typeof filter === 'undefined') filter = true;
    times = (typeof schedule === 'string')? schedule.split(',') : schedule;
    let out = []
    times.forEach((time) => {
        if(!time.length) return;
        const regex = /^$|^([01]?[0-9]|2[0-3]):([0-5][0-9])$/gm;
        let m = regex.exec(time.trim())
        if(m === null){
            if(!filter) out.push(time);
        }else{
            out.push({
                string: m[0],
                hour: parseInt(m[1]),
                minute: parseInt(m[2]),
            });
        }
    });

    return out;
}


//================================================================
/**
 * Reads CFG Path and return the file contents, or throw error if:
 *  - the path is not valid (must be absolute)
 *  - cannot read the file data
 * @param {string} cfgFullPath
 */
function getCFGFileData(cfgPath) {
    //Validating if the path is absolute
    if(!path.isAbsolute(cfgPath)){
        throw new Error("File path must be absolute.");
    }

    //Validating file existence
    if(!fs.existsSync(cfgPath)){
        if(cfgPath.includes('cfg')){
            throw new Error("File doesn't exist or its unreadable.");
        }else{
            throw new Error("File doesn't exist or its unreadable. Make sure to include the CFG file in the path, and not just the directory that contains it.");
        }
    }

    //Reading file
    try {
        return fs.readFileSync(cfgPath).toString();
    } catch (error) {
        throw new Error("Cannot read CFG Path file.");
    }
}


//================================================================
/**
 * Returns the absolute path of the given CFG Path
 * @param {string} cfgPath
 * @param {string} basePath
 */
function resolveCFGFilePath(cfgPath, basePath) {
    return (path.isAbsolute(cfgPath))? cfgPath : path.resolve(basePath, cfgPath);
}


//================================================================
/**
 * Processes cfgPath and returns the fxserver port or throw errors if:
 *  - Regex Match Error
 *  - no endpoints found
 *  - endpoints that are not 0.0.0.0:xxx
 *  - port mismatch
 * @param {string} rawCfgFile
 */
function getFXServerPort(rawCfgFile) {
    let regex = /^\s*endpoint_add_(\w+)\s+["']?([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\:([0-9]{1,5})["']?.*$/gim;
    // let regex = /endpoint_add_(\w+)\s+["']?([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\:([0-9]{1,5})["']?.*/gi;
    let matches = [];
    try {
        let match;
        while (match = regex.exec(rawCfgFile)) {
            let matchData = {
                line: match[0].trim(),
                type: match[1],
                interface: match[2],
                port: match[3],
            }
            matches.push(matchData);
        }
    } catch (error) {
        throw new Error("Regex Match Error");
    }

    if(!matches.length) throw new Error("No endpoints found");

    let validTCPEndpoint = matches.find((match) => {
        return (match.type.toLowerCase() === 'tcp' && (match.interface === '0.0.0.0' || match.interface === '127.0.0.1'))
    })
    if(!validTCPEndpoint) throw new Error("You MUST have a TCP endpoint with interface 0.0.0.0");

    let validUDPEndpoint = matches.find((match) => {
        return (match.type.toLowerCase() === 'udp')
    })
    if(!validUDPEndpoint) throw new Error("You MUST have at least one UDP endpoint");

    //FIXME: Think of something to make this work:
    //  https://forum.fivem.net/t/release-LionPanel-manager-discord-bot-live-console-playerlist-autorestarter/530475/348?u=tabarra
    matches.forEach((m) => {
        if(m.port !== matches[0].port) throw new Error("All endpoints MUST have the same port")
    });

    return matches[0].port;
}



module.exports = {
    LionPanelASCII,
    dependencyChecker,
    parseSchedule,
    getCFGFileData,
    resolveCFGFilePath,
    getFXServerPort,
}
