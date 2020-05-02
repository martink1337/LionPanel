//Requires
const utils = require('./utils.js')

//Helpers
const log = (x)=>{console.log(x)}
const dir = (x)=>{console.dir(x)}
const isUndefined = (x) => { return (typeof x === 'undefined') };
const logError = (err) => {
    console.log(`[LionPanelClient] Error: ${err.message}`);
    try {
        err.stack.forEach(trace => {
            console.log(`\t=> ${trace.file}:${trace.line} > ${trace.name}`)
        });
    } catch (error) {
        console.log('Error stack unavailable.')
    }
    console.log()
}
const getIdentifiers = (src) => {
    let identifiers = [];
    try {
        for (let i = 0; i < GetNumPlayerIdentifiers(src); i++) {
            identifiers.push(GetPlayerIdentifier(src, i))
        }
    } catch (error) {
        logError(error)
    }
    return identifiers;
}
const getPlayerData = (src) => {
    if(src === null || src === false) return false;
    if(src === -1) return {name: 'console', identifiers:[]}
    try {
        return {
            name: GetPlayerName(src),
            identifiers: getIdentifiers(src)
        };
    } catch (error) {
        logError(error)
        return false;
    }
}
const debugPrint = (data) => {
    let sep = '='.repeat(46);
    let json = JSON.stringify(data, null, 2);
    log(`${sep}\n${json}\n${sep}`);
}


/**
 * Logger class
 */
class Logger {
    constructor(){
        log('[LionPanelClient] Logger started');
        this.log = [{
            timestamp: (Date.now() / 1000).toFixed(),
            action: "LionPanelClient:Started",
            source: false,
            data: false
        }];
        this.LionPanelPort = 'invalid';
        this.LionPanelToken = 'invalid';
        this.setupVarsAttempts = 0;
        this.setupVars();

        //Attempt to flush log to LionPanel
        setInterval(() => {
            this.flushLog();
        }, 2500);
    }

    //Attempt to set env vars
    setupVars(){
        if(this.LionPanelPort === 'invalid' || this.LionPanelToken === 'invalid'){
            if(this.setupVarsAttempts > 5){
                log('[LionPanelClient] JS awaiting for environment setup...')
            }
            this.setupVarsAttempts++;
            this.LionPanelPort = GetConvar("LionPanel-apiPort", "invalid");
            this.LionPanelToken = GetConvar("LionPanel-apiToken", "invalid");
        }
    }

    //Register log event
    r(src, action, data){
        let toLog = {
            timestamp: (Date.now() / 1000).toFixed(),
            action,
            source: getPlayerData(src),
            data: (data)? data : false
        }
        this.log.push(toLog)
        // debugPrint(toLog);
    }

    //Flush Log
    flushLog(){
        if(!this.log.length) return;
        if(this.LionPanelPort === 'invalid' || this.LionPanelToken === 'invalid'){
            return this.setupVars();
        }

        const postData = JSON.stringify({
            LionPanelToken: this.LionPanelToken,
            log: this.log
        })
        utils.postJson(`http://localhost:${this.LionPanelPort}/intercom/logger`, postData)
            .then((data) => {
                if(data.statusCode === 413){
                    log(`[LionPanelClient] Logger upload failed with code 413 and body ${data.body}`);
                    //TODO: introduce a buffer to re-upload the log in parts.
                    this.log = [{
                        timestamp: (Date.now() / 1000).toFixed(),
                        action: "DebugMessage",
                        source: false,
                        data: `wiped log with size ${postData.length} due to upload limit`
                    }];
                }else if(data.statusCode === 200){
                    this.log = [];
                }else{
                    log(`[LionPanelClient] Logger upload failed with code ${data.statusCode} and body ${data.body}`);
                }
            })
            .catch((error) => {
                log(`[LionPanelClient] Logger upload failed with error: ${error.message}`);
            });
    }
}
logger = new Logger();


//Event handlers
on('playerConnecting', (name, skr, d) => {
    try {
        logger.r(global.source, 'playerConnecting');
    } catch (error) {
        logError(error)
    }
})

on('playerDropped', (reason) => {
    try {
        logger.r(global.source, 'playerDropped');
    } catch (error) {
        logError(error)
    }
})

