const fs = require('fs-extra');
const path = require('path');

const childProcess = require('child_process');

const root = path.join(__dirname, '..');

if (! fs.existsSync(path.join(root, 'pbo'))) {
    fs.mkdirSync(path.join(root, 'pbo'));
}

if (! fs.existsSync(path.join(root, 'tmp'))) {
    fs.mkdirSync(path.join(root, 'tmp'));
}

const TEMPLATE_FOLDER = 'ZGM-17_Achilles_Blufor.Altis';
const TEMPLATE_IMAGE_NAME = 'achilles_blufor';
const TEMPLATE_EXT_MISSION_NAME = 'Zeus 16+1 Achilles Altis';
const TEMPLATE_SQM_MISSION_NAME = 'Zeus 16+1 Achilles Altis (BLUFOR)';
const TEMPLATE_SIDE = 'WEST';
const TEMPLATE_SOLDIER = 'B_Soldier_Universal_F';

const FOLDER_PREFIX = 'ZGM-17_Achilles';
const IMAGE_NAME_PREFIX = 'achilles';
const NAME_PREFIX = 'Zeus 16+1 Achilles';

// Define side related array params
const sideNames = ['blufor', 'opfor', 'greenfor'];
const sides = ['WEST', 'EAST', 'GUER'];
const soldiers = ['B_Soldier_Universal_F', 'O_Soldier_Universal_F', 'I_Soldier_Universal_F'];

const whitelist = require('../mapWhitelist.json');

let mapKeys = [];
let mapNames = [];

for (const mapKey in whitelist) {
    if (whitelist.hasOwnProperty(mapKey)) {
        const mapName = whitelist[mapKey];
        mapKeys.push(mapKey);
        mapNames.push(mapName);
    }
}

fs.removeSync(path.join(root, 'missionWhitelist.dat'));

/**
 * @param {number} side Side Index
 * @param {number} map Map Index
 */
function generateMission(side, map) {
    const sideName = sideNames[side];
    const capitalizedSide = sideName.charAt(0).toUpperCase() + sideName.slice(1);

    const imageName = `${IMAGE_NAME_PREFIX}_${sideName}`;
    const extMissionName = `${NAME_PREFIX} ${mapNames[map]}`;
    const sqmMissionName = `${extMissionName} (${sides[side]})`;

    const folderName = `${FOLDER_PREFIX}_${capitalizedSide}.${mapKeys[map]}`;

    fs.removeSync(path.join(root, 'tmp', folderName));
    fs.copySync(path.join(root, 'src', TEMPLATE_FOLDER), path.join(root, 'tmp', folderName));

    console.log(`Generating ${folderName}`);
    
    if (folderName !== TEMPLATE_FOLDER) {
        fs.removeSync(path.join(root, 'tmp', folderName, 'images'));
        fs.copySync(path.join(root, 'src', 'images', `${imageName}.paa`), path.join(root, 'tmp', folderName, 'images', `${imageName}.paa`));
    
        let descriptionExt = fs.readFileSync(path.join(root, 'tmp', folderName, 'description.ext')).toString(); 

        descriptionExt = descriptionExt.replace(TEMPLATE_EXT_MISSION_NAME, extMissionName);
        descriptionExt = descriptionExt.replace(TEMPLATE_IMAGE_NAME, imageName);

        fs.writeFileSync(path.join(root, 'tmp', folderName, 'description.ext'), descriptionExt);
        
        let missionSqm = fs.readFileSync(path.join(root, 'tmp', folderName, 'mission.sqm')).toString();

        missionSqm = missionSqm.replace(TEMPLATE_SQM_MISSION_NAME, sqmMissionName);
        missionSqm = missionSqm.replace(TEMPLATE_SOLDIER, soldiers[side]);
        missionSqm = missionSqm.replace(TEMPLATE_SIDE, sideName);

        fs.writeFileSync(path.join(root, 'tmp', folderName, 'mission.sqm'), missionSqm);
    }
    
    childProcess.spawn('armake', ['build', '-w', 'unquoted-string', path.join(root, 'tmp', folderName), path.join(root, 'pbo', `${folderName}.pbo`)]);

    fs.appendFileSync(path.join(root, 'missionWhitelist.dat'), `"${folderName}"\n`);
}

for (let i = 0; i < sides.length; i++) {
    for (let j = 0; j < mapKeys.length; j++) {
        generateMission(i, j);        
    }
}

fs.removeSync(path.join(root, 'tmp'));