on('explosionEvent', (source, ev) => {
    //Helper function
    const isInvalid = (prop, invValue) => {
        return (typeof prop == 'undefined' || prop === invValue);
    }
    //Filtering out bad event calls
    if(
        isInvalid(ev.damageScale, 0) ||
        isInvalid(ev.cameraShake, 0) ||
        isInvalid(ev.isInvisible, true) ||
        isInvalid(ev.isAudible, false)
    ){
        return;
    }
    //Decoding explosion type
    let types = ['DONTCARE', 'GRENADE', 'GRENADELAUNCHER', 'STICKYBOMB', 'MOLOTOV', 'ROCKET', 'TANKSHELL', 'HI_OCTANE', 'CAR', 'PLANE', 'PETROL_PUMP', 'BIKE', 'DIR_STEAM', 'DIR_FLAME', 'DIR_WATER_HYDRANT', 'DIR_GAS_CANISTER', 'BOAT', 'SHIP_DESTROY', 'TRUCK', 'BULLET', 'SMOKEGRENADELAUNCHER', 'SMOKEGRENADE', 'BZGAS', 'FLARE', 'GAS_CANISTER', 'EXTINGUISHER', 'PROGRAMMABLEAR', 'TRAIN', 'BARREL', 'PROPANE', 'BLIMP', 'DIR_FLAME_EXPLODE', 'TANKER', 'PLANE_ROCKET', 'VEHICLE_BULLET', 'GAS_TANK', 'BIRD_CRAP', 'RAILGUN', 'BLIMP2', 'FIREWORK', 'SNOWBALL', 'PROXMINE', 'VALKYRIE_CANNON', 'AIR_DEFENCE', 'PIPEBOMB', 'VEHICLEMINE', 'EXPLOSIVEAMMO', 'APCSHELL', 'BOMB_CLUSTER', 'BOMB_GAS', 'BOMB_INCENDIARY', 'BOMB_STANDARD', 'TORPEDO', 'TORPEDO_UNDERWATER', 'BOMBUSHKA_CANNON', 'BOMB_CLUSTER_SECONDARY', 'HUNTER_BARRAGE', 'HUNTER_CANNON', 'ROGUE_CANNON', 'MINE_UNDERWATER', 'ORBITAL_CANNON', 'BOMB_STANDARD_WIDE', 'EXPLOSIVEAMMO_SHOTGUN', 'OPPRESSOR2_CANNON', 'MORTAR_KINETIC', 'VEHICLEMINE_KINETIC', 'VEHICLEMINE_EMP', 'VEHICLEMINE_SPIKE', 'VEHICLEMINE_SLICK', 'VEHICLEMINE_TAR', 'SCRIPT_DRONE', 'RAYGUN', 'BURIEDMINE', 'SCRIPT_MISSIL'];
    if(ev.explosionType < -1 || ev.explosionType > 72){
        ev.explosionType = 'UNKNOWN';
    }else{
        ev.explosionType =  types[ev.explosionType+1]
    }
    //Adding logging data
    try {
        logger.r(source, 'explosionEvent', ev);
    } catch (error) {
        logError(error)
    }
})

onNet('txaLogger:DeathNotice', (killer, cause) => {
    let killerData = null;
    if(killer !== null && killer !== false){
        try {
            killerData = getPlayerData(GetPlayerFromIndex(killer));
        } catch (error) {}
    }
    try {
        let toLogData = {
            cause,
            killer: killerData
        }
        logger.r(global.source, 'DeathNotice', toLogData);
    } catch (error) {
        logError(error)
    }
});

onNet('txaLogger:CommandExecuted', (data) => {
    try {
        logger.r(global.source, 'CommandExecuted', data);
    } catch (error) {
        logError(error)
    }
});

onNet('txaLogger:DebugMessage', (data) => {
    try {
        logger.r(global.source, 'DebugMessage', data);
    } catch (error) {
        logError(error)
    }
});

const logChatMessage = (src, author, text)=>{
    try {
        let toLogData = {
            author,
            text
        }
        logger.r(src, 'ChatMessage', toLogData);
    } catch (error) {
        logError(error)
    }
}
onNet('chatMessage', logChatMessage);
onNet('txaLogger:internalChatMessage', logChatMessage);
